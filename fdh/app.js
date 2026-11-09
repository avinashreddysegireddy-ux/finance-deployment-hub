const KEY = "fdh-deployments-v1";
const STATUS = {pending:"Pending approval", approved:"Approved", deployed:"Deployed", rolled:"Rolled back"};
const seed = [
  {id:1, service:"General Ledger API", version:"2.4.1", env:"Production", owner:"Priya N.", status:"deployed"},
  {id:2, service:"Payments Gateway", version:"5.0.0", env:"Staging", owner:"Marcus L.", status:"approved"},
  {id:3, service:"Invoice Reconciler", version:"1.9.3", env:"Production", owner:"Aisha K.", status:"pending"},
  {id:4, service:"Tax Engine", version:"3.2.0", env:"Dev", owner:"Tom R.", status:"rolled"}
];
let items = load();
let filter = "All";

function load(){
  try { const r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch(e){}
  return seed.slice();
}
function save(){ try { localStorage.setItem(KEY, JSON.stringify(items)); } catch(e){} }
function esc(s){ return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

function render(){
  const count = s => items.filter(i => i.status === s).length;
  document.getElementById("stats").innerHTML =
    [["Total", items.length],["Awaiting approval", count("pending")],["Live in production", items.filter(i=>i.status==="deployed" && i.env==="Production").length],["Rolled back", count("rolled")]]
    .map(([l,n]) => `<div><b>${n}</b><span>${l}</span></div>`).join("");

  document.getElementById("filters").innerHTML =
    ["All","Dev","Staging","Production"].map(f => `<button class="chip" aria-pressed="${f===filter}" data-f="${f}">${f}</button>`).join("") +
    `<span class="spacer"></span><button class="link" id="reset">Reset sample data</button>`;

  const list = items.filter(i => filter === "All" || i.env === filter);
  document.getElementById("rows").innerHTML = list.map(i => `
    <tr>
      <td>${esc(i.service)}</td>
      <td class="ver">v${esc(i.version)}</td>
      <td>${esc(i.env)}</td>
      <td>${esc(i.owner)}</td>
      <td><span class="badge s-${i.status}">${STATUS[i.status]}</span></td>
      <td>${actions(i)}</td>
    </tr>`).join("");
  document.getElementById("empty").hidden = list.length > 0;
}

function actions(i){
  const b = (a, t) => `<button class="act" data-id="${i.id}" data-a="${a}">${t}</button>`;
  if (i.status === "pending")  return b("approved","Approve") + b("remove","Remove");
  if (i.status === "approved") return b("deployed","Deploy") + b("remove","Remove");
  if (i.status === "deployed") return b("rolled","Roll back");
  return b("pending","Resubmit") + b("remove","Remove");
}

document.addEventListener("click", e => {
  const t = e.target.closest("button"); if (!t) return;
  if (t.dataset.f) { filter = t.dataset.f; render(); }
  else if (t.id === "reset") { items = seed.slice(); save(); render(); }
  else if (t.dataset.a) {
    const id = +t.dataset.id;
    if (t.dataset.a === "remove") items = items.filter(i => i.id !== id);
    else items = items.map(i => i.id === id ? {...i, status:t.dataset.a} : i);
    save(); render();
  }
});

document.getElementById("add").addEventListener("submit", e => {
  e.preventDefault();
  const v = id => document.getElementById(id).value.trim();
  items.unshift({id:Date.now(), service:v("svc"), version:v("ver"), env:v("env"), owner:v("own"), status:"pending"});
  e.target.reset(); document.getElementById("env").value = "Production";
  save(); render();
});

render();
