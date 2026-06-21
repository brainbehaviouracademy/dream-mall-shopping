/* Dream Mall '27 — app logic. Depends on data.js (loaded first). */

/* ---------------- State ---------------- */
let cart = {}; // id -> qty
let expectedMonthly = 50000;

/* ---------------- Helpers ---------------- */
const fmt = n => "₹" + Math.round(n).toLocaleString("en-IN");
const fmtShort = n => {
  if(n>=10000000) return "₹"+(n/10000000).toFixed(n%10000000?1:0)+" Cr";
  if(n>=100000) return "₹"+(n/100000).toFixed(n%100000?1:0)+" L";
  return fmt(n);
};
const annualOf = it => it.p * (it.mult||1);

// flatten items with ids
const ITEMS = {};
CATS.forEach((c,ci)=>c.items.forEach((it,ii)=>{ it.id="i"+ci+"_"+ii; it.cat=c.name; ITEMS[it.id]=it; }));

/* ---------------- Build shop ---------------- */
const shop = document.getElementById("shop");
const nav = document.getElementById("navCats");
CATS.forEach((c,ci)=>{
  const navBtn=document.createElement("button");
  navBtn.textContent=c.ico+" "+c.name;
  navBtn.dataset.target="cat"+ci;
  navBtn.onclick=()=>document.getElementById("cat"+ci).scrollIntoView({behavior:"smooth",block:"start"});
  nav.appendChild(navBtn);

  const sec=document.createElement("section");
  sec.className="cat"; sec.id="cat"+ci;
  sec.style.setProperty("--tint", c.tint || "rgba(255,46,147,.28)");
  const totalCat=c.items.length;
  sec.innerHTML=`<div class="cat-head"><span class="ico">${c.ico}</span><h2>${c.name}</h2><span class="sub">${totalCat} options</span></div>`;
  const grid=document.createElement("div"); grid.className="grid";
  c.items.forEach(it=>{
    const annual=annualOf(it);
    const card=document.createElement("div");
    card.className="item"; card.id="card_"+it.id;
    const note = it.mult ? `<small> · ${fmt(annual)}/yr</small>` : "";
    card.innerHTML=`
      <div class="thumb"><span class="badge">✓ In cart</span><span class="glyph">${it.e}</span></div>
      <div class="name">${it.n}</div>
      <div class="unit">${it.u}</div>
      <div class="price">${fmt(it.p)}${note}</div>
      <div class="row">
        <button class="add" data-id="${it.id}">Add</button>
        <div class="stepper">
          <button data-id="${it.id}" data-d="-1">−</button>
          <span class="qty" id="qty_${it.id}">0</span>
          <button data-id="${it.id}" data-d="1">+</button>
        </div>
        <span class="line-total" id="lt_${it.id}"></span>
      </div>`;
    grid.appendChild(card);
  });
  sec.appendChild(grid);
  shop.appendChild(sec);
});

/* ---------------- Cart logic ---------------- */
shop.addEventListener("click",e=>{
  const addBtn=e.target.closest(".add");
  if(addBtn){ setQty(addBtn.dataset.id, 1); bumpCartIcon(); return; }
  const step=e.target.closest(".stepper button");
  if(step){ setQty(step.dataset.id, (cart[step.dataset.id]||0)+Number(step.dataset.d)); }
});

function setQty(id, q){
  q=Math.max(0,q);
  if(q===0) delete cart[id]; else cart[id]=q;
  const it=ITEMS[id];
  const card=document.getElementById("card_"+id);
  const qel=document.getElementById("qty_"+id);
  const lt=document.getElementById("lt_"+id);
  if(q>0){
    card.classList.add("in-cart");
    qel.textContent=q;
    lt.textContent=fmtShort(annualOf(it)*q);
  } else {
    card.classList.remove("in-cart");
    qel.textContent=0; lt.textContent="";
  }
  refreshTotals();
  renderDrawer();
}

function cartTotal(){
  let t=0; for(const id in cart) t+=annualOf(ITEMS[id])*cart[id]; return t;
}

function refreshTotals(){
  const t=cartTotal();
  document.getElementById("barTotal").textContent=fmtShort(t);
  document.getElementById("drawerTotal").textContent=fmtShort(t);
  document.getElementById("checkoutBtn").disabled = t<=0;
}

function bumpCartIcon(){
  const ico=document.getElementById("cartIco");
  ico.classList.remove("pulse"); void ico.offsetWidth; ico.classList.add("pulse");
}

function renderDrawer(){
  const body=document.getElementById("drawerBody");
  const ids=Object.keys(cart);
  if(ids.length===0){
    body.innerHTML=`<div class="empty"><div class="big">🛒</div>Your cart's empty.<br>Go treat future-you.</div>`;
    return;
  }
  body.innerHTML="";
  ids.forEach(id=>{
    const it=ITEMS[id], q=cart[id];
    const row=document.createElement("div");
    row.className="cart-row";
    row.innerHTML=`
      <div class="cn"><b>${it.n}</b><span>${q} × ${fmt(annualOf(it))} /yr</span></div>
      <div class="ct">${fmtShort(annualOf(it)*q)}</div>
      <button class="rm" data-id="${id}" aria-label="Remove">🗑</button>`;
    body.appendChild(row);
  });
  body.querySelectorAll(".rm").forEach(b=>b.onclick=()=>setQty(b.dataset.id,0));
}

/* ---------------- Drawer open/close ---------------- */
const drawer=document.getElementById("drawer"), scrim=document.getElementById("scrim");
function openDrawer(){drawer.classList.add("open");scrim.classList.add("open");}
function closeDrawer(){drawer.classList.remove("open");scrim.classList.remove("open");}
document.getElementById("cartBtn").onclick=()=>{renderDrawer();openDrawer();};
document.getElementById("closeDrawer").onclick=closeDrawer;
scrim.onclick=closeDrawer;

/* ---------------- Nav active state ---------------- */
const navButtons=[...nav.querySelectorAll("button")];
const observer=new IntersectionObserver(entries=>{
  entries.forEach(en=>{
    if(en.isIntersecting){
      navButtons.forEach(b=>b.classList.toggle("active", b.dataset.target===en.target.id));
    }
  });
},{rootMargin:"-150px 0px -68% 0px"});
CATS.forEach((c,ci)=>observer.observe(document.getElementById("cat"+ci)));

/* ---------------- Tax (India new regime FY25-26, rough) ---------------- */
function taxOnGross(gross){
  const taxable=Math.max(0, gross-75000); // standard deduction
  if(taxable<=1200000) return 0;          // 87A rebate region (approx)
  const slabs=[[400000,0],[400000,.05],[400000,.10],[400000,.15],[400000,.20],[400000,.25]];
  let rem=taxable, tax=0;
  for(const [width,rate] of slabs){ const part=Math.min(rem,width); tax+=part*rate; rem-=part; if(rem<=0)break; }
  if(rem>0) tax+=rem*0.30;
  return tax*1.04; // 4% cess
}
function grossForNet(targetNet){
  let lo=targetNet, hi=targetNet*2+500000;
  for(let i=0;i<60;i++){ const mid=(lo+hi)/2; (mid-taxOnGross(mid) < targetNet)?lo=mid:hi=mid; }
  return hi;
}

/* ---------------- Reality check ---------------- */
const reality=document.getElementById("reality");
function countUp(el, target, prefix, dur=1100){
  if(matchMedia("(prefers-reduced-motion:reduce)").matches){ el.textContent=prefix(target); return; }
  const start=performance.now();
  function tick(now){
    const t=Math.min(1,(now-start)/dur);
    const e=1-Math.pow(1-t,3);
    el.textContent=prefix(target*e);
    if(t<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

let lastNeedMonthly=0;

function runRealityCheck(){
  const wants=cartTotal();
  const subtotal=wants+ESS_ANNUAL;                 // money that must be spent
  const netNeeded=subtotal/(1-SAVINGS_RATE);       // spending = 80% of take-home
  const savings=netNeeded-subtotal;
  const gross=grossForNet(netNeeded);
  const tax=gross-netNeeded;
  lastNeedMonthly=gross/12;

  // Mega total + per month wants
  countUp(document.getElementById("megaTotal"), wants, fmtShort);
  document.getElementById("perMonthWants").textContent=fmt(wants/12);

  // breakdown
  document.getElementById("bWants").textContent=fmtShort(wants);
  document.getElementById("bEssentials").textContent="+ "+fmtShort(ESS_ANNUAL);
  document.getElementById("bSavings").textContent="+ "+fmtShort(savings);
  document.getElementById("bTax").textContent="+ "+fmtShort(tax);
  document.getElementById("bGross").textContent=fmtShort(gross);

  // essentials list
  const el=document.getElementById("essentialsList");
  el.innerHTML=`<div class="eh">The cost of just existing — per year:</div><ul>`+
    ESSENTIALS.map(e=>`<li><span>${e.n}</span><span>${fmt(e.m*12)}</span></li>`).join("")+
    `</ul>`;

  // verdict
  document.getElementById("vSalaryMonth").textContent=fmtShort(gross/12)+" / month";
  document.getElementById("vNetMonth").textContent=fmtShort(netNeeded/12);
  document.getElementById("vCTC").textContent=fmtShort(gross);

  // comparison
  updateCompare();

  // top cuts
  const ranked=Object.keys(cart).map(id=>({it:ITEMS[id],amt:annualOf(ITEMS[id])*cart[id],q:cart[id]}))
    .sort((a,b)=>b.amt-a.amt).slice(0,3);
  document.getElementById("topCuts").innerHTML=ranked.map((r,i)=>
    `<div class="cut-row"><span class="rank">#${i+1}</span><span>${r.it.n} <small style="color:var(--ink-soft)">×${r.q}</small></span><span class="cv">${fmtShort(r.amt)}</span></div>`
  ).join("");

  reality.classList.add("open");
  reality.scrollTop=0;
  document.body.style.overflow="hidden";
}

function updateCompare(){
  const needM=lastNeedMonthly;
  const realM=expectedMonthly;
  const max=Math.max(needM,realM);
  document.getElementById("barNeedLabel").textContent=fmtShort(needM)+"/mo";
  document.getElementById("barRealLabel").textContent=fmtShort(realM)+"/mo";
  requestAnimationFrame(()=>{
    document.getElementById("fillNeed").style.width=(needM/max*100)+"%";
    document.getElementById("fillReal").style.width=(realM/max*100)+"%";
  });
  const mult=needM/realM;
  const mEl=document.getElementById("multiplier");
  if(mult<=1.05){
    mEl.innerHTML=`Nice — your expected income roughly covers this dream year. 👏 But notice how little room is left for surprises.`;
  } else {
    mEl.innerHTML=`To afford this, you'd need to earn about <b>${mult.toFixed(1)}×</b> what you expect to make.`;
  }
}

/* salary slider */
const salSlider=document.getElementById("salSlider"), salValue=document.getElementById("salValue");
salSlider.addEventListener("input",()=>{
  expectedMonthly=Number(salSlider.value);
  salValue.textContent=fmtShort(expectedMonthly)+" / mo";
  updateCompare();
});

/* ---------------- Controls ---------------- */
document.getElementById("checkoutBtn").onclick=()=>{ closeDrawer(); runRealityCheck(); };
function closeReality(){ reality.classList.remove("open"); document.body.style.overflow=""; }
document.getElementById("rClose").onclick=closeReality;
document.getElementById("btnTrim").onclick=()=>{ closeReality(); openDrawer(); };
document.getElementById("btnReset").onclick=()=>{
  Object.keys(cart).forEach(id=>setQty(id,0));
  closeReality();
  window.scrollTo({top:0,behavior:"smooth"});
};

/* init */
refreshTotals();
renderDrawer();
salValue.textContent=fmtShort(expectedMonthly)+" / mo";
