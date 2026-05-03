let data = { integrations: [], regions: [], statuses: [], history: [] };
let editing    = null;
let cellState  = null;
let integState = null;
let phaseState = null;
let activeBrand = 'Nissan';
let plannerBrand = 'Nissan';

// Dashboard Filter State
let dashboardFilterStatuses = new Set();
let dashboardFilterRegions  = new Set();
let dashboardHideDone      = false;
let dashboardOnlyBlocked   = false;
let dashboardOnlyNotes     = false;

// Planner Filter State
let plannerFilterStatuses = new Set();
let plannerFilterBatches  = new Set();
let plannerFilterRegions  = new Set();
let plannerFilterSearch   = '';
let plannerFilterDateStart = '';
let plannerFilterDateEnd   = '';
let plannerHideDone      = false;
let plannerOnlyBlocked   = false;
let plannerOnlyNotes     = false;

let bulkMode      = false;
let isMouseDown   = false;
let selectedCells = new Set();
let expandedBatches = new Set();
let currentView = 'dashboard';

const STATUSES = ['none', 'progress', 'done', 'blocked'];
const STATUS_LABELS = { none: 'Not Started', progress: 'In Progress', done: 'Done', blocked: 'Blocked' };

const DEFAULT_INTEGRATIONS = [
  { name:'Dealer', subItems:['V1 Dealer','V2 Dealer'], uat2Date: '2026-03-05', prodDate: '2026-03-25', description:'V1 Dealer & V2 Dealer (Pilot). Rollout: APAC 25 Mar–20 May 2026 · EU 03–10 Jun 2026 · US 17–24 Jun 2026. Drop-dead: 15 Jul 2026.', createdAt:'2026-04-24', updatedAt:'2026-04-24' },
  { name:'Batch A', subItems:['V2 Models','V2 Offers','V2 eim2spec','One10 Login','One10 Store'], uat2Date: '2026-05-07', prodDate: '2026-05-26', description:'Models, Offers, eim2spec Connectors-Pim, One10 Login & Store. UAT2: 07 May 2026 · Prod APAC: 26 May 2026.', createdAt:'2026-04-24', updatedAt:'2026-04-24' },
  { name:'Batch B', subItems:['V2 Utils','V2 Finance','HOYU Connector','Santander NNE Api','Santander NNE Login','V2 Webhook Notification'], uat2Date: '2026-07-16', prodDate: '2026-08-03', description:'Utils, Finance calculator, HOYU, Santander NNE connectors, Webhook Notification. UAT2: 16 Jul 2026 · Prod: 03 Aug 2026.', createdAt:'2026-04-24', updatedAt:'2026-04-24' },
  { name:'Batch C', subItems:['V2 Status','V2 Bookings','V2 Trade-in','Generative Search','Personalisation','FranceBee2Link','NMA Autograb','Tradein UK','Tradein Autohausen'], uat2Date: '', prodDate: '', description:'Status, Bookings, Trade-in & regional connectors. Relies on Santander NNE (Batch B). No dedicated drop-dead date.', createdAt:'2026-04-24', updatedAt:'2026-04-24' },
  { name:'Batch D', subItems:['V2 Ecommerce','Ecomm Dealers','Ecomm Orders','Ecomm Assets','Ecomm Products','Ecomm TradeIn','Ecomm BTO','Ecomm Accounts','Ecomm Payment','Ecomm Inventory','Ecomm Finance','SFCC Store','SFCC Token','NE-IE RegistrationFee','NE-IE Token Management'], uat2Date: '2026-08-20', prodDate: '2026-09-07', description:'Full ecommerce suite. UAT2: 20 Aug 2026 · Prod: 07 Sep 2026 · Drop-dead: 28 Sep 2026.', createdAt:'2026-04-24', updatedAt:'2026-04-24' },
  { name:'Batch E', subItems:['Accessories','Account Profile','Configurator','ConfiguratorPrice','Honeypot','LeadsLog','nodeSQSConnector'], uat2Date: '2026-08-20', prodDate: '2026-09-07', description:'Accessories, Account Profile, Configurator, Honeypot, LeadsLog. UAT2: 20 Aug 2026 · Prod: 07 Sep 2026 · Drop-dead: 28 Sep 2026.', createdAt:'2026-04-24', updatedAt:'2026-04-24' },
  { name:'Batch F', subItems:['Leads V2','Adobe Campaign Login','Adobe Campaign Store','MS Dynamics Yana Login','MS Dynamics Yana Store','Datadise Login','Datadise Store','Lead Mgmt WR3FE11','Lead Mgmt WRSFE10','NCI Login','NCI Store'], uat2Date: '2026-09-10', prodDate: '2026-09-28', description:'Leads V2, Adobe Campaign, MS Dynamics Yana, Datadise, Lead Management, NCI connectors. Drop-dead: 19 Oct 2026.', createdAt:'2026-04-24', updatedAt:'2026-04-24' },
  { name:'Batch G', subItems:['VegaCRM Login','VegaCRM Store','SugarCRM Login','SugarCRM Store','Salesforce Login','Salesforce Store','ZohoCRM Login','ZohoCRM Store','MS Dynamics Login','MS Dynamics Store','NNA Login','NNA Store','CEBIP','Nissan Europe ESB','SCV Store'], uat2Date: '2026-09-10', prodDate: '2026-09-28', description:'CRM connectors: VegaCRM, SugarCRM, Salesforce, ZohoCRM, MS Dynamics, NNA, CEBIP, Nissan Europe ESB, SCV. Drop-dead: 19 Oct 2026.', createdAt:'2026-04-24', updatedAt:'2026-04-24' },
  { name:'Batch H', subItems:['Workato Store','Workato Login','CDR Login','CDR Store','CA Login','CA Store','EU Adobe Campaign Login','EU Adobe Campaign Store','CA Opportunity Login','CA Opportunity Store','AutoCRM Store','SICOP Store','LMT MS Dynamics Store','KR CRM Store'], uat2Date: '2026-09-10', prodDate: '2026-09-28', description:'Workato, CDR, CA, EU Adobe Campaign, CA Opportunity, AutoCRM, SICOP, LMT MS Dynamics, KR CRM connectors. Drop-dead: 19 Oct 2026.', createdAt:'2026-04-24', updatedAt:'2026-04-24' },
  { name:'MO Japan', subItems:['Japan GuestServices','Japan FinancialServices','Japan FinanceSimulation','Japan OwnerServices','Japan OwnerServicesVehicles','Japan LocationServices','Japan LoginServices','Japan MyNissan'], uat2Date: '2026-04-16', prodDate: '2026-04-22', description:'Japan nlink channels managed by MO/Japan FE team. UAT: 16 Apr 2026 ✓ · Prod: 22 Apr 2026 (Planned) · Drop-dead: 13 May 2026.', createdAt:'2026-04-24', updatedAt:'2026-04-24' },
  { name:'MO PIM', subItems:['PIM PaceAuthorization','PIM DataAuthoring'], uat2Date: '2026-04-23', prodDate: '2026-04-30', description:'PIM Proxy managed by NDI team. V2-ChannelsPIM-PaceAuthorization & DataAuthoring. Drop-dead: 21 May 2026.', createdAt:'2026-04-24', updatedAt:'2026-04-24' },
  { name:'MO Americas', subItems:['UserRecognition Authorization','UserRecognition Data'], uat2Date: '2026-05-13', prodDate: '2026-05-20', description:'V2-ChannelsAmericas: UserRecognitionAuthorization & UserRecognition-Data managed by CM. Drop-dead: 10 Jun 2026.', createdAt:'2026-04-24', updatedAt:'2026-04-24' },
  { name:'MO Owner Svcs', subItems:['V3 Users Nissan','V2 Users Nissan','V2 Users FavoriteDealers','V2 Account Nissan','NE-ESB OwnerServices','NE OwnerServices Connector','NNA OwnerServices WSO2','Owner Services Picklist','SFV3-NE Token','SFV3-NNA Token','SFV3-NE OIDC ESB','SFV3-NNA OIDC WSO2','V2 Connector SMIT','V2 Connector AOPreferenceCentre'], uat2Date: '2026-04-23', prodDate: '2026-04-30', description:'Owner Services V2/V3 migration in 3 phases managed by MO team.', createdAt:'2026-04-24', updatedAt:'2026-04-24' }
];

// ── Helpers ───────────────────────────────────────

function getStatusObj(statuses, key) {
  const v = statuses[key]; if (!v) return { status: 'none', note: '', updatedAt: null };
  return { status: v.status || 'none', note: v.note || '', updatedAt: v.updatedAt || null };
}

function getEffectiveStatus(regionId, integName, marketName, statuses) {
  const batch = data.integrations.find(i => i.name === integName);
  const selfKey = `${integName}|${marketName}`;
  const selfObj = getStatusObj(statuses, selfKey);
  if (!batch?.subItems?.length) return selfObj;
  let hasBlocked = false, hasProgress = false, allDone = true, hasStarted = false;
  batch.subItems.forEach(s => {
    const subKey = `${integName}:${s}|${marketName}`;
    const subObj = getStatusObj(statuses, subKey);
    if (subObj.status === 'blocked')  hasBlocked = true;
    if (subObj.status === 'progress') hasProgress = true;
    if (subObj.status !== 'done')     allDone = false;
    if (subObj.status !== 'none')     hasStarted = true;
  });
  let rollupStatus = 'none';
  if (hasBlocked) rollupStatus = 'blocked'; else if (allDone) rollupStatus = 'done'; else if (hasStarted) rollupStatus = 'progress';
  return { ...selfObj, status: rollupStatus, isRollup: true };
}


function calculateProgress(regionId, integName, statuses) {
  const batch = data.integrations.find(i => i.name === integName);
  const region = data.regions.find(r => r.id === regionId);
  const markets = region?.markets || [];
  if (!batch || !markets.length) return 0;
  let total = 0, done = 0;
  if (batch.subItems?.length) {
    batch.subItems.forEach(s => {
      const full = `${integName}:${s}`;
      markets.forEach(m => { total++; if (getStatusObj(statuses, `${full}|${m.name}`).status === 'done') done++; });
    });
  } else {
    markets.forEach(m => { total++; if (getStatusObj(statuses, `${integName}|${m.name}`).status === 'done') done++; });
  }
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

function isOverdue(prodDate, status) {
  if (!prodDate || status === 'done') return false;
  return new Date(prodDate) < new Date();
}

function logHistory(regionId, integName, marketName, oldStatus, newStatus) {
  if (!data.history) data.history = [];
  const region = data.regions.find(r => r.id === regionId);
  const entry = {
    timestamp: new Date().toISOString(),
    region: region?.name || regionId,
    item: integName,
    market: marketName,
    from: oldStatus,
    to: newStatus
  };
  data.history.unshift(entry);
  if (data.history.length > 500) data.history.pop();
}

// ── Boot & Save ───────────────────────────────────

async function init() {
  initTheme();
  try {
    const res = await fetch('/api/data');
    data = await res.json();
    if (!data.integrations) data.integrations = DEFAULT_INTEGRATIONS;
    if (!data.regions)      data.regions = [];
    if (!data.statuses)     data.statuses = {};
    if (!data.history)      data.history = [];
    if (!data.phases)       data.phases = [];
    if (!data.globalStatus) data.globalStatus = {};
    data.regions.forEach(r => {
      if (!r.markets) r.markets = [];
      if (!data.statuses[r.id]) data.statuses[r.id] = {};
    });
  } catch (err) { data = { integrations: DEFAULT_INTEGRATIONS, regions: [], statuses: {}, history: [], phases: [], globalStatus: {} }; }

  const wrap = document.getElementById('dashboard-wrap');
  const stBtn = document.getElementById('scroll-top-btn');
  if (wrap && stBtn) {
    let ticking = false;
    wrap.onscroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (wrap.scrollTop > 300) stBtn.classList.add('visible');
          else stBtn.classList.remove('visible');
          ticking = false;
        });
        ticking = true;
      }
    };
    stBtn.onclick = () => wrap.scrollTo({ top: 0, behavior: 'smooth' });
  }
  setView('dashboard');
}

async function saveData() {
  try {
    console.log("Saving data with globalStatus:", data.globalStatus);
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) console.error("Save error:", res.status, res.statusText);
    else console.log("Data saved successfully");
  } catch (err) { console.error("Save failed:", err); }
}

// ── Interaction Logic ─────────────────────────────

document.addEventListener('mousedown', () => { isMouseDown = true; });
document.addEventListener('mouseup',   () => { isMouseDown = false; });

function handleCellClick(regionId, integName, marketName) {
  const key = `${regionId}|${integName}|${marketName}`;
  if (bulkMode) {
    if (selectedCells.has(key)) selectedCells.delete(key); else selectedCells.add(key);
    syncBulkBar(); render();
  } else {
    if (integName.includes(':')) cycleStatus(regionId, integName, marketName);
    else openCellPanel(regionId, integName, marketName);
  }
}

function handleCellMouseEnter(regionId, integName, marketName) {
  if (bulkMode && isMouseDown) {
    const key = `${regionId}|${integName}|${marketName}`;
    if (!selectedCells.has(key)) { selectedCells.add(key); syncBulkBar(); render(); }
  }
}

function cycleStatus(regionId, integName, marketName) {
  const statuses = data.statuses[regionId] || {};
  const key = `${integName}|${marketName}`;
  const obj = getStatusObj(statuses, key);
  const next = STATUSES[(STATUSES.indexOf(obj.status) + 1) % STATUSES.length];
  logHistory(regionId, integName, marketName, obj.status, next);
  if (!data.statuses[regionId]) data.statuses[regionId] = {};
  if (next === 'none' && !obj.note) delete data.statuses[regionId][key];
  else data.statuses[regionId][key] = { ...obj, status: next, updatedAt: today() };
  saveData(); render();
}

function setView(viewName) {
  currentView = viewName;
  document.querySelectorAll('.view-content').forEach(v => v.classList.add('hidden'));
  const el = document.getElementById(`view-${viewName}`); if (el) el.classList.remove('hidden');
  document.querySelectorAll('.nav-link').forEach(b => b.classList.toggle('active', b.dataset.value === viewName));

  // Hide both sidebars
  const dashboardSidebar = document.getElementById('dashboard-filter-sidebar');
  const plannerSidebar = document.getElementById('planner-filter-sidebar');
  if (dashboardSidebar) dashboardSidebar.classList.add('hidden');
  if (plannerSidebar) plannerSidebar.classList.add('hidden');

  // Show and initialize the correct sidebar
  if (viewName === 'dashboard') {
    if (dashboardSidebar) dashboardSidebar.classList.remove('hidden');
    initDashboardFilters();
  } else if (viewName === 'planner') {
    if (plannerSidebar) plannerSidebar.classList.remove('hidden');
    initPlannerFilters();
  }

  const wrap = document.getElementById('dashboard-wrap');
  if (wrap) wrap.scrollTo({ top: 0, behavior: 'smooth' });
  render();
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  document.getElementById('theme-toggle').textContent = newTheme === 'dark' ? '☀️' : '🌑';
}

function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('theme-toggle').textContent = theme === 'dark' ? '☀️' : '🌑';
}

let activitySearch = '';
let activityRegion = 'all';
let activityDateStart = '';
let activityDateEnd = '';

function renderActivityView() {
  const container = document.getElementById('activity-container'); if (!container) return;
  const history = data.history || [];
  const brandToggle = document.getElementById('activity-brand-toggle');
  if (brandToggle) {
    brandToggle.innerHTML = `<div class="brand-tabs" style="padding:0; flex-direction:row; height:32px;">
      <button class="brand-tab ${activeBrand === 'Nissan' ? 'active' : ''}" data-brand="Nissan" data-action="set-brand" style="padding:4px 12px; font-size:10px;">Nissan</button>
      <button class="brand-tab ${activeBrand === 'INFINITI' ? 'active' : ''}" data-brand="INFINITI" data-action="set-brand" style="padding:4px 12px; font-size:10px;">Infiniti</button>
    </div>`;
  }
  const brandRegions = new Set(data.regions.filter(r => r.brand === activeBrand).map(r => r.name));
  const filtered = history.filter(h => {
    if (!brandRegions.has(h.region)) return false;
    const matchesRegion = activityRegion === 'all' || h.region === activityRegion;
    const matchesSearch = !activitySearch || h.item.toLowerCase().includes(activitySearch.toLowerCase()) || h.market.toLowerCase().includes(activitySearch.toLowerCase()) || h.region.toLowerCase().includes(activitySearch.toLowerCase());
    const hDate = h.timestamp.split('T')[0];
    const matchesStart = !activityDateStart || hDate >= activityDateStart;
    const matchesEnd = !activityDateEnd || hDate <= activityDateEnd;
    return matchesRegion && matchesSearch && matchesStart && matchesEnd;
  });
  const availableRegions = [...brandRegions].sort();
  const regionSelect = document.getElementById('activity-region-filter');
  if (regionSelect) regionSelect.innerHTML = `<option value="all">All Regions</option>` + availableRegions.map(r => `<option value="${esc(r)}" ${activityRegion === r ? 'selected' : ''}>${esc(r)}</option>`).join('');
  const latestFirst = [...filtered].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const groups = [];
  latestFirst.forEach(h => {
    const last = groups[groups.length - 1];
    const hTime = new Date(h.timestamp).getTime();
    const canGroup = last && last.region === h.region && Math.abs(last.latestTime - hTime) < 60000;
    if (canGroup) last.items.push(h);
    else groups.push({ region: h.region, latestTime: hTime, items: [h] });
  });
  const itemsHtml = groups.map(g => {
    const time = new Date(g.latestTime).toLocaleString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
    if (g.items.length === 1) {
      const h = g.items[0];
      return `<div class="activity-row"><div class="activity-time">${time}</div><div class="activity-desc"><b>${esc(h.region)}</b> · ${esc(h.market)} · <b>${esc(h.item)}</b></div><div class="activity-change"><span class="pip pip-${h.from}"></span> <span style="color:var(--muted)">→</span> <span class="pip pip-${h.to}"></span></div></div>`;
    } else {
      const subItems = g.items.map(h => `<div class="activity-sub-row"><div class="activity-desc">${esc(h.market)} · ${esc(h.item)}</div><div class="activity-change"><span class="pip pip-${h.from}"></span> <span style="color:var(--muted)">→</span> <span class="pip pip-${h.to}"></span></div></div>`).join('');
      return `<div class="activity-group"><details><summary class="activity-row activity-group-header"><div class="activity-time">${time}</div><div class="activity-desc"><b>${esc(g.region)}</b> · <span class="activity-count">${g.items.length} updates</span></div><div class="activity-toggle-icon">^</div></summary><div class="activity-group-content">${subItems}</div></details></div>`;
    }
  }).join('');
  container.innerHTML = filtered.length ? itemsHtml : '<div style="text-align:center; padding: 40px; color: var(--muted)">No matching activity found.</div>';
  const searchInp = document.getElementById('activity-search');
  searchInp.oninput = (e) => { activitySearch = e.target.value; renderActivityView(); };
  searchInp.value = activitySearch;
  regionSelect.onchange = (e) => { activityRegion = e.target.value; renderActivityView(); };
  const startInp = document.getElementById('activity-date-start');
  startInp.onchange = (e) => { activityDateStart = e.target.value; renderActivityView(); };
  startInp.value = activityDateStart;
  const endInp = document.getElementById('activity-date-end');
  endInp.onchange = (e) => { activityDateEnd = e.target.value; renderActivityView(); };
  endInp.value = activityDateEnd;
}

function toggleBatch(regionId, batchName) {
  const key = `${regionId}|${batchName}`;
  if (expandedBatches.has(key)) expandedBatches.delete(key); else expandedBatches.add(key);
  render();
}

function toggleSelectBatch(regionId, batchName) {
  if (!bulkMode) toggleBulkMode();
  const region = data.regions.find(r => r.id === regionId);
  const batch = data.integrations.find(i => i.name === batchName);
  if (!batch || !region) return;
  let allSel = true;
  batch.subItems.forEach(s => {
    const key = `${regionId}|${batchName}:${s}`;
    region.markets.forEach(m => { if (!selectedCells.has(`${key}|${m.name}`)) allSel = false; });
  });
  batch.subItems.forEach(s => {
    const full = `${batchName}:${s}`;
    region.markets.forEach(m => { const key = `${regionId}|${full}|${m.name}`; if (allSel) selectedCells.delete(key); else selectedCells.add(key); });
  });
  syncBulkBar(); render();
}

function toggleSelectRow(regionId, integName) {
  if (!bulkMode) toggleBulkMode();
  const region = data.regions.find(r => r.id === regionId); if (!region) return;
  let allSel = true;
  region.markets.forEach(m => { if (!selectedCells.has(`${regionId}|${integName}|${m.name}`)) allSel = false; });
  region.markets.forEach(m => { const key = `${regionId}|${integName}|${m.name}`; if (allSel) selectedCells.delete(key); else selectedCells.add(key); });
  syncBulkBar(); render();
}

// ── Rendering Functions ───────────────────────────

function render() {
  if (currentView === 'summary')  { renderSummaryView();  return; }
  if (currentView === 'activity') { renderActivityView(); return; }
  if (currentView === 'planner')  { renderPlannerView();  return; }
  renderDashboard();
}

function renderDashboard() {
  const container = document.getElementById('dashboard'); if (!container) return;
  const gs = data.globalStatus || {};

  // Filter integrations based on dashboard filters
  const filteredIntegrations = data.integrations.filter(integ => {
    const st = gs[integ.name] || 'none';
    // Apply status filters
    if (dashboardFilterStatuses.size > 0 && !dashboardFilterStatuses.has(st)) return false;
    // Apply special filters
    if (dashboardHideDone && st === 'done') return false;
    if (dashboardOnlyBlocked && st !== 'blocked') return false;
    return true;
  });

  const totalSubs = filteredIntegrations.reduce((a, i) => a + (i.subItems?.length || 0), 0);
  const doneCount = filteredIntegrations.filter(i => gs[i.name] === 'done').length;
  let rows = '';
  filteredIntegrations.forEach(integ => {
    const overdue = isOverdue(integ.prodDate, 'none');
    const subCnt = integ.subItems?.length || 0;
    const isExp = expandedBatches.has(`cl|${integ.name}`);
    const st = gs[integ.name] || 'none';
    rows += `<tr class="cl-row${overdue ? ' cl-row-overdue' : ''}">
      <td class="cl-status-cell">
        <button class="cl-status-btn ${st}" data-action="cycle-status" data-integ="${esc(integ.name)}" title="${STATUS_LABELS[st]}"></button>
      </td>
      <td class="cl-name-cell">
        <div class="cl-name-inner">
          ${subCnt > 0 ? `<button class="btn-toggle" data-action="toggle-cl" data-integ="${esc(integ.name)}">${isExp ? '^' : '>'}</button>` : '<span style="width:22px;display:inline-block"></span>'}
          <span class="cl-integ-name${st === 'done' ? ' cl-done-text' : ''}" data-action="open-integ" data-region="" data-integ="${esc(integ.name)}">${esc(integ.name)}</span>
          ${overdue ? '<span class="cl-overdue-tag">OVERDUE</span>' : ''}
        </div>
      </td>
      <td class="cl-cell cl-muted">${subCnt > 0 ? subCnt + ' proxies' : '—'}</td>
      <td class="cl-cell">${integ.uat2Date ? formatDate(integ.uat2Date) : '—'}</td>
      <td class="cl-cell${overdue ? ' cl-red' : ''}">${integ.prodDate ? formatDate(integ.prodDate) : '—'}</td>
      <td class="cl-del-cell"><button class="btn-del-integ" data-action="del-integ" data-integ="${esc(integ.name)}">X</button></td>
    </tr>`;
    if (isExp && subCnt > 0) {
      integ.subItems.forEach(sub => {
        const subKey = `${integ.name}:${sub}`;
        const subSt = gs[subKey] || 'none';
        rows += `<tr class="cl-sub-row">
          <td class="cl-status-cell"><button class="cl-status-btn ${subSt} cl-status-sm" data-action="cycle-status" data-integ="${esc(subKey)}" title="${STATUS_LABELS[subSt]}"></button></td>
          <td class="cl-name-cell" colspan="5"><div class="cl-name-inner" style="padding-left:36px"><span class="sub-item-label" data-action="open-integ" data-region="" data-integ="${esc(subKey)}">${esc(sub)}</span></div></td>
        </tr>`;
      });
    }
  });
  const addRow = editing?.type === 'add-integ'
    ? `<tr><td colspan="6" style="padding:8px 16px"><input class="inline-input input-integ" placeholder="New Integration…"/></td></tr>`
    : `<tr class="row-add"><td colspan="6"><div class="row-add-actions"><button class="btn-add-row" data-action="add-integ">+ Add Integration</button></div></td></tr>`;
  const progress = data.integrations.length > 0 ? Math.round((doneCount / data.integrations.length) * 100) : 0;
  container.innerHTML = `<div class="checklist-wrap">
    <div class="checklist-header">
      <div class="checklist-title">Global Integrations</div>
      <div class="checklist-meta">${doneCount} / ${data.integrations.length} done · ${totalSubs} proxies total</div>
      <div class="phase-progress-bar" style="margin-top:12px;">
        <div class="phase-progress-fill" style="width:${progress}%"></div>
      </div>
      <div class="phase-progress-label" style="justify-content:flex-start; gap:6px;">
        <span>${progress}% Complete</span>
      </div>
    </div>
    <table class="checklist-table">
      <thead><tr>
        <th class="cl-th" style="width:44px"></th>
        <th class="cl-th">Integration</th>
        <th class="cl-th">Proxies</th>
        <th class="cl-th">UAT2 Date</th>
        <th class="cl-th">Prod Date</th>
        <th class="cl-th"></th>
      </tr></thead>
      <tbody>${rows}${addRow}</tbody>
    </table>
  </div>`;
  container.onmouseover = e => {
    const el = e.target.closest('[data-integ]'); if (!el) return;
    const nm = el.dataset.integ; if (!nm) return;
    let obj = data.integrations.find(i => i.name === nm);
    if (!obj && nm.includes(':')) obj = data.integrations.find(i => i.name === nm.split(':')[0]);
    if (obj) showTooltip(e, obj.description, !nm.includes(':'), obj);
  };
  container.onmouseout = hideTooltip;
  focusInput();
}

function renderPlannerView() {
  const container = document.getElementById('planner-container'); if (!container) return;
  const allPhases = data.phases || [];
  const phases = allPhases.filter(p => {
    if ((p.brand || 'Nissan') !== plannerBrand) return false;
    if (!phasePassesFilter(p)) return false;
    return true;
  });

  // Group by month
  const monthMap = {};
  phases.forEach(phase => {
    let key = 'no-date', label = 'No Date';
    if (phase.date) {
      const d = new Date(phase.date);
      key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      label = d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    }
    if (!monthMap[key]) monthMap[key] = { label, phases: [] };
    monthMap[key].phases.push(phase);
  });
  const months = Object.keys(monthMap).sort().map(k => monthMap[k]);

  const buildTile = phase => {
    const integCount = phase.integrations?.length || 0;
    const integPills = (phase.integrations || []).map(batchName => {
    const batch = data.integrations.find(i => i.name === batchName);
    const subItems = batch?.subItems || [];
    const itemsText = subItems.length > 0 ? subItems.map(s => esc(s)).join(', ') : 'No items';
    return `<span class="phase-integ-pill" title="${itemsText}">${esc(batchName)}</span>`;
  }).join('');
    const regionTiles = (phase.regions || []).map(pr => {
      const reg = data.regions.find(r => r.id === pr.regionId); if (!reg) return '';
      const mTags = (pr.markets || []).map(m => `<span class="phase-market-tag">${esc(m)}</span>`).join('');
      return `<div class="phase-region-tile"><div class="phase-region-name">${esc(reg.name)}</div><div class="phase-market-tags">${mTags || '<span class="phase-no-mkt">All markets</span>'}</div></div>`;
    }).join('');

    const phaseStatus = phase.status || 'none';
    const statusLabel = STATUS_LABELS[phaseStatus] || 'Not Started';
    let progress = 0;
    if (phase.integrations?.length > 0) {
      const doneCount = (phase.integrations || []).filter(iName => {
        const integ = data.integrations.find(i => i.name === iName);
        const gs = data.globalStatus || {};
        return gs[iName] === 'done';
      }).length;
      progress = Math.round((doneCount / phase.integrations.length) * 100);
    }

    return `<div class="phase-tile" data-action="view-phase" data-phase="${phase.id}">
      <div class="phase-tile-header">
        <div class="phase-tile-meta">
          <div class="phase-tile-name">${esc(phase.name)}</div>
          ${phase.date ? `<div class="phase-tile-date">${formatDate(phase.date)}</div>` : ''}
        </div>
        <div class="phase-tile-btns">
          <button class="phase-edit-btn" data-action="edit-phase" data-phase="${phase.id}">Edit</button>
          <button class="phase-del-btn" data-action="del-phase" data-phase="${phase.id}">X</button>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
        <span class="phase-status-badge phase-status-${phaseStatus}">${statusLabel}</span>
        <span style="font-size:11px; color:var(--muted); font-weight:600;">${progress}% Complete</span>
      </div>
      <div class="phase-progress-bar">
        <div class="phase-progress-fill" style="width:${progress}%"></div>
      </div>
      <div style="display:flex; align-items:flex-start; gap:8px; margin-bottom:6px;">
        <div style="font-size:11px; font-weight:600; color:var(--muted); flex-shrink:0; min-width:90px; padding-top:4px;">INTEGRATIONS (${integCount})</div>
        <div class="phase-integ-pills" style="flex:1;">${integPills || '<span class="phase-no-integ">No integrations</span>'}</div>
      </div>
      <div style="display:flex; align-items:flex-start; gap:8px; margin-bottom:6px;">
        <div style="font-size:11px; font-weight:600; color:var(--muted); flex-shrink:0; min-width:90px; padding-top:4px;">REGIONS</div>
        <div class="phase-regions-row" style="flex:1;">${regionTiles || '<span class="phase-no-integ">No regions assigned</span>'}</div>
      </div>
    </div>`;
  };

  const monthsHtml = months.length === 0
    ? `<div class="phases-empty">No phases for ${plannerBrand} yet. Click <b>+ New Phase</b> to create one.</div>`
    : months.map(m => `
        <div class="month-section">
          <div class="month-header">
            <span class="month-label">${m.label}</span>
            <span class="month-count">${m.phases.length} phase${m.phases.length !== 1 ? 's' : ''}</span>
          </div>
          <div class="phases-grid">${m.phases.map(buildTile).join('')}</div>
        </div>`).join('');

  const nissanCount = allPhases.filter(p => (p.brand || 'Nissan') === 'Nissan').length;
  const infinitiCount = allPhases.filter(p => p.brand === 'INFINITI').length;

  container.innerHTML = `<div class="planner-wrap">
    <div class="planner-hdr">
      <div>
        <div class="planner-title">Release Planner</div>
        <div class="planner-sub">${phases.length} phase${phases.length !== 1 ? 's' : ''} · ${plannerBrand}</div>
      </div>
      <button class="btn-new-phase" data-action="new-phase">+ New Phase</button>
    </div>
    <div class="planner-brand-tabs">
      <button class="planner-brand-tab ${plannerBrand === 'Nissan' ? 'active' : ''}" data-action="set-planner-brand" data-brand="Nissan">Nissan <span class="planner-brand-count">${nissanCount}</span></button>
      <button class="planner-brand-tab ${plannerBrand === 'INFINITI' ? 'active' : ''}" data-action="set-planner-brand" data-brand="INFINITI">Infiniti <span class="planner-brand-count">${infinitiCount}</span></button>
    </div>
    <div class="planner-months">${monthsHtml}</div>
  </div>`;
}

function openPhaseDetail(phaseId) {
  const phase = (data.phases || []).find(p => p.id === phaseId); if (!phase) return;
  document.getElementById('pdp-name').textContent = phase.name;
  const dateVal = document.getElementById('pdp-date-val');
  if (dateVal) dateVal.textContent = phase.date ? formatDate(phase.date) : 'No date set';
  const brandEl = document.getElementById('pdp-brand');
  brandEl.textContent = phase.brand || 'Nissan';
  brandEl.className = `pdp-brand-badge ${(phase.brand || 'Nissan') === 'INFINITI' ? 'pdp-infiniti' : 'pdp-nissan'}`;

  const phaseStatus = phase.status || 'none';
  const statusLabel = STATUS_LABELS[phaseStatus] || 'Not Started';
  const statusEl = document.getElementById('pdp-status');
  statusEl.textContent = statusLabel;
  statusEl.className = `phase-status-badge phase-status-${phaseStatus}`;

  let progress = 0;
  if (phase.integrations?.length > 0) {
    const doneCount = (phase.integrations || []).filter(iName => {
      const integ = data.integrations.find(i => i.name === iName);
      const gs = data.globalStatus || {};
      return gs[iName] === 'done';
    }).length;
    progress = Math.round((doneCount / phase.integrations.length) * 100);
  }
  document.getElementById('pdp-progress').textContent = `${progress}% Complete`;
  document.getElementById('pdp-progress-fill').style.width = `${progress}%`;

  const integHtml = (phase.integrations || []).map(batchName => {
    const batch = data.integrations.find(i => i.name === batchName);
    const subItems = batch?.subItems || [];
    const itemsList = subItems.length > 0
      ? subItems.map(s => `<span style="font-size:11px; padding:2px 6px; background:var(--white); border:1px solid var(--border); border-radius:4px; display:inline-block;">${esc(s)}</span>`).join(' ')
      : '<span style="font-size:11px; color:var(--muted); font-style:italic;">No sub-items</span>';
    return `<div style="margin-bottom:8px;"><div style="font-size:12px; font-weight:600; color:var(--text); margin-bottom:4px;">${esc(batchName)}</div><div style="display:flex; flex-wrap:wrap; gap:4px;">${itemsList}</div></div>`;
  }).join('');
  document.getElementById('pdp-integrations').innerHTML = integHtml || '<span style="color:var(--muted);font-size:12px;font-style:italic;">No integrations assigned</span>';

  const regionTiles = (phase.regions || []).map(pr => {
    const reg = data.regions.find(r => r.id === pr.regionId); if (!reg) return '';
    const mTags = (pr.markets || []).map(m => `<span class="phase-market-tag">${esc(m)}</span>`).join('');
    return `<div class="phase-region-tile" style="margin-bottom:8px"><div class="phase-region-name">${esc(reg.name)}</div><div class="phase-market-tags">${mTags || '<span class="phase-no-mkt">All markets</span>'}</div></div>`;
  }).join('');
  document.getElementById('pdp-regions').innerHTML = regionTiles || '<span style="color:var(--muted);font-size:12px;font-style:italic">No regions assigned</span>';

  document.getElementById('pdp-edit-btn').dataset.phase = phaseId;
  document.getElementById('panel-overlay').classList.remove('hidden');
  document.getElementById('phase-detail-panel').classList.remove('hidden');
}

function closePhaseDetailPanel() { const el = document.getElementById('phase-detail-panel'); if (el) el.classList.add('hidden'); }

function openPhasePanel(phaseId) {
  const phase = phaseId ? (data.phases || []).find(p => p.id === phaseId) : null;
  phaseState = { id: phaseId, regions: phase?.regions || [] };
  document.getElementById('pp-name').value = phase?.name || '';
  document.getElementById('pp-date').value = phase?.date || '';
  document.getElementById('pp-brand').value = phase?.brand || plannerBrand;
  document.getElementById('pp-status').value = phase?.status || 'none';

  const selInteg = new Set(phase?.integrations || []);
  document.getElementById('pp-integrations').innerHTML = data.integrations.map(i =>
    `<label class="pp-cb-label"><input type="checkbox" class="pp-integ-cb" value="${esc(i.name)}" ${selInteg.has(i.name) ? 'checked' : ''}/>
    <span>${esc(i.name)}</span>${i.prodDate ? `<span class="pp-hint">${formatDate(i.prodDate)}</span>` : ''}</label>`
  ).join('');

  renderPhaseRegionPills();
  const delBtn = document.getElementById('pp-del-btn');
  if (delBtn) delBtn.style.display = phaseId ? 'inline-flex' : 'none';
  document.getElementById('panel-overlay').classList.remove('hidden');
  document.getElementById('phase-panel').classList.remove('hidden');
}

function renderPhaseRegionPills() {
  const pillsContainer = document.getElementById('pp-regions-pills');
  const regions = phaseState.regions || [];

  if (regions.length === 0) {
    pillsContainer.innerHTML = '';
    return;
  }

  pillsContainer.innerHTML = regions.map(r => {
    const region = data.regions.find(reg => reg.id === r.regionId);
    const marketNames = (r.markets || []).join(', ');
    return `
      <div class="region-pill" title="${region?.name}: ${marketNames}">
        <span>${region?.name}${r.markets?.length ? ` (${r.markets.length})` : ''}</span>
        <span class="region-pill-close" data-region-id="${r.regionId}" onclick="removeRegionFromPhase('${r.regionId}')">X</span>
      </div>
    `;
  }).join('');
}

function removeRegionFromPhase(regionId) {
  if (!phaseState.regions) phaseState.regions = [];
  phaseState.regions = phaseState.regions.filter(r => r.regionId !== regionId);
  renderPhaseRegionPills();
}

function openRegionModal() {
  const modal = document.getElementById('region-selector-modal');
  const listContainer = document.getElementById('region-selector-list');
  const searchInput = document.getElementById('region-search');
  if (!modal || !listContainer) return;

  const selectedRegionIds = new Set((phaseState.regions || []).map(r => r.regionId));

  const renderRegionList = (searchTerm = '') => {
    const filtered = data.regions.filter(r => {
      const matchName = r.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchMarket = r.markets.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchName || matchMarket;
    });

    listContainer.innerHTML = filtered.map(region => {
      const isSelected = selectedRegionIds.has(region.id);
      const marketsList = region.markets.map(m => `
        <label class="region-selector-market" style="display:block; padding:4px 12px;">
          <input type="checkbox" class="region-market-check" data-region="${region.id}" value="${esc(m.name)}" ${(phaseState.regions || []).some(r => r.regionId === region.id && r.markets.includes(m.name)) ? 'checked' : ''} />
          <span>${esc(m.name)}</span>
        </label>
      `).join('');

      return `
        <div class="region-selector-region">
          <label class="region-selector-title">
            <input type="checkbox" class="region-region-check" data-region="${region.id}" ${isSelected ? 'checked' : ''} />
            <span><strong>${esc(region.name)}</strong></span>
          </label>
          <div>${marketsList || '<p style="color:var(--muted);font-size:11px;padding:6px 12px 6px 28px;">No markets</p>'}</div>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.region-region-check').forEach(cb => {
      cb.addEventListener('change', e => {
        const regionId = e.target.dataset.region;
        const marketChecks = listContainer.querySelectorAll(`.region-market-check[data-region="${regionId}"]`);
        if (e.target.checked) {
          marketChecks.forEach(m => m.disabled = false);
          marketChecks.forEach(m => m.checked = true);
        } else {
          marketChecks.forEach(m => { m.checked = false; m.disabled = false; });
        }
      });
    });
  };

  renderRegionList();
  searchInput.value = '';
  searchInput.oninput = e => renderRegionList(e.target.value);

  modal.classList.remove('hidden');
}

function closeRegionModal() {
  const modal = document.getElementById('region-selector-modal');
  if (modal) modal.classList.add('hidden');
}

function applyRegionSelection() {
  const listContainer = document.getElementById('region-selector-list');
  const regMap = {};
  listContainer.querySelectorAll('.region-market-check:checked').forEach(cb => {
    const regionId = cb.dataset.region;
    if (!regMap[regionId]) regMap[regionId] = [];
    regMap[regionId].push(cb.value);
  });

  phaseState.regions = Object.entries(regMap).map(([regionId, markets]) => ({ regionId, markets }));
  renderPhaseRegionPills();
  closeRegionModal();
}

function savePhasePanel() {
  const name = document.getElementById('pp-name').value.trim(); if (!name) { document.getElementById('pp-name').focus(); return; }
  const date = document.getElementById('pp-date').value;
  const brand = document.getElementById('pp-brand').value || plannerBrand;
  const status = document.getElementById('pp-status').value || 'none';
  const integrations = [...document.querySelectorAll('.pp-integ-cb:checked')].map(c => c.value);
  const regions = phaseState.regions || [];
  if (!data.phases) data.phases = [];
  if (phaseState?.id) {
    const p = data.phases.find(p => p.id === phaseState.id);
    if (p) Object.assign(p, { name, date, brand, status, integrations, regions });
  } else {
    data.phases.push({ id: slug('ph'), name, date, brand, status, integrations, regions });
  }
  saveData().then(() => { closePanels(); render(); });
}

function deletePhaseFromPanel() {
  if (!phaseState?.id || !confirm('Delete this phase?')) return;
  data.phases = (data.phases || []).filter(p => p.id !== phaseState.id);
  saveData().then(() => { closePanels(); render(); });
}

function closePhasePanel() { phaseState = null; const el = document.getElementById('phase-panel'); if (el) el.classList.add('hidden'); }

function cycleDashboardStatus(key) {
  if (!data.globalStatus) data.globalStatus = {};
  const cur = data.globalStatus[key] || 'none';
  const next = STATUSES[(STATUSES.indexOf(cur) + 1) % STATUSES.length];
  if (next === 'none') delete data.globalStatus[key];
  else data.globalStatus[key] = next;

  // If batch with sub-items, update all sub-items to match
  const batch = data.integrations.find(i => i.name === key);
  if (batch && batch.subItems?.length) {
    batch.subItems.forEach(sub => {
      const subKey = `${key}:${sub}`;
      if (next === 'none') delete data.globalStatus[subKey];
      else data.globalStatus[subKey] = next;
    });
  }

  // If sub-item, update parent batch status
  if (key.includes(':')) {
    const batchName = key.split(':')[0];
    updateBatchStatusFromGlobal(batchName);
  }

  saveData(); render();
}

function updateBatchStatusFromGlobal(batchName) {
  const batch = data.integrations.find(i => i.name === batchName);
  if (!batch || !batch.subItems?.length) return;

  if (!data.globalStatus) data.globalStatus = {};

  let hasBlocked = false, hasProgress = false, allDone = true, hasStarted = false;

  // Check all sub-items in global status
  batch.subItems.forEach(sub => {
    const subKey = `${batchName}:${sub}`;
    const st = data.globalStatus[subKey] || 'none';
    if (st === 'blocked') hasBlocked = true;
    if (st === 'progress') hasProgress = true;
    if (st !== 'done') allDone = false;
    if (st !== 'none') hasStarted = true;
  });

  // Compute rollup status
  let rollupStatus = 'none';
  if (hasBlocked) rollupStatus = 'blocked';
  else if (allDone) rollupStatus = 'done';
  else if (hasProgress) rollupStatus = 'progress';

  // Update global status
  if (rollupStatus === 'none') delete data.globalStatus[batchName];
  else data.globalStatus[batchName] = rollupStatus;
}

function toggleChecklistBatch(integName) {
  const key = `cl|${integName}`;
  if (expandedBatches.has(key)) expandedBatches.delete(key); else expandedBatches.add(key);
  render();
}

function buildRegionBlock(region) {
  const el = document.createElement('div'); el.className = 'region-block';
  const statuses = data.statuses[region.id] || {};
  let totalItems = 0, doneItems = 0;
  data.integrations.forEach(integ => {
    region.markets.forEach(m => {
      if (integ.subItems?.length) integ.subItems.forEach(s => { totalItems++; if (getStatusObj(statuses, `${integ.name}:${s}|${m.name}`).status === 'done') doneItems++; });
      else { totalItems++; if (getStatusObj(statuses, `${integ.name}|${m.name}`).status === 'done') doneItems++; }
    });
  });
  const regionPercent = totalItems === 0 ? 0 : Math.round((doneItems / totalItems) * 100);
  const nameHtml = (editing?.type === 'rename' && editing.regionId === region.id)
    ? `<input class="inline-input input-rename" value="${esc(region.name)}"/>`
    : `<div class="region-badge" data-action="rename" data-region="${region.id}"><span>${esc(region.name)}</span><div class="progress-pill"><div class="progress-fill" style="width:${regionPercent}%"></div></div><span class="percent-text">${regionPercent}%</span></div>`;
  el.innerHTML = `<div class="region-header"><div class="region-header-left">${nameHtml}<div class="region-meta">${region.markets.length} Markets</div></div><div class="region-controls"><button class="btn-ctrl danger" data-action="del-region" data-region="${region.id}">Delete Region</button></div></div><div class="region-body">${buildTable(region)}</div>`;
  return el;
}

function buildTable(region) {
  const { id, markets = [] } = region; const statuses = data.statuses[id] || {};
  const isAddMarket = editing?.type === 'add-market' && editing.regionId === id;
  const marketThs = markets.map(m => {
    const isEditingGroup = editing?.type === 'edit-market-group' && editing.regionId === id && editing.marketName === m.name;
    const groupHtml = isEditingGroup 
      ? `<input class="inline-input input-group" value="${esc(m.group || '')}" placeholder="Group…"/>`
      : `<div class="market-group-label" data-action="edit-market-group" data-region="${id}" data-market="${esc(m.name)}">${esc(m.group || '·')}</div>`;
    return `<th class="th-market"><div class="th-market-inner">${groupHtml}<span class="th-market-name">${esc(m.name)}</span><button class="btn-del-market" data-action="del-market" data-region="${id}" data-value="${esc(m.name)}">X</button></div></th>`;
  }).join('');
  const addMarketTh = isAddMarket ? `<th class="th-add-market" style="padding:6px 10px;min-width:110px"><input class="inline-input input-market" placeholder="Market…"/></th>` : `<th class="th-add-market"><button class="btn-add-col" data-action="add-market" data-region="${id}">+</button></th>`;
  let rows = '';
  data.integrations.forEach(integ => {
    if (!passesFilter(integ.name, markets, id)) return;
    rows += buildIntegRow(integ, markets, id, statuses);
    if (expandedBatches.has(`${id}|${integ.name}`) && integ.subItems?.length) {
      integ.subItems.forEach(sub => { rows += buildSubItemRow(integ.name, sub, markets, id, statuses); });
    }
  });
  if (editing?.type === 'add-integ') rows += `<tr><td class="td-integ"><div class="td-integ-inner"><input class="inline-input input-integ" placeholder="New Integration…"/></div></td>${markets.map(() => '<td class="td-status"></td>').join('')}<td class="td-status-pad"></td></tr>`;
  rows += `<tr class="row-add"><td colspan="${markets.length + 2}"><div class="row-add-actions"><button class="btn-add-row" data-action="add-integ">+ Add Global Integration</button></div></td></tr>`;
  return `<table class="region-table"><thead><tr><th class="th-integ-col"></th>${marketThs}${addMarketTh}</tr></thead><tbody>${rows}</tbody></table>`;
}

function buildIntegRow(integ, markets, regionId, statuses) {
  const isExpanded = expandedBatches.has(`${regionId}|${integ.name}`);
  const hasSubs = integ.subItems?.length > 0;
  const statusTds = markets.map(m => {
    const eff = getEffectiveStatus(regionId, integ.name, m.name, statuses);
    const isSel = selectedCells.has(`${regionId}|${integ.name}|${m.name}`);
    return `<td class="td-status"><button class="status-cell ${eff.status} ${isSel ? 'selected-bulk' : ''} ${eff.isRollup ? 'is-rollup' : ''}" onmousedown="handleCellClick('${regionId}', \`${esc(integ.name)}\`, '${esc(m.name)}')" onmouseenter="handleCellMouseEnter('${regionId}', \`${esc(integ.name)}\`, '${esc(m.name)}')" data-integ="${esc(integ.name)}" data-market="${esc(m.name)}">${eff.note?.trim() ? '<span class="note-dot"></span>' : ''}</button></td>`;
  }).join('');
  const overdue = isOverdue(integ.prodDate, 'none');
  const prodDateStr = integ.prodDate ? `<span class="integ-prod-date ${overdue ? 'overdue' : ''}">(Prod: ${esc(formatDate(integ.prodDate))})</span>` : '';
  const batchProgress = calculateProgress(regionId, integ.name, statuses);
  return `<tr class="tr-batch-header"><td class="td-integ"><div class="td-integ-inner"><div class="integ-label">${hasSubs ? `<button class="btn-toggle" data-action="toggle-batch" data-region="${regionId}" data-integ="${esc(integ.name)}">${isExpanded ? '^' : '>'}</button>` : ''}<div class="integ-name-wrap"><span class="integ-name-btn ${overdue ? 'overdue-pulse' : ''}" data-action="open-integ" data-region="${regionId}" data-integ="${esc(integ.name)}">${esc(integ.name)}</span>${prodDateStr}<span class="percent-text" style="font-size:9px;">${batchProgress}%</span></div><div class="batch-actions-inline" style="display:flex; gap:4px; margin-left:auto;"><button class="btn-select-all" data-action="select-row" data-region="${regionId}" data-integ="${esc(integ.name)}">Row</button>${(hasSubs && isExpanded) ? `<button class="btn-select-all" data-action="select-batch" data-region="${regionId}" data-integ="${esc(integ.name)}">Batch</button>` : ''}</div></div><button class="btn-del-integ" data-action="del-integ" data-integ="${esc(integ.name)}">X</button></div></td>${statusTds}<td class="td-status-pad"></td></tr>`;
}

function buildSubItemRow(parentName, subName, markets, regionId, statuses) {
  const full = `${parentName}:${subName}`;
  const statusTds = markets.map(m => {
    const obj = getStatusObj(statuses, `${full}|${m.name}`);
    const isSel = selectedCells.has(`${regionId}|${full}|${m.name}`);
    return `<td class="td-status"><button class="status-cell sc-sub ${obj.status} ${isSel ? 'selected-bulk' : ''}" onmousedown="handleCellClick('${regionId}', \`${esc(full)}\`, '${esc(m.name)}')" onmouseenter="handleCellMouseEnter('${regionId}', \`${esc(full)}\`, '${esc(m.name)}')" data-integ="${esc(full)}" data-market="${esc(m.name)}">${obj.note?.trim() ? '<span class="note-dot"></span>' : ''}</button></td>`;
  }).join('');
  return `<tr class="tr-sub-item"><td class="td-integ td-integ-sub"><div class="td-integ-inner" style="padding-left: 48px;"><span class="sub-item-label" data-action="open-integ" data-region="${regionId}" data-integ="${esc(full)}">${esc(subName)}</span><button class="btn-select-all" data-action="select-row" data-region="${regionId}" data-integ="${esc(full)}" title="Select whole row">Row</button></div></td>${statusTds}<td class="td-status-pad"></td></tr>`;
}

// ── Global Events & Modal Actions ─────────────────

document.body.onclick = e => {
  const el = e.target.closest('[data-action]'); if (!el) return;
  const { action, value, brand, region, integ, market } = el.dataset;
  if      (action === 'set-brand') setBrand(brand);
  else if (action === 'set-view') setView(value);
  else if (action === 'toggle-theme') toggleTheme();
  else if (action === 'toggle-bulk') toggleBulkMode();
  else if (action === 'apply-bulk') applyBulkStatus(value);
  else if (action === 'reset-filters') resetFilters();
  else if (action === 'close-panels') closePanels();
  else if (action === 'save-cell') saveCellPanel();
  else if (action === 'save-integ') saveIntegPanel();
  else if (action === 'move-integ-action') moveIntegToBatch();
  else if (action === 'del-integ-panel') deleteIntegFromPanel();
  else if (action === 'export-csv') exportCSV();
  else if (action === 'export-pdf') window.print();
  else if (action === 'open-integ') openIntegPanel(el.dataset.region || '', el.dataset.integ);
  else if (action === 'del-integ') removeInteg(el.dataset.integ);
  else if (action === 'add-integ') { editing = { type: 'add-integ' }; render(); }
  else if (action === 'toggle-cl') toggleChecklistBatch(el.dataset.integ);
  else if (action === 'cycle-status') cycleDashboardStatus(el.dataset.integ);
  else if (action === 'new-phase') openPhasePanel(null);
  else if (action === 'edit-phase') { e.stopPropagation(); openPhasePanel(el.dataset.phase); }
  else if (action === 'del-phase') { e.stopPropagation(); if (confirm('Delete this phase?')) { data.phases = (data.phases||[]).filter(p => p.id !== el.dataset.phase); saveData().then(() => render()); } }
  else if (action === 'save-phase') savePhasePanel();
  else if (action === 'del-phase-panel') deletePhaseFromPanel();
  else if (action === 'view-phase') openPhaseDetail(el.dataset.phase);
  else if (action === 'edit-phase-from-detail') { closePhaseDetailPanel(); openPhasePanel(el.dataset.phase); }
  else if (action === 'set-planner-brand') { plannerBrand = el.dataset.brand; renderPlannerView(); }
  else if (action === 'edit-regions') openRegionModal();
  else if (action === 'close-region-modal') closeRegionModal();
  else if (action === 'apply-regions') applyRegionSelection();
};

function exportCSV() {
  const regions = data.regions.filter(r => r.brand === activeBrand);
  let csv = 'Region,Integration,Market,Status,Rollout (Prod)\n';
  regions.forEach(r => {
    const statuses = data.statuses[r.id] || {};
    data.integrations.forEach(integ => {
      const items = [{ name: integ.name, prod: integ.prodDate }];
      if (integ.subItems) integ.subItems.forEach(s => items.push({ name: `${integ.name}:${s}`, prod: '' }));
      items.forEach(item => { r.markets.forEach(m => { const st = getStatusObj(statuses, `${item.name}|${m.name}`).status; const statusLabel = STATUS_LABELS[st] || 'Not Started'; csv += `"${r.name}","${item.name}","${m.name}","${statusLabel}","${item.prod || ''}"\n`; }); });
    });
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${activeBrand}_Integration_Tracker_${today()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function attachEvents(root) {
  root.onclick = e => {
    const el = e.target.closest('[data-action]'); if (!el) return; e.stopPropagation();
    const { action, region, integ, market, value } = el.dataset;
    if      (action === 'open-cell') handleCellClick(region, integ, market);
    else if (action === 'open-integ') openIntegPanel(region, integ);
    else if (action === 'toggle-batch') toggleBatch(region, integ);
    else if (action === 'select-batch') toggleSelectBatch(region, integ);
    else if (action === 'select-row') toggleSelectRow(region, integ);
    else if (action === 'rename') { editing = { type: 'rename', regionId: region }; render(); }
    else if (action === 'edit-market-group') { editing = { type: 'edit-market-group', regionId: region, marketName: market }; render(); }
    else if (action === 'del-region') deleteRegion(region);
    else if (action === 'add-market') { editing = { type: 'add-market', regionId: region }; render(); }
    else if (action === 'del-market') removeMarket(region, value);
    else if (action === 'add-integ') { editing = { type: 'add-integ' }; render(); }
    else if (action === 'del-integ') removeInteg(integ);
    else if (action === 'add-region') { editing = { type: 'add-region' }; render(); }
  };
  root.onmouseover = e => {
    const el = e.target.closest('[data-integ]'); if (!el || el.classList.contains('status-cell')) return;
    const { integ } = el.dataset;
    let obj = data.integrations.find(i => i.name === integ);
    if (!obj && integ.includes(':')) obj = data.integrations.find(i => i.name === integ.split(':')[0]);
    if (obj) showTooltip(e, obj.description, !integ.includes(':'), obj);
  };
  root.onmouseout = hideTooltip;
}

// ── Core Logic ────────────────────────────────────

async function applyBulkStatus(status) {
  const affectedBatches = new Set();
  selectedCells.forEach(key => {
    const [regionId, integName, marketName] = key.split('|');
    if (!data.statuses[regionId]) data.statuses[regionId] = {};
    const existing = getStatusObj(data.statuses[regionId], integName + '|' + marketName);
    logHistory(regionId, integName, marketName, existing.status, status);
    const update = (k, ex, st) => { if (st === 'none' && !ex.note) delete data.statuses[regionId][k]; else data.statuses[regionId][k] = { ...ex, status: st, updatedAt: today() }; };
    update(integName + '|' + marketName, existing, status);
    const batch = data.integrations.find(i => i.name === (integName.includes(':') ? integName.split(':')[0] : integName));
    if (batch && batch.subItems?.length && !integName.includes(':')) {
      batch.subItems.forEach(s => { const subK = `${integName}:${s}|${marketName}`; const subEx = getStatusObj(data.statuses[regionId], subK); logHistory(regionId, subK, marketName, subEx.status, status); update(subK, subEx, status); });
      affectedBatches.add(integName);
    } else if (integName.includes(':')) {
      const batchName = integName.split(':')[0];
      affectedBatches.add(batchName);
    }
  });

  // Update global status for affected batches
  affectedBatches.forEach(batchName => updateBatchGlobalStatus(batchName));

  selectedCells.clear(); bulkMode = false; syncBulkBar(); await saveData(); render();
}

function openCellPanel(regionId, integName, marketName) {
  closeIntegPanel(); const statuses = data.statuses[regionId] || {}; const obj = getStatusObj(statuses, `${integName}|${marketName}`);
  cellState = { regionId, integName, marketName, selectedStatus: obj.status };
  document.getElementById('cp-integ').textContent = integName; document.getElementById('cp-market').textContent = marketName;
  document.getElementById('cp-note').value = obj.note || ''; renderCpStatusGrid(obj.status);
  const existingHistory = document.getElementById('cp-history-section'); if (existingHistory) existingHistory.remove();
  const historyContainer = document.createElement('div'); historyContainer.id = 'cp-history-section';
  historyContainer.innerHTML = `<div class="panel-section-label" style="margin-top:20px">Recent Changes</div><div id="cp-history-list" class="history-list"></div>`;
  document.querySelector('#cell-panel .panel-body').appendChild(historyContainer);
  const list = document.getElementById('cp-history-list');
  const relevantHistory = (data.history || []).filter(h => h.item === integName && h.market === marketName).slice(0, 5);
  if (relevantHistory.length === 0) list.innerHTML = `<div class="history-empty">No changes recorded yet.</div>`;
  else list.innerHTML = relevantHistory.map(h => `<div class="history-item"><div class="history-meta"><span class="history-time">${new Date(h.timestamp).toLocaleString('en-GB', {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span></div><div class="history-change"><span class="pip pip-${h.from}"></span><span class="history-arrow">→</span><span class="pip pip-${h.to}"></span></div></div>`).join('');
  document.getElementById('panel-overlay').classList.remove('hidden'); document.getElementById('cell-panel').classList.remove('hidden');
}

function renderCpStatusGrid(selected) {
  const grid = document.getElementById('cp-status-grid'); if (!grid) return; grid.innerHTML = '';
  STATUSES.forEach(s => {
    const btn = document.createElement('button'); btn.className = `cp-status-btn${s === selected ? ' selected' : ''}`;
    btn.innerHTML = `<span class="cp-dot ${s}"></span><span class="cp-status-label">${STATUS_LABELS[s]}</span>`;
    btn.onclick = () => { cellState.selectedStatus = s; grid.querySelectorAll('.cp-status-btn').forEach(b => b.classList.remove('selected')); btn.classList.add('selected'); };
    grid.appendChild(btn);
  });
}

function saveCellPanel() {
  if (!cellState) return; const { regionId, integName, marketName, selectedStatus } = cellState; const note = document.getElementById('cp-note').value.trim();
  if (!data.statuses[regionId]) data.statuses[regionId] = {}; const key = `${integName}|${marketName}`;
  const existing = getStatusObj(data.statuses[regionId], key); logHistory(regionId, integName, marketName, existing.status, selectedStatus);
  const update = (k, ex, st, nt) => { if (st === 'none' && !nt) delete data.statuses[regionId][k]; else data.statuses[regionId][k] = { status: st, note: nt, updatedAt: today() }; };
  update(key, existing, selectedStatus, note);
  const batch = data.integrations.find(i => i.name === integName);
  if (batch && batch.subItems?.length) { batch.subItems.forEach(s => { const subK = `${integName}:${s}|${marketName}`; const subEx = getStatusObj(data.statuses[regionId], subK); logHistory(regionId, subK, marketName, subEx.status, selectedStatus); update(subK, subEx, selectedStatus, subEx.note); }); }

  // Update batch global status
  const batchName = integName.includes(':') ? integName.split(':')[0] : integName;
  updateBatchGlobalStatus(batchName);

  saveData().then(() => { closePanels(); render(); });
}

function openIntegPanel(regionId, integName) {
  closeCellPanel(); let main = integName, isSub = false; if (integName.includes(':')) { [main] = integName.split(':'); isSub = true; }
  const integ = data.integrations.find(i => i.name === main); if (!integ) return;
  integState = { regionId, integName, isSub };
  const subPart = isSub ? integName.split(':')[1] : '';
  document.getElementById('ip-name').value = isSub ? subPart : integ.name;
  document.getElementById('ip-desc').value = integ.description || '';
  document.getElementById('ip-subs').value = (integ.subItems || []).join('\n');
  document.getElementById('ip-dev-start').value = integ.devStart || '';
  document.getElementById('ip-act-dev-start').value = integ.actDevStart || '';
  document.getElementById('ip-dev-end').value = integ.devEnd || '';
  document.getElementById('ip-act-dev-end').value = integ.actDevEnd || '';
  document.getElementById('ip-uat2').value = integ.uat2Date || '';
  document.getElementById('ip-act-uat2').value = integ.actUat2Date || '';
  document.getElementById('ip-prod').value = integ.prodDate || '';
  document.getElementById('ip-act-prod').value = integ.actProdDate || '';
  document.getElementById('ip-desc-section').style.display = isSub ? 'none' : 'block';
  document.getElementById('ip-schedule-section').style.display = isSub ? 'none' : 'block';
  document.getElementById('ip-subs-section').style.display = isSub ? 'none' : 'block';
  document.getElementById('ip-move-section').style.display = isSub ? 'block' : 'none';
  if (isSub) {
    const select = document.getElementById('ip-move-target'); select.innerHTML = '<option value="">Select Target Batch...</option>';
    data.integrations.forEach(i => { if (i.name !== main) { const opt = document.createElement('option'); opt.value = i.name; opt.textContent = i.name; select.appendChild(opt); } });
  }
  document.getElementById('ip-name').disabled = isSub;
  document.getElementById('panel-overlay').classList.remove('hidden'); document.getElementById('integ-panel').classList.remove('hidden');
}

function moveIntegToBatch() {
  if (!integState || !integState.isSub) return;
  const target = document.getElementById('ip-move-target').value; if (!target) return;
  const [oldParent, subName] = integState.integName.split(':');
  const oldObj = data.integrations.find(i => i.name === oldParent);
  const newObj = data.integrations.find(i => i.name === target);
  if (!oldObj || !newObj) return;
  oldObj.subItems = oldObj.subItems.filter(s => s !== subName);
  if (!newObj.subItems) newObj.subItems = []; newObj.subItems.push(subName);
  Object.keys(data.statuses).forEach(rid => {
    const rs = data.statuses[rid];
    Object.keys(rs).forEach(k => { if (k.startsWith(`${oldParent}:${subName}|`)) { const nk = `${target}:${subName}|${k.split('|')[1]}`; rs[nk] = rs[k]; delete rs[k]; } });
  });
  saveData().then(() => { closePanels(); render(); });
}

function saveIntegPanel() {
  if (!integState || integState.isSub) { if (integState?.isSub) closePanels(); return; }
  const { integName } = integState; const integ = data.integrations.find(i => i.name === integName); if (!integ) return;
  const newName = document.getElementById('ip-name').value.trim(); if (!newName) return;
  if (newName !== integName) {
    Object.keys(data.statuses).forEach(rid => {
      Object.keys(data.statuses[rid]).forEach(k => {
        if (k.startsWith(`${integName}|`)) { data.statuses[rid][`${newName}|${k.split('|')[1]}`] = data.statuses[rid][k]; delete data.statuses[rid][k]; }
        else if (k.startsWith(`${integName}:`)) { data.statuses[rid][`${newName}:${k.split('|')[0].split(':')[1]}|${k.split('|')[1]}`] = data.statuses[rid][k]; delete data.statuses[rid][k]; }
      });
    });
    integ.name = newName;
  }
  integ.description = document.getElementById('ip-desc').value.trim();
  integ.subItems = document.getElementById('ip-subs').value.split('\n').map(s => s.trim()).filter(Boolean);
  integ.devStart = document.getElementById('ip-dev-start').value;
  integ.actDevStart = document.getElementById('ip-act-dev-start').value;
  integ.devEnd = document.getElementById('ip-dev-end').value;
  integ.actDevEnd = document.getElementById('ip-act-dev-end').value;
  integ.uat2Date = document.getElementById('ip-uat2').value.trim();
  integ.actUat2Date = document.getElementById('ip-act-uat2').value;
  integ.prodDate = document.getElementById('ip-prod').value.trim();
  integ.actProdDate = document.getElementById('ip-act-prod').value;
  integ.updatedAt = today(); saveData().then(() => { closePanels(); render(); });
}

// ── Reporting & Filters ───────────────────────────

function getGlobalStats() {
  let total = 0, done = 0, blocked = 0, overdueCount = 0;
  const regions = data.regions.filter(r => r.brand === activeBrand);
  regions.forEach(r => {
    const statuses = data.statuses[r.id] || {};
    data.integrations.forEach(integ => {
      const items = integ.subItems?.length ? integ.subItems.map(s => `${integ.name}:${s}`) : [integ.name];
      items.forEach(name => { r.markets.forEach(m => { total++; const st = getStatusObj(statuses, `${name}|${m.name}`).status; if (st === 'done') done++; if (st === 'blocked') blocked++; }); });
      if (integ.prodDate && isOverdue(integ.prodDate, 'none')) overdueCount++;
    });
  });
  return { percent: total === 0 ? 0 : Math.round((done / total) * 100), done, blocked, overdue: overdueCount, total };
}

function calculateGlobalBatchProgress(integName) {
  let total = 0, done = 0;
  const regions = data.regions.filter(r => r.brand === activeBrand);
  regions.forEach(r => {
    const statuses = data.statuses[r.id] || {};
    const integ = data.integrations.find(i => i.name === integName);
    if (!integ) return;
    const items = integ.subItems?.length ? integ.subItems.map(s => `${integ.name}:${s}`) : [integ.name];
    items.forEach(name => { r.markets.forEach(m => { total++; if (getStatusObj(statuses, `${name}|${m.name}`).status === 'done') done++; }); });
  });
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

function getBatchRegionalStatuses(integName) {
  const regions = data.regions.filter(r => r.brand === activeBrand);
  return regions.map(r => {
    const statuses = data.statuses[r.id] || {};
    const integ = data.integrations.find(i => i.name === integName);
    if (!integ) return { name: r.name, status: 'none' };
    
    const items = integ.subItems?.length ? integ.subItems.map(s => `${integ.name}:${s}`) : [integ.name];
    let hasBlocked = false, allDone = true, hasProgress = false, hasStarted = false;
    
    items.forEach(name => {
      r.markets.forEach(m => {
        const st = getStatusObj(statuses, `${name}|${m.name}`).status;
        if (st === 'blocked')  hasBlocked = true;
        if (st === 'progress') hasProgress = true;
        if (st !== 'done')     allDone = false;
        if (st !== 'none')     hasStarted = true;
      });
    });

    let finalStatus = 'none';
    if (hasBlocked) finalStatus = 'blocked';
    else if (allDone && hasStarted) finalStatus = 'done';
    else if (hasStarted) finalStatus = 'progress';

    return { name: r.name, status: finalStatus };
  });
}

function renderSummaryView() {
  const container = document.getElementById('summary-container'); if (!container) return;
  const stats = getGlobalStats();
  const brandSwitcher = `<div class="brand-tabs" style="margin-bottom: 24px; padding:0; flex-direction:row; width:fit-content;">
    <button class="brand-tab ${activeBrand === 'Nissan' ? 'active' : ''}" data-brand="Nissan" data-action="set-brand">Nissan</button>
    <button class="brand-tab ${activeBrand === 'INFINITI' ? 'active' : ''}" data-brand="INFINITI" data-action="set-brand">Infiniti</button>
  </div>`;

  // --- Roadmap Section ---
  const roadmapHtml = data.integrations.map(integ => {
    const progress = calculateGlobalBatchProgress(integ.name);
    const regionalStatuses = getBatchRegionalStatuses(integ.name);
    
    const milestones = [
      { label: 'Dev Start', p: integ.devStart, a: integ.actDevStart },
      { label: 'Dev End',   p: integ.devEnd,   a: integ.actDevEnd },
      { label: 'UAT2',      p: integ.uat2Date, a: integ.actUat2Date },
      { label: 'Prod',      p: integ.prodDate, a: integ.actProdDate }
    ];

    const stepsHtml = milestones.map(m => {
      const bestDate = m.a || m.p;
      const isPast = bestDate && new Date(bestDate) < new Date();
      const statusClass = m.a ? 'completed' : (isPast ? 'current' : '');
      const dateDisplay = m.a ? `<span style="color:var(--done);font-weight:700;">${formatDate(m.a)}</span>` : formatDate(m.p);
      return `<div class="roadmap-step ${statusClass}"><div class="roadmap-dot"></div><div class="roadmap-label">${m.label}</div><div class="roadmap-date">${dateDisplay}</div>${m.a ? '<div style="font-size:8px; color:var(--done); font-weight:800; margin-top:-2px">ACTUAL</div>' : ''}</div>`;
    }).join('');

    const regionsHtml = regionalStatuses.map(rs => `
      <div class="region-mini-pill ${rs.status}">
        <b>${esc(rs.name)}</b> ${rs.status.toUpperCase()}
      </div>
    `).join('');

    return `
      <div class="roadmap-card">
        <div class="roadmap-info">
          <div class="roadmap-name">${esc(integ.name)}</div>
          <div class="roadmap-progress-text">${progress}% Global Progress</div>
        </div>
        <div class="roadmap-track">
          <div class="roadmap-main-track">
            <div class="roadmap-line"></div>
            <div class="roadmap-line-fill" style="width: ${progress}%"></div>
            ${stepsHtml}
          </div>
          <div class="roadmap-regions">
            ${regionsHtml}
          </div>
        </div>
      </div>`;
  }).join('');
  const regionRows = data.regions.filter(r => r.brand === activeBrand).map(r => {
    const statuses = data.statuses[r.id] || {};
    let counts = { done: 0, progress: 0, blocked: 0, none: 0 };
    data.integrations.forEach(integ => {
      const items = integ.subItems?.length ? integ.subItems.map(s => `${integ.name}:${s}`) : [integ.name];
      items.forEach(name => { r.markets.forEach(m => { const st = getStatusObj(statuses, `${name}|${m.name}`).status; counts[st]++; }); });
    });
    const total = counts.done + counts.progress + counts.blocked + counts.none;
    const getP = (val) => total === 0 ? 0 : (val / total) * 100;
    const rPercent = total === 0 ? 0 : Math.round(getP(counts.done));
    return `<tr><td class="rpt-name">${esc(r.name)}</td><td>${r.markets.length}</td><td class="rpt-progress-cell"><div class="status-stack"><div class="stack-segment done summary-bar" data-width="${getP(counts.done)}" style="width:0%" title="Done: ${counts.done}"></div><div class="stack-segment progress summary-bar" data-width="${getP(counts.progress)}" style="width:0%" title="In Progress: ${counts.progress}"></div><div class="stack-segment blocked summary-bar" data-width="${getP(counts.blocked)}" style="width:0%" title="Blocked: ${counts.blocked}"></div><div class="stack-segment none summary-bar" data-width="${getP(counts.none)}" style="width:0%" title="Not Started: ${counts.none}"></div></div><span class="rpt-percent">${rPercent}%</span></td></tr>`;
  }).join('');
  container.innerHTML = brandSwitcher + `<div class="kpi-grid"><div class="kpi-card"><div class="kpi-label">Overall Progress</div><div class="kpi-value">${stats.percent}%</div><div class="kpi-sub">${stats.done} of ${stats.total} items completed</div></div><div class="kpi-card"><div class="kpi-label">Blocked Items</div><div class="kpi-value" style="color:var(--blocked)">${stats.blocked}</div><div class="kpi-sub">Items requiring immediate attention</div></div><div class="kpi-card"><div class="kpi-label">Overdue Milestones</div><div class="kpi-value" style="color:var(--blocked)">${stats.overdue}</div><div class="kpi-sub">Batches past Planned Production date</div></div></div><div class="summary-section" style="margin-top:32px"><div class="summary-section-header"><div class="summary-section-title">Global Batch Roadmaps</div></div><div style="padding: 24px; background: var(--subtle)">${roadmapHtml}</div></div><div class="summary-section" style="margin-top:32px"><div class="summary-section-header"><div class="summary-section-title">Regional Completion Breakdown (${activeBrand})</div></div><table class="region-progress-table"><thead><tr><th>Region</th><th>Markets</th><th>Distribution Status</th></tr></thead><tbody>${regionRows}</tbody></table></div>`;
  requestAnimationFrame(() => { container.querySelectorAll('.summary-bar').forEach(bar => { bar.style.width = bar.dataset.width + '%'; }); });
}

function debounce(fn, delay) {
  let timeout;
  return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => fn.apply(this, args), delay); };
}

const debouncedRender = debounce(() => render(), 150);

function initDashboardFilters() {
  const chipContainer = document.getElementById('dashboard-filter-chips'); if (!chipContainer) return; chipContainer.innerHTML = '';
  STATUSES.forEach(s => { const btn = document.createElement('button'); btn.className = `filter-chip fc-${s}${dashboardFilterStatuses.has(s) ? ' active' : ''}`; btn.innerHTML = `<span class="filter-chip-dot ${s}"></span>${STATUS_LABELS[s]}`; btn.onclick = () => { if (dashboardFilterStatuses.has(s)) dashboardFilterStatuses.delete(s); else dashboardFilterStatuses.add(s); render(); }; chipContainer.appendChild(btn); });
  const regionContainer = document.getElementById('dashboard-region-chips'); if (!regionContainer) return; regionContainer.innerHTML = '';
  data.regions.filter(r => r.brand === activeBrand).map(r => r.name).filter((v, i, a) => a.indexOf(v) === i).forEach(name => {
    const btn = document.createElement('button'); btn.className = `filter-chip${dashboardFilterRegions.has(name) ? ' active' : ''}`;
    const regionsWithName = data.regions.filter(reg => reg.name === name && reg.brand === activeBrand);
    let total = 0, done = 0;
    regionsWithName.forEach(r => {
      const statuses = data.statuses[r.id] || {};
      data.integrations.forEach(integ => {
        const items = integ.subItems?.length ? integ.subItems.map(s => `${integ.name}:${s}`) : [integ.name];
        items.forEach(item => { r.markets.forEach(m => { total++; if (getStatusObj(statuses, `${item}|${m.name}`).status === 'done') done++; }); });
      });
    });
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    btn.innerHTML = `<span>${name}</span><span style="font-size:9px; font-weight:700; color:var(--muted); margin-left:auto; background:rgba(0,0,0,0.05); padding:2px 5px; border-radius:4px;">${percent}%</span>`;
    btn.onclick = () => { if (dashboardFilterRegions.has(name)) dashboardFilterRegions.delete(name); else dashboardFilterRegions.add(name); render(); };
    regionContainer.appendChild(btn);
  });
  const setupToggle = (id, varName) => { const el = document.getElementById(id); if (el) { el.checked = eval(varName); el.onchange = (e) => { eval(`${varName} = ${e.target.checked}`); render(); }; } };
  setupToggle('dashboard-toggle-hide-done', 'dashboardHideDone');
  setupToggle('dashboard-toggle-only-blocked', 'dashboardOnlyBlocked');
  setupToggle('dashboard-toggle-only-notes', 'dashboardOnlyNotes');
  syncDashboardResetBtn();
}

function initPlannerFilters() {
  const chipContainer = document.getElementById('planner-filter-chips'); if (!chipContainer) return; chipContainer.innerHTML = '';
  STATUSES.forEach(s => { const btn = document.createElement('button'); btn.className = `filter-chip fc-${s}${plannerFilterStatuses.has(s) ? ' active' : ''}`; btn.innerHTML = `<span class="filter-chip-dot ${s}"></span>${STATUS_LABELS[s]}`; btn.onclick = () => { if (plannerFilterStatuses.has(s)) plannerFilterStatuses.delete(s); else plannerFilterStatuses.add(s); render(); }; chipContainer.appendChild(btn); });
  const batchContainer = document.getElementById('planner-batch-chips'); if (!batchContainer) return; batchContainer.innerHTML = '';
  data.integrations.forEach(integ => { const btn = document.createElement('button'); btn.className = `filter-chip${plannerFilterBatches.has(integ.name) ? ' active' : ''}`; btn.textContent = integ.name; btn.onclick = () => { if (plannerFilterBatches.has(integ.name)) plannerFilterBatches.delete(integ.name); else plannerFilterBatches.add(integ.name); render(); }; batchContainer.appendChild(btn); });
  const regionContainer = document.getElementById('planner-region-chips'); if (!regionContainer) return; regionContainer.innerHTML = '';
  data.regions.filter(r => r.brand === plannerBrand).map(r => r.name).filter((v, i, a) => a.indexOf(v) === i).forEach(name => {
    const btn = document.createElement('button'); btn.className = `filter-chip${plannerFilterRegions.has(name) ? ' active' : ''}`;
    btn.textContent = name;
    btn.onclick = () => { if (plannerFilterRegions.has(name)) plannerFilterRegions.delete(name); else plannerFilterRegions.add(name); render(); };
    regionContainer.appendChild(btn);
  });
  const setupToggle = (id, varName) => { const el = document.getElementById(id); if (el) { el.checked = eval(varName); el.onchange = (e) => { eval(`${varName} = ${e.target.checked}`); render(); }; } };
  setupToggle('planner-toggle-hide-done', 'plannerHideDone');
  setupToggle('planner-toggle-only-blocked', 'plannerOnlyBlocked');
  setupToggle('planner-toggle-only-notes', 'plannerOnlyNotes');
  const searchEl = document.getElementById('planner-filter-search'); if (searchEl) { searchEl.value = plannerFilterSearch; searchEl.oninput = e => { plannerFilterSearch = e.target.value.trim(); debouncedRender(); }; }
  const startDateEl = document.getElementById('planner-filter-date-start'); if (startDateEl) { startDateEl.value = plannerFilterDateStart; startDateEl.onchange = e => { plannerFilterDateStart = e.target.value; render(); }; }
  const endDateEl = document.getElementById('planner-filter-date-end'); if (endDateEl) { endDateEl.value = plannerFilterDateEnd; endDateEl.onchange = e => { plannerFilterDateEnd = e.target.value; render(); }; }
  syncPlannerResetBtn();
}

function syncDashboardResetBtn() { const btn = document.getElementById('dashboard-filter-reset'); if (btn) { const isFiltered = dashboardFilterStatuses.size > 0 || dashboardFilterRegions.size > 0 || dashboardHideDone || dashboardOnlyBlocked || dashboardOnlyNotes; btn.classList.toggle('hidden', !isFiltered); } }
function syncPlannerResetBtn() { const btn = document.getElementById('planner-filter-reset'); if (btn) { const isFiltered = plannerFilterStatuses.size > 0 || plannerFilterBatches.size > 0 || plannerFilterRegions.size > 0 || plannerFilterSearch !== '' || plannerFilterDateStart !== '' || plannerFilterDateEnd !== '' || plannerHideDone || plannerOnlyBlocked || plannerOnlyNotes; btn.classList.toggle('hidden', !isFiltered); } }

function resetFilters(sidebar) {
  if (sidebar === 'dashboard') {
    dashboardFilterStatuses.clear(); dashboardFilterRegions.clear(); dashboardHideDone = false; dashboardOnlyBlocked = false; dashboardOnlyNotes = false;
    initDashboardFilters();
  } else if (sidebar === 'planner') {
    plannerFilterStatuses.clear(); plannerFilterBatches.clear(); plannerFilterRegions.clear(); plannerFilterSearch = ''; plannerFilterDateStart = ''; plannerFilterDateEnd = ''; plannerHideDone = false; plannerOnlyBlocked = false; plannerOnlyNotes = false;
    initPlannerFilters();
  }
  render();
}
function dashboardIntegrationPasses(integName, markets, regionId) {
  if (dashboardFilterStatuses.size > 0 || dashboardHideDone || dashboardOnlyBlocked || dashboardOnlyNotes) {
    const statuses = data.statuses[regionId] || {};
    const hasMatch = markets.some(m => { const obj = getStatusObj(statuses, `${integName}|${m.name}`); if (dashboardHideDone && obj.status === 'done') return false; if (dashboardOnlyBlocked && obj.status !== 'blocked') return false; if (dashboardOnlyNotes && !obj.note?.trim()) return false; if (dashboardFilterStatuses.size > 0 && !dashboardFilterStatuses.has(obj.status)) return false; return true; });
    if (!hasMatch) return false;
  }
  if (dashboardFilterRegions.size > 0) {
    const regionName = data.regions.find(r => r.id === regionId)?.name;
    if (!regionName || !dashboardFilterRegions.has(regionName)) return false;
  }
  return true;
}

function phasePassesFilter(phase) {
  if (plannerFilterSearch && !phase.name.toLowerCase().includes(plannerFilterSearch.toLowerCase())) return false;
  if (plannerHideDone && phase.status === 'done') return false;
  if (plannerOnlyBlocked && phase.status !== 'blocked') return false;
  if (plannerOnlyNotes && !phase.note?.trim()) return false;
  if (plannerFilterStatuses.size > 0 && !plannerFilterStatuses.has(phase.status || 'none')) return false;
  if (plannerFilterBatches.size > 0) {
    const hasMatch = (phase.integrations || []).some(integ => plannerFilterBatches.has(integ));
    if (!hasMatch) return false;
  }
  if (plannerFilterRegions.size > 0) {
    const phaseRegions = new Set((phase.regions || []).map(pr => {
      const reg = data.regions.find(r => r.id === pr.regionId);
      return reg?.name;
    }).filter(Boolean));
    const hasMatch = [...plannerFilterRegions].some(r => phaseRegions.has(r));
    if (!hasMatch) return false;
  }
  if (plannerFilterDateStart) {
    const startDate = new Date(plannerFilterDateStart);
    const phaseDate = new Date(phase.date);
    if (phaseDate < startDate) return false;
  }
  if (plannerFilterDateEnd) {
    const endDate = new Date(plannerFilterDateEnd);
    const phaseDate = new Date(phase.date);
    if (phaseDate > endDate) return false;
  }
  return true;
}

// ── Utils ─────────────────────────────────────────

function setBrand(brand) { activeBrand = brand; document.querySelectorAll('.brand-tab').forEach(t => t.classList.toggle('active', t.dataset.brand === brand)); render(); }
function toggleBulkMode() { bulkMode = !bulkMode; if (!bulkMode) selectedCells.clear(); const btn = document.getElementById('bulk-mode-btn'); if (btn) btn.textContent = bulkMode ? 'X Exit Bulk' : '[] Bulk Mode'; syncBulkBar(); render(); }
function syncBulkBar() {
  const bar = document.getElementById('bulk-bar');
  const countEl = document.getElementById('bulk-count');
  const btn = document.getElementById('bulk-mode-btn');
  if (bar) bar.classList.toggle('hidden', !bulkMode || selectedCells.size === 0);
  if (countEl) countEl.textContent = selectedCells.size;
  if (btn) btn.textContent = bulkMode ? 'X Exit Bulk' : '[] Bulk Mode';
}

function commitEdit(raw) {
  const value = raw?.trim(); if (!editing) return; const { type, regionId, marketName } = editing; editing = null; if (!value && type !== 'edit-market-group') { render(); return; }
  if (type === 'rename') { const r = data.regions.find(reg => reg.id === regionId); if (r) r.name = value; }
  else if (type === 'edit-market-group') { const r = data.regions.find(reg => reg.id === regionId); if (r) { const m = r.markets.find(m => m.name === marketName); if (m) m.group = value || null; } }
  else if (type === 'add-region') data.regions.push({ id: slug(value), brand: activeBrand, name: value, markets: [] });
  else if (type === 'add-market') { const r = data.regions.find(reg => reg.id === regionId); if (r && !r.markets.find(m => m.name.toLowerCase() === value.toLowerCase())) r.markets.push({ name: value, group: null }); }
  else if (type === 'add-integ') { if (!data.integrations.find(i => i.name.toLowerCase() === value.toLowerCase())) data.integrations.push({ name: value, subItems: [], description: '', createdAt: today(), updatedAt: today() }); }
  saveData().then(() => render());
}

function deleteRegion(id) {
  const region = data.regions.find(r => r.id === id);
  if (confirm(`Are you sure you want to delete the entire region "${region ? region.name : id}" and all its associated data?`)) { data.regions = data.regions.filter(r => r.id !== id); delete data.statuses[id]; saveData().then(() => render()); }
}
function removeMarket(rid, name) {
  if (!confirm(`Are you sure you want to delete the market "${name}"?`)) return;
  const r = data.regions.find(reg => reg.id === rid);
  if (r) { r.markets = r.markets.filter(m => m.name !== name); Object.keys(data.statuses[rid] || {}).forEach(k => { if (k.endsWith(`|${name}`)) delete data.statuses[rid][k]; }); }
  saveData().then(() => render());
}
function deleteIntegFromPanel() {
  if (!integState) return;
  const { integName, isSub } = integState;
  if (isSub) {
    const [parentName, subName] = integName.split(':');
    if (confirm(`Delete sub-item "${subName}" from "${parentName}"?`)) {
      const parent = data.integrations.find(i => i.name === parentName);
      if (parent) { parent.subItems = parent.subItems.filter(s => s !== subName); Object.keys(data.statuses).forEach(rid => { Object.keys(data.statuses[rid]).forEach(k => { if (k.startsWith(`${integName}|`)) delete data.statuses[rid][k]; }); }); saveData().then(() => { closePanels(); render(); }); }
    }
  } else { removeInteg(integName); closePanels(); }
}

function removeInteg(name) { if (confirm('Delete?')) { data.integrations = data.integrations.filter(i => i.name !== name); Object.keys(data.statuses).forEach(rid => { Object.keys(data.statuses[rid]).forEach(k => { if (k.startsWith(`${name}|`) || k.startsWith(`${name}:`)) delete data.statuses[rid][k]; }); }); saveData().then(() => render()); } }

function focusInput() {
  requestAnimationFrame(() => {
    const input = document.querySelector('.inline-input'); if (!input) return;
    input.focus(); if (editing?.type === 'rename' || editing?.type === 'edit-market-group') input.select();
    input.onkeydown = e => { if (e.key === 'Enter') commitEdit(input.value); if (e.key === 'Escape') { editing = null; render(); } };
    input.onblur = () => setTimeout(() => { if (editing) commitEdit(input.value); }, 250);
  });
}

function showTooltip(e, text, isBatch, integObj) {
  const tt = document.getElementById('tooltip'); if (!tt) return;
  let content = `<div>${esc(text || 'No description.')}</div>`;
  if (isBatch && integObj) {
    const dates = [];
    if (integObj.devStart) dates.push({ label: 'Dev Start', val: integObj.devStart });
    if (integObj.devEnd)   dates.push({ label: 'Dev End', val: integObj.devEnd });
    if (integObj.uat2Date) dates.push({ label: 'planned uat2 date', val: integObj.uat2Date });
    if (integObj.prodDate) dates.push({ label: 'Planned Prod', val: integObj.prodDate });
    if (dates.length > 0) { content += `<div class="tt-dates">`; dates.forEach(d => { content += `<div class="tt-date" style="margin-bottom:4px;"><b>${esc(d.label)}</b><br/>${esc(formatDate(d.val))}</div>`; }); content += `</div>`; }
  }
  tt.innerHTML = content; tt.classList.remove('hidden'); tt.style.left = `${e.clientX + 15}px`; tt.style.top = `${e.clientY + 15}px`;
}
function hideTooltip() { const tt = document.getElementById('tooltip'); if (tt) tt.classList.add('hidden'); }
function today()      { return new Date().toISOString().split('T')[0]; }
function slug(s)      { return s.toLowerCase().replace(/\s+/g,'-') + '-' + Date.now(); }
function formatDate(d){ if (!d) return '—'; return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); }
function esc(str)     { return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function closePanels()    { document.getElementById('panel-overlay').classList.add('hidden'); closeCellPanel(); closeIntegPanel(); closePhasePanel(); closePhaseDetailPanel(); }
function closeCellPanel() { cellState = null;  document.getElementById('cell-panel').classList.add('hidden'); }
function closeIntegPanel(){ integState = null; document.getElementById('integ-panel').classList.add('hidden'); }


init();
