const organizations = [
  { id: "org-1", name: "青和醫學中心", aliases: ["青和", "青醫"], campus: "總院區", department: "病理部", address: "展示市安和路 100 號", contact: "周雅晴", phone: "02-2000-1101", email: "pathology@example.invalid" },
  { id: "org-2", name: "北辰大學", aliases: ["北辰", "北大"], campus: "生命科學校區", department: "研究儀器中心", address: "展示市學府路 25 號", contact: "楊志仁", phone: "02-2000-2202", email: "research@example.invalid" },
  { id: "org-3", name: "海岳區域醫院", aliases: ["海岳", "海醫"], campus: "第一院區", department: "檢驗科", address: "展示縣海安街 88 號", contact: "沈佳蓉", phone: "03-3000-3303", email: "lab@example.invalid" },
];

const equipment = [
  { id: "eq-1", orgId: "org-1", asset: "DEMO-2026-001", property: "PATH-CRYO-01", name: "冷凍切片機", brand: "DemoLab", model: "CRYO X70", serial: "DX70-260081", location: "病理部 B03", owner: "林怡安", warranty: "2026-09-30", status: "使用中", lastService: "2026-07-18", nextService: "2026-08-26" },
  { id: "eq-2", orgId: "org-1", asset: "DEMO-2026-002", property: "PATH-EMB-02", name: "自動包埋機", brand: "DemoLab", model: "EMBED E5", serial: "EE5-250224", location: "病理部 B05", owner: "陳柏宇", warranty: "2027-02-14", status: "使用中", lastService: "2026-06-12", nextService: "2026-09-12" },
  { id: "eq-3", orgId: "org-2", asset: "DEMO-2026-003", property: "CORE-TP-01", name: "組織脫水機", brand: "SampleTech", model: "TP-900", serial: "TP9-240517", location: "儀器中心 302", owner: "王志恆", warranty: "2026-08-20", status: "待保養", lastService: "2026-05-20", nextService: "2026-08-20" },
  { id: "eq-4", orgId: "org-2", asset: "DEMO-2026-004", property: "CORE-ST-02", name: "自動染色機", brand: "SampleTech", model: "STAIN S8", serial: "SS8-250109", location: "儀器中心 305", owner: "林怡安", warranty: "2027-01-08", status: "使用中", lastService: "2026-07-02", nextService: "2026-10-02" },
  { id: "eq-5", orgId: "org-3", asset: "DEMO-2026-005", property: "LAB-CF-03", name: "高速冷凍離心機", brand: "NorthLab", model: "CF-28R", serial: "CF28-230711", location: "檢驗科 1F", owner: "陳柏宇", warranty: "2026-07-10", status: "維修中", lastService: "2026-08-05", nextService: "2026-11-05" },
  { id: "eq-6", orgId: "org-3", asset: "DEMO-2026-006", property: "LAB-UF-04", name: "超低溫冷凍櫃", brand: "NorthLab", model: "UF-86", serial: "UF86-251008", location: "檢驗科 B1", owner: "王志恆", warranty: "2027-10-07", status: "使用中", lastService: "2026-07-28", nextService: "2027-01-28" },
];

const workOrders = [
  { no: "WO-202608-0012", eqId: "eq-1", type: "保養", date: "2026-08-26", engineer: "開放承接", status: "待執行", priority: "一般" },
  { no: "WO-202608-0011", eqId: "eq-3", type: "保養", date: "2026-08-20", engineer: "王志恆", status: "即將到期", priority: "高" },
  { no: "WO-202608-0010", eqId: "eq-5", type: "維修", date: "2026-08-15", engineer: "陳柏宇", status: "處理中", priority: "急件" },
  { no: "WO-202608-0009", eqId: "eq-2", type: "保養", date: "2026-08-12", engineer: "陳柏宇", status: "待簽名", priority: "一般" },
  { no: "WO-202608-0008", eqId: "eq-4", type: "維修", date: "2026-08-09", engineer: "林怡安", status: "已完成", priority: "一般" },
];

const engineers = [
  { name: "林怡安", title: "資深服務工程師", units: 3, devices: 8, maintenance: 12, repairs: 4, completion: 96 },
  { name: "陳柏宇", title: "服務工程師", units: 4, devices: 11, maintenance: 15, repairs: 6, completion: 92 },
  { name: "王志恆", title: "服務工程師", units: 2, devices: 7, maintenance: 10, repairs: 3, completion: 89 },
];

const state = { view: "dashboard" };
const app = document.querySelector("#app");
const modal = document.querySelector("#detailModal");
const modalContent = document.querySelector("#modalContent");
const toast = document.querySelector("#toast");
const sidebar = document.querySelector("#sidebar");
const menuButton = document.querySelector("#menuButton");

function orgFor(id) { return organizations.find((item) => item.id === id); }
function eqFor(id) { return equipment.find((item) => item.id === id); }
function statusClass(value) {
  if (["使用中", "已完成", "保固內"].includes(value)) return "ok";
  if (["待保養", "即將到期", "待執行", "待簽名"].includes(value)) return "due";
  if (["已逾期", "保固外"].includes(value)) return "overdue";
  if (["處理中", "維修中"].includes(value)) return "progress";
  return "neutral";
}
function warrantyState(item) {
  const today = new Date("2026-08-14T00:00:00+08:00");
  const end = new Date(`${item.warranty}T00:00:00+08:00`);
  return end >= today ? "保固內" : "保固外";
}
function pageHead(eyebrow, title, description, action = "展示模式") {
  return `<header class="page-head"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p>${description}</p></div><button class="demo-action" data-demo-action>${action}</button></header>`;
}

function renderDashboard() {
  return `${pageHead("DEVICECARE OVERVIEW", "儀器服務總覽", "從儀器建檔、保固、保養到維修，所有事件集中在同一條生命週期。", "新增維修工單")}
    <section class="metrics" aria-label="即時統計">
      <article class="metric teal"><small>今日／本週待辦</small><strong>8</strong><p>2 張工單開放工程師自行承接</p></article>
      <article class="metric orange"><small>即將保養</small><strong>5</strong><p>未來 30 天內應完成</p></article>
      <article class="metric red"><small>保固將到期</small><strong>2</strong><p>組織脫水機等 2 台儀器</p></article>
      <article class="metric green"><small>本月完成率</small><strong>93%</strong><p>37 張工單已完成 34 張</p></article>
    </section>
    <section class="dashboard-grid">
      <article class="panel">
        <div class="panel-head"><div><h2>近期服務工單</h2><p>點選工單或儀器可查看完整示範資料</p></div><button class="text-link" data-view-link="workorders">查看全部 →</button></div>
        ${workOrderTable(workOrders.slice(0, 4))}
      </article>
      <article class="panel">
        <div class="panel-head"><div><h2>保固快速查詢</h2><p>支援單位簡稱與儀器關鍵字</p></div></div>
        <div class="quick-search-card"><label for="warrantyQuick">輸入「青和」、「切片」或財產編號</label><input id="warrantyQuick" placeholder="例如：青和、CRYO、PATH-CRYO-01"><div id="quickWarrantyResult"><p class="hint">展示版會即時比對虛構的客戶與儀器資料。</p></div></div>
      </article>
    </section>
    <section class="panel" style="margin-top:16px"><div class="panel-head"><div><h2>近期儀器</h2><p>財產編號讓同部門的同型儀器也能清楚辨識</p></div><button class="text-link" data-view-link="equipment">查看全部 →</button></div>${equipmentTable(equipment.slice(0,5))}</section>`;
}

function equipmentTable(items) {
  return `<div class="table-wrap"><table><thead><tr><th>儀器</th><th>客戶單位</th><th>財產編號</th><th>狀態</th><th>保固</th><th>下次保養</th></tr></thead><tbody>${items.map((item) => `<tr data-equipment="${item.id}"><td><strong>${item.name}</strong><small>${item.brand} ${item.model}</small></td><td>${orgFor(item.orgId).name}<small>${orgFor(item.orgId).department}</small></td><td>${item.property}</td><td><span class="status ${statusClass(item.status)}">${item.status}</span></td><td><span class="status ${statusClass(warrantyState(item))}">${warrantyState(item)}</span><small>${item.warranty}</small></td><td>${item.nextService}</td></tr>`).join("")}</tbody></table></div>`;
}
function workOrderTable(items) {
  return `<div class="table-wrap"><table><thead><tr><th>工單編號</th><th>類型／儀器</th><th>單位</th><th>預定日期</th><th>工程師</th><th>狀態</th></tr></thead><tbody>${items.map((order) => { const item = eqFor(order.eqId); return `<tr data-equipment="${item.id}"><td><strong>${order.no}</strong></td><td>${order.type}<small>${item.name}</small></td><td>${orgFor(item.orgId).name}</td><td>${order.date}</td><td>${order.engineer}</td><td><span class="status ${statusClass(order.status)}">${order.status}</span></td></tr>`; }).join("")}</tbody></table></div>`;
}

function renderCustomers() {
  return `${pageHead("MASTER DATA", "客戶與聯絡人", "一個客戶單位可建立多位聯絡人；電話與 Email 可直接開啟。", "新增客戶單位")}
    <div class="filter-row"><input id="customerFilter" placeholder="搜尋客戶名稱、簡稱、院區或部門"><select><option>全部狀態</option><option>啟用中</option></select></div>
    <section class="list-grid" id="customerList">${customerCards(organizations)}</section>`;
}
function customerCards(items) {
  return items.map((item) => `<article class="customer-card" data-customer="${item.id}"><div><h3>${item.name}</h3><p>${item.campus}・${item.department}<br>${item.address}</p></div><div class="contact-line"><strong>主要聯絡人：${item.contact}</strong><a href="tel:${item.phone}">${item.phone}</a><a href="mailto:${item.email}">${item.email}</a></div><span class="count-pill">${equipment.filter((eq) => eq.orgId === item.id).length} 台儀器</span></article>`).join("");
}
function renderEquipment() {
  return `${pageHead("EQUIPMENT LIFECYCLE", "儀器設備", "以財產編號、序號與安全 QR Code 串接每台儀器的完整歷史。", "新增儀器")}
    <div class="filter-row"><input id="equipmentFilter" placeholder="搜尋儀器、型號、序號或財產編號"><select><option>全部單位</option>${organizations.map((org) => `<option>${org.name}</option>`).join("")}</select><select><option>全部狀態</option><option>使用中</option><option>待保養</option><option>維修中</option></select></div>
    <section class="panel">${equipmentTable(equipment)}</section>`;
}
function renderWorkOrders() {
  return `${pageHead("SERVICE WORK ORDERS", "交機・保養・維修工單", "展示工單狀態、工程師承接、雙方簽名、PDF 與寄送流程。", "新增服務工單")}
    <div class="filter-row"><input placeholder="搜尋工單編號、單位或儀器"><select><option>全部類型</option><option>交機</option><option>保養</option><option>維修</option></select><select><option>全部狀態</option><option>待執行</option><option>處理中</option><option>待簽名</option><option>已完成</option></select></div>
    <section class="panel">${workOrderTable(workOrders)}</section>`;
}
function renderMaintenance() {
  const rows = [...equipment].sort((a,b) => a.nextService.localeCompare(b.nextService));
  return `${pageHead("PREVENTIVE MAINTENANCE", "保養排程", "每台儀器可設定不同週期；未指派工單可由有空的工程師自行承接。", "立即檢查排程")}
    <section class="metrics"><article class="metric teal"><small>本月待保養</small><strong>4</strong><p>含 2 張開放承接工單</p></article><article class="metric orange"><small>未來 7 天</small><strong>2</strong><p>系統將持續發送提醒</p></article><article class="metric red"><small>已逾期</small><strong>1</strong><p>需由經理追蹤處理</p></article><article class="metric green"><small>本月已完成</small><strong>9</strong><p>完成後自動計算下次日期</p></article></section>
    <section class="panel" style="margin-top:16px"><div class="panel-head"><div><h2>儀器保養計畫</h2><p>點選儀器查看型號、序號與服務時間軸</p></div></div>${equipmentTable(rows)}</section>`;
}
function renderReports() {
  return `${pageHead("ENGINEER SERVICE REPORT", "工程師服務統計", "依人員、月份與客戶查看服務單位、非重複儀器數、完成率及逾期數。", "匯出 CSV")}
    <div class="filter-row"><select><option>2026 年 8 月</option><option>2026 年 7 月</option></select><select><option>全部工程師</option>${engineers.map((e) => `<option>${e.name}</option>`).join("")}</select><select><option>全部客戶</option>${organizations.map((org) => `<option>${org.name}</option>`).join("")}</select></div>
    <section class="engineer-grid">${engineers.map((engineer) => `<article class="engineer-card"><div class="engineer-head"><span class="avatar">${engineer.name.slice(-2)}</span><div><h3>${engineer.name}</h3><p>${engineer.title}</p></div></div><div class="engineer-numbers"><div><strong>${engineer.units}</strong><span>服務單位</span></div><div><strong>${engineer.devices}</strong><span>不重複儀器</span></div><div><strong>${engineer.maintenance + engineer.repairs}</strong><span>服務次數</span></div></div><div class="progress-bar"><span style="width:${engineer.completion}%"></span></div><div class="completion"><span>完成率</span><strong>${engineer.completion}%</strong></div></article>`).join("")}</section>
    <section class="panel" style="margin-top:16px"><div class="panel-head"><div><h2>服務明細</h2><p>保養與維修次數可回溯至原始工單</p></div></div><div class="table-wrap"><table><thead><tr><th>工程師</th><th>服務單位</th><th>保養</th><th>維修</th><th>逾期</th><th>完成率</th></tr></thead><tbody>${engineers.map((e, i) => `<tr><td><strong>${e.name}</strong></td><td>${organizations[i].name}</td><td>${e.maintenance}</td><td>${e.repairs}</td><td>${i}</td><td>${e.completion}%</td></tr>`).join("")}</tbody></table></div></section>`;
}

const views = { dashboard: renderDashboard, customers: renderCustomers, equipment: renderEquipment, workorders: renderWorkOrders, maintenance: renderMaintenance, reports: renderReports };

function render() {
  app.innerHTML = views[state.view]();
  document.querySelectorAll(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === state.view));
  bindViewEvents();
  app.focus({ preventScroll: true });
}
function bindViewEvents() {
  app.querySelectorAll("[data-view-link]").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.viewLink)));
  app.querySelectorAll("[data-equipment]").forEach((row) => row.addEventListener("click", () => openEquipment(row.dataset.equipment)));
  app.querySelectorAll("[data-customer]").forEach((card) => card.addEventListener("click", (event) => { if (!event.target.closest("a")) openCustomer(card.dataset.customer); }));
  app.querySelectorAll("[data-demo-action]").forEach((button) => button.addEventListener("click", () => showToast("展示版不會寫入資料；正式版才會執行此操作。")));
  const warrantyInput = document.querySelector("#warrantyQuick");
  if (warrantyInput) warrantyInput.addEventListener("input", () => renderQuickWarranty(warrantyInput.value));
  const customerFilter = document.querySelector("#customerFilter");
  if (customerFilter) customerFilter.addEventListener("input", () => {
    const q = normalize(customerFilter.value);
    const filtered = organizations.filter((item) => normalize([item.name, ...item.aliases, item.campus, item.department].join(" ")).includes(q));
    document.querySelector("#customerList").innerHTML = customerCards(filtered);
    document.querySelectorAll("[data-customer]").forEach((card) => card.addEventListener("click", () => openCustomer(card.dataset.customer)));
  });
  const equipmentFilter = document.querySelector("#equipmentFilter");
  if (equipmentFilter) equipmentFilter.addEventListener("input", () => {
    const q = normalize(equipmentFilter.value);
    app.querySelectorAll("tbody tr[data-equipment]").forEach((row) => { row.hidden = !normalize(row.textContent).includes(q); });
  });
}
function switchView(view) {
  state.view = view;
  sidebar.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  render();
}
function normalize(value) { return String(value || "").toLowerCase().replaceAll("臺", "台").replace(/\s/g, ""); }
function searchItems(query) {
  const q = normalize(query);
  if (!q) return [];
  return equipment.filter((item) => normalize([item.name, item.brand, item.model, item.serial, item.property, orgFor(item.orgId).name, ...orgFor(item.orgId).aliases].join(" ")).includes(q)).slice(0, 6);
}
function renderQuickWarranty(value) {
  const target = document.querySelector("#quickWarrantyResult");
  const [item] = searchItems(value);
  target.innerHTML = item ? `<div class="quick-result" data-equipment="${item.id}"><strong>${item.name}・${item.property}</strong><span>${orgFor(item.orgId).name}／保固至 ${item.warranty}</span><em>${warrantyState(item)}</em></div>` : `<p class="hint">${value ? "找不到符合的展示資料。請試試「青和」或「切片」。" : "展示版會即時比對虛構的客戶與儀器資料。"}</p>`;
  target.querySelector("[data-equipment]")?.addEventListener("click", () => openEquipment(item.id));
}
function openEquipment(id) {
  const item = eqFor(id); const org = orgFor(item.orgId);
  modalContent.innerHTML = `<p class="eyebrow">EQUIPMENT LIFECYCLE</p><h2 id="modalTitle">${item.name}</h2><p class="detail-code">${item.asset}・${item.property}</p><div class="detail-grid"><div><small>客戶單位</small><strong>${org.name}／${org.department}</strong></div><div><small>品牌與型號</small><strong>${item.brand} ${item.model}</strong></div><div><small>儀器序號</small><strong>${item.serial}</strong></div><div><small>安裝位置</small><strong>${item.location}</strong></div><div><small>保固狀態</small><strong>${warrantyState(item)}・${item.warranty}</strong></div><div><small>負責人員</small><strong>${item.owner}</strong></div></div><div class="timeline"><div class="timeline-item"><time>${item.nextService}</time><strong>預定保養</strong><p>依目前週期自動計算；工單可由工程師自行承接。</p></div><div class="timeline-item"><time>${item.lastService}</time><strong>完成定期保養</strong><p>檢查項目、照片與雙方簽名已歸檔。</p></div><div class="timeline-item"><time>2026-03-18</time><strong>儀器建檔與交機</strong><p>建立財產編號與安全 QR Code，開始儀器生命週期。</p></div></div>`;
  modal.hidden = false; document.body.style.overflow = "hidden";
}
function openCustomer(id) {
  const org = organizations.find((item) => item.id === id); const devices = equipment.filter((item) => item.orgId === id);
  modalContent.innerHTML = `<p class="eyebrow">CUSTOMER DIRECTORY</p><h2 id="modalTitle">${org.name}</h2><p class="detail-code">${org.campus}・${org.department}</p><div class="detail-grid"><div><small>主要聯絡人</small><strong>${org.contact}</strong></div><div><small>電話</small><strong><a href="tel:${org.phone}">${org.phone}</a></strong></div><div><small>電子郵件</small><strong><a href="mailto:${org.email}">${org.email}</a></strong></div><div><small>地址</small><strong>${org.address}</strong></div></div><div class="panel-head" style="margin:18px -25px 0"><div><h2>建檔儀器</h2><p>${devices.length} 台展示儀器</p></div></div>${equipmentTable(devices)}`;
  modalContent.querySelectorAll("[data-equipment]").forEach((row) => row.addEventListener("click", () => openEquipment(row.dataset.equipment)));
  modal.hidden = false; document.body.style.overflow = "hidden";
}
function closeModal() { modal.hidden = true; document.body.style.overflow = ""; }
let toastTimer;
function showToast(message) { toast.textContent = message; toast.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2600); }

document.querySelectorAll(".nav-item").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
document.querySelectorAll("[data-close-modal]").forEach((item) => item.addEventListener("click", closeModal));
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });
menuButton.addEventListener("click", () => { const open = sidebar.classList.toggle("open"); menuButton.setAttribute("aria-expanded", String(open)); });

const globalSearch = document.querySelector("#globalSearch");
const suggestions = document.querySelector("#suggestions");
globalSearch.addEventListener("input", () => {
  const items = searchItems(globalSearch.value);
  suggestions.hidden = !items.length;
  suggestions.innerHTML = items.map((item) => `<button class="suggestion" data-equipment="${item.id}"><strong>${item.name}</strong><small>${orgFor(item.orgId).name}・${item.property}</small><em>${warrantyState(item)}</em></button>`).join("");
  suggestions.querySelectorAll("[data-equipment]").forEach((button) => button.addEventListener("click", () => { openEquipment(button.dataset.equipment); suggestions.hidden = true; globalSearch.value = ""; }));
});
document.addEventListener("click", (event) => { if (!event.target.closest(".global-search")) suggestions.hidden = true; });

render();
