let data = { integrations: [], regions: [], statuses: [], history: [] };
let editing    = null;
let cellState  = null;
let integState = null;
let activeBrand = 'Nissan';
let filterStatuses = new Set();
let filterRegions  = new Set();
let filterBatches  = new Set();
let filterSearch   = '';
let hideDone      = false;
let onlyBlocked   = false;
let onlyNotes     = false;
let bulkMode      = false;
let isMouseDown   = false;
let selectedCells = new Set(); 
let expandedBatches = new Set();
let currentView = 'dashboard';

const STATUSES = ['none', 'progress', 'done', 'blocked'];
const STATUS_LABELS = { none: 'Not Started', progress: 'In Progress', done: 'Done', blocked: 'Blocked' };

const DEFAULT_INTEGRATIONS = [
  { name:'Dealer', subItems:['V1 Dealer','V2 Dealer'], intDate: '2026-02-05', uat2Date: '2026-03-05', prodDate: '2026-03-25', description:'V1 Dealer & V2 Dealer (Pilot). Rollout: APAC 25 Mar–20 May 2026 · EU 03–10 Jun 2026 · US 17–24 Jun 2026. Drop-dead: 15 Jul 2026.', createdAt:'2026-04-24', updatedAt:'2026-04-24' },
  { name:'Batch A', subItems:['V2 Models','V2 Offers','V2 eim2spec','One10 Login','One10 Store'], intDate: '2026-04-23', uat2Date: '2026-05-07', prodDate: '2026-05-26', description:'Models, Offers, eim2spec Connectors-Pim, One10 Login & Store. INT: 23 Apr 2026 · UAT2: 07 May 2026 · Prod APAC: 26 May 2026.', createdAt:'2026-04-24', updatedAt:'2026-04-24' },
  { name:'Batch B', subItems:['V2 Utils','V2 Finance','HOYU Connector','Santander NNE Api','Santander NNE Login','V2 Webhook Notification'], intDate: '2026-07-06', uat2Date: '2026-07-16', prodDate: '2026-08-03', description:'Utils, Finance calculator, HOYU, Santander NNE connectors, Webhook Notification. INT: 06 Jul 2026 · UAT2: 16 Jul 2026 · Prod: 03 Aug 2026.', createdAt:'2026-04-24', updatedAt:'2026-04-24' },
  { name:'Batch C', subItems:['V2 Status','V2 Bookings','V2 Trade-in','Generative Search','Personalisation','FranceBee2Link','NMA Autograb','Tradein UK','Tradein Autohausen'], intDate: '', uat2Date: '', prodDate: '', description:'Status, Bookings, Trade-in & regional connectors. Relies on Santander NNE (Batch B). No dedicated drop-dead date.', createdAt:'2026-04-24', updatedAt:'2026-04-24' },
  { name:'Batch D', subItems:['V2 Ecommerce','Ecomm Dealers','Ecomm Orders','Ecomm Assets','Ecomm Products','Ecomm TradeIn','Ecomm BTO','Ecomm Accounts','Ecomm Payment','Ecomm Inventory','Ecomm Finance','SFCC Store','SFCC Token','NE-IE RegistrationFee','NE-IE Token Management'], intDate: '2026-08-10', uat2Date: '2026-08-20', prodDate: '2026-09-07', description:'Full ecommerce suite. INT: 10 Aug 2026 · UAT2: 20 Aug 2026 · Prod: 07 Sep 2026 · Drop-dead: 28 Sep 2026.', createdAt:'2026-04-24', updatedAt:'2026-04-24' },
  { name:'Batch E', subItems:['Accessories','Account Profile','Configurator','ConfiguratorPrice','Honeypot','LeadsLog','nodeSQSConnector'], intDate: '2026-08-10', uat2Date: '2026-08-20', prodDate: '2026-09-07', description:'Accessories, Account Profile, Configurator, Honeypot, LeadsLog. INT: 10 Aug 2026 · UAT2: 20 Aug 2026 · Prod: 07 Sep 2026 · Drop-dead: 28 Sep 2026.', createdAt:'2026-04-24', updatedAt:'2026-04-24' },
  { name:'Batch F', subItems:['Leads V2','Adobe Campaign Login','Adobe Campaign Store','MS Dynamics Yana Login','MS Dynamics Yana Store','Datadise Login','Datadise Store','Lead Mgmt WR3FE11','Lead Mgmt WRSFE10','NCI Login','NCI Store'], intDate: '2026-08-31', uat2Date: '2026-09-10', prodDate: '2026-09-28', description:'Leads V2, Adobe Campaign, MS Dynamics Yana, Datadise, Lead Management, NCI connectors. INT: 31 Aug 2026 · Drop-dead: 19 Oct 2026.', createdAt:'2026-04-24', updatedAt:'2026-04-24' },
  { name:'Batch G', subItems:['VegaCRM Login','VegaCRM Store','SugarCRM Login','SugarCRM Store','Salesforce Login','Salesforce Store','ZohoCRM Login','ZohoCRM Store','MS Dynamics Login','MS Dynamics Store','NNA Login','NNA Store','CEBIP','Nissan Europe ESB','SCV Store'], intDate: '2026-08-31', uat2Date: '2026-09-10', prodDate: '2026-09-28', description:'CRM connectors: VegaCRM, SugarCRM, Salesforce, ZohoCRM, MS Dynamics, NNA, CEBIP, Nissan Europe ESB, SCV. INT: 31 Aug 2026 · Drop-dead: 19 Oct 2026.', createdAt:'2026-04-24', updatedAt:'2026-04-24' },
  { name:'Batch H', subItems:['Workato Store','Workato Login','CDR Login','CDR Store','CA Login','CA Store','EU Adobe Campaign Login','EU Adobe Campaign Store','CA Opportunity Login','CA Opportunity Store','AutoCRM Store','SICOP Store','LMT MS Dynamics Store','KR CRM Store'], intDate: '2026-08-31', uat2Date: '2026-09-10', prodDate: '2026-09-28', description:'Workato, CDR, CA, EU Adobe Campaign, CA Opportunity, AutoCRM, SICOP, LMT MS Dynamics, KR CRM connectors. INT: 31 Aug 2026 · Drop-dead: 19 Oct 2026.', createdAt:'2026-04-24', updatedAt:'2026-04-24' },
  { name:'MO Japan', subItems:['Japan GuestServices','Japan FinancialServices','Japan FinanceSimulation','Japan OwnerServices','Japan OwnerServicesVehicles','Japan LocationServices','Japan LoginServices','Japan MyNissan'], intDate: '2026-03-09', uat2Date: '2026-04-16', prodDate: '2026-04-22', description:'Japan nlink channels managed by MO/Japan FE team. INT: 09 Mar 2026 ✓ · UAT: 16 Apr 2026 ✓ · Prod: 22 Apr 2026 (Planned) · Drop-dead: 13 May 2026.', createdAt:'2026-04-24', updatedAt:'2026-04-24' },
  { name:'MO PIM', subItems:['PIM PaceAuthorization','PIM DataAuthoring'], intDate: '2026-04-16', uat2Date: '2026-04-23', prodDate: '2026-04-30', description:'PIM Proxy managed by NDI team. V2-ChannelsPIM-PaceAuthorization & DataAuthoring. Drop-dead: 21 May 2026.', createdAt:'2026-04-24', updatedAt:'2026-04-24' },
  { name:'MO Americas', subItems:['UserRecognition Authorization','UserRecognition Data'], intDate: '2026-05-07', uat2Date: '2026-05-13', prodDate: '2026-05-20', description:'V2-ChannelsAmericas: UserRecognitionAuthorization & UserRecognition-Data managed by CM. INT: 07 May 2026 · Drop-dead: 10 Jun 2026.', createdAt:'2026-04-24', updatedAt:'2026-04-24' },
  { name:'MO Owner Svcs', subItems:['V3 Users Nissan','V2 Users Nissan','V2 Users FavoriteDealers','V2 Account Nissan','NE-ESB OwnerServices','NE OwnerServices Connector','NNA OwnerServices WSO2','Owner Services Picklist','SFV3-NE Token','SFV3-NNA Token','SFV3-NE OIDC ESB','SFV3-NNA OIDC WSO2','V2 Connector SMIT','V2 Connector AOPreferenceCentre'], intDate: '2026-04-15', uat2Date: '2026-04-23', prodDate: '2026-04-30', description:'Owner Services V2/V3 migration in 3 phases managed by MO team. Phase 1 INT: 15 Apr 2026 ✓.', createdAt:'2026-04-24', updatedAt:'2026-04-24' }
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
    data.regions.forEach(r => {
      if (!r.markets) r.markets = [];
      if (!data.statuses[r.id]) data.statuses[r.id] = {};
    });
  } catch (err) { data = { integrations: DEFAULT_INTEGRATIONS, regions: [], statuses: {}, history: [] }; }
  
  // Add Throttled Scroll Listener for Scroll to Top Button
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
  initFilters();
  setView('dashboard');
}

async function saveData() {
  try {
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
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
  const sidebar = document.querySelector('.filter-sidebar');
  if (sidebar) sidebar.style.display = (viewName === 'summary' || viewName === 'activity') ? 'none' : 'flex';
  
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

function renderActivityView() {
  const container = document.getElementById('activity-container'); if (!container) return;
  const history = data.history || [];
  
  const brandSwitcher = `<div class="brand-tabs" style="margin-bottom: 24px; padding:0">
    <button class="brand-tab ${activeBrand === 'Nissan' ? 'active' : ''}" data-brand="Nissan" data-action="set-brand">Nissan</button>
    <button class="brand-tab ${activeBrand === 'INFINITI' ? 'active' : ''}" data-brand="INFINITI" data-action="set-brand">Infiniti</button>
  </div>`;

  const brandRegions = new Set(data.regions.filter(r => r.brand === activeBrand).map(r => r.name));

  // Filter logic
  const filtered = history.filter(h => {
    if (!brandRegions.has(h.region)) return false;
    const matchesRegion = activityRegion === 'all' || h.region === activityRegion;
    const matchesSearch = !activitySearch || 
      h.item.toLowerCase().includes(activitySearch.toLowerCase()) || 
      h.market.toLowerCase().includes(activitySearch.toLowerCase()) ||
      h.region.toLowerCase().includes(activitySearch.toLowerCase());
    return matchesRegion && matchesSearch;
  }).reverse(); // Latest first

  const availableRegions = [...brandRegions].sort();
  const regionOptions = `<option value="all">All Regions</option>` + 
    availableRegions.map(r => `<option value="${esc(r)}" ${activityRegion === r ? 'selected' : ''}>${esc(r)}</option>`).join('');

  const filterBar = `<div class="activity-filters">
    <input type="text" id="activity-search" placeholder="Search activity…" value="${esc(activitySearch)}" class="activity-input">
    <select id="activity-region-filter" class="activity-select">${regionOptions}</select>
    <div style="margin-left:auto; font-size:11px; color:var(--muted)">Showing ${filtered.length} entries</div>
  </div>`;

  const items = filtered.map(h => {
    const time = new Date(h.timestamp).toLocaleString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
    return `<div class="activity-row">
      <div class="activity-time">${time}</div>
      <div class="activity-desc">
        <b>${esc(h.region)}</b> · ${esc(h.market)} · <b>${esc(h.item)}</b>
      </div>
      <div class="activity-change">
        <span class="pip pip-${h.from}"></span> <span style="color:var(--muted)">→</span> <span class="pip pip-${h.to}"></span>
      </div>
    </div>`;
  }).join('');

  container.innerHTML = brandSwitcher + `<div class="summary-section">
    <div class="summary-section-header">
      <div class="summary-section-title">Global Activity Log (${activeBrand})</div>
    </div>
    ${filterBar}
    <div style="padding: 10px 0">${filtered.length ? items : '<div style="text-align:center; padding: 40px; color: var(--muted)">No matching activity found.</div>'}</div>
  </div>`;

  // Attach filter events
  document.getElementById('activity-search').oninput = (e) => { activitySearch = e.target.value; renderActivityView(); };
  document.getElementById('activity-region-filter').onchange = (e) => { activityRegion = e.target.value; renderActivityView(); };
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
  if (currentView === 'summary') { renderSummaryView(); return; }
  if (currentView === 'activity') { renderActivityView(); return; }
  const container = document.getElementById('dashboard'); if (!container) return; container.innerHTML = '';
  data.regions.filter(r => r.brand === activeBrand).filter(r => filterRegions.size === 0 || filterRegions.has(r.name)).forEach(r => container.appendChild(buildRegionBlock(r)));
  const addCard = document.createElement('div'); addCard.className = 'region-add-card';
  if (editing?.type === 'add-region') addCard.innerHTML = `<input class="inline-input input-region" placeholder="Region name…" autocomplete="off"/>`;
  else addCard.innerHTML = `<button class="btn-add-region" data-action="add-region">＋ Add Region</button>`;
  container.appendChild(addCard); attachEvents(container); focusInput(); initFilters();
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
    
    return `<th class="th-market">
      <div class="th-market-inner">
        ${groupHtml}
        <span class="th-market-name">${esc(m.name)}</span>
        <button class="btn-del-market" data-action="del-market" data-region="${id}" data-value="${esc(m.name)}">✕</button>
      </div>
    </th>`;
  }).join('');
  const addMarketTh = isAddMarket ? `<th class="th-add-market" style="padding:6px 10px;min-width:110px"><input class="inline-input input-market" placeholder="Market…"/></th>` : `<th class="th-add-market"><button class="btn-add-col" data-action="add-market" data-region="${id}">＋</button></th>`;
  let rows = '';
  data.integrations.forEach(integ => {
    if (!passesFilter(integ.name, markets, id)) return;
    rows += buildIntegRow(integ, markets, id, statuses);
    if (expandedBatches.has(`${id}|${integ.name}`) && integ.subItems?.length) {
      integ.subItems.forEach(sub => { rows += buildSubItemRow(integ.name, sub, markets, id, statuses); });
    }
  });
  if (editing?.type === 'add-integ') rows += `<tr><td class="td-integ"><div class="td-integ-inner"><input class="inline-input input-integ" placeholder="New Integration…"/></div></td>${markets.map(() => '<td class="td-status"></td>').join('')}<td class="td-status-pad"></td></tr>`;
  rows += `<tr class="row-add"><td colspan="${markets.length + 2}"><div class="row-add-actions"><button class="btn-add-row" data-action="add-integ">＋ Add Global Integration</button></div></td></tr>`;
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
  return `<tr class="tr-batch-header"><td class="td-integ"><div class="td-integ-inner"><div class="integ-label">${hasSubs ? `<button class="btn-toggle" data-action="toggle-batch" data-region="${regionId}" data-integ="${esc(integ.name)}">${isExpanded ? '▼' : '▶'}</button>` : ''}<div class="integ-name-wrap"><span class="integ-name-btn ${overdue ? 'overdue-pulse' : ''}" data-action="open-integ" data-region="${regionId}" data-integ="${esc(integ.name)}">${esc(integ.name)}</span>${prodDateStr}<span class="percent-text" style="font-size:9px;">${batchProgress}%</span></div><div class="batch-actions-inline" style="display:flex; gap:4px; margin-left:auto;"><button class="btn-select-all" data-action="select-row" data-region="${regionId}" data-integ="${esc(integ.name)}">Row</button>${(hasSubs && isExpanded) ? `<button class="btn-select-all" data-action="select-batch" data-region="${regionId}" data-integ="${esc(integ.name)}">Batch</button>` : ''}</div></div><button class="btn-del-integ" data-action="del-integ" data-integ="${esc(integ.name)}">✕</button></div></td>${statusTds}<td class="td-status-pad"></td></tr>`;
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
};

function exportCSV() {
  const regions = data.regions.filter(r => r.brand === activeBrand);
  let csv = 'Region,Integration,Market,Status,Rollout (Prod)\n';
  
  regions.forEach(r => {
    const statuses = data.statuses[r.id] || {};
    data.integrations.forEach(integ => {
      const items = [{ name: integ.name, prod: integ.prodDate }];
      if (integ.subItems) {
        integ.subItems.forEach(s => items.push({ name: `${integ.name}:${s}`, prod: '' }));
      }

      items.forEach(item => {
        r.markets.forEach(m => {
          const st = getStatusObj(statuses, `${item.name}|${m.name}`).status;
          const statusLabel = STATUS_LABELS[st] || 'Not Started';
          csv += `"${r.name}","${item.name}","${m.name}","${statusLabel}","${item.prod || ''}"\n`;
        });
      });
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
  selectedCells.forEach(key => {
    const [regionId, integName, marketName] = key.split('|');
    if (!data.statuses[regionId]) data.statuses[regionId] = {};
    const existing = getStatusObj(data.statuses[regionId], integName + '|' + marketName);
    logHistory(regionId, integName, marketName, existing.status, status);

    const update = (k, ex, st) => {
      if (st === 'none' && !ex.note) delete data.statuses[regionId][k];
      else data.statuses[regionId][k] = { ...ex, status: st, updatedAt: today() };
    };

    update(integName + '|' + marketName, existing, status);
    
    const batch = data.integrations.find(i => i.name === (integName.includes(':') ? integName.split(':')[0] : integName));
    if (batch && batch.subItems?.length && !integName.includes(':')) {
      batch.subItems.forEach(s => {
        const subK = `${integName}:${s}|${marketName}`;
        const subEx = getStatusObj(data.statuses[regionId], subK);
        logHistory(regionId, subK, marketName, subEx.status, status);
        update(subK, subEx, status);
      });
    }
  });
  
  // Exit bulk mode automatically
  selectedCells.clear(); 
  bulkMode = false; 
  syncBulkBar(); 
  
  await saveData(); 
  render();
}

function openCellPanel(regionId, integName, marketName) {
  closeIntegPanel(); const statuses = data.statuses[regionId] || {}; const obj = getStatusObj(statuses, `${integName}|${marketName}`);
  cellState = { regionId, integName, marketName, selectedStatus: obj.status };
  document.getElementById('cp-integ').textContent = integName; document.getElementById('cp-market').textContent = marketName;
  document.getElementById('cp-note').value = obj.note || ''; renderCpStatusGrid(obj.status);
  
  const historyContainer = document.createElement('div'); historyContainer.id = 'cp-history-section';
  historyContainer.innerHTML = `<div class="panel-section-label" style="margin-top:20px">Recent Changes</div><div id="cp-history-list" class="history-list"></div>`;
  const body = document.querySelector('#cell-panel .panel-body');
  const existingHistory = document.getElementById('cp-history-section'); if (existingHistory) existingHistory.remove();
  body.appendChild(historyContainer);
  const list = document.getElementById('cp-history-list');
  const relevantHistory = (data.history || []).filter(h => h.item === integName && h.market === marketName).slice(0, 5);
  if (relevantHistory.length === 0) { list.innerHTML = `<div class="history-empty">No changes recorded yet.</div>`; } 
  else { list.innerHTML = relevantHistory.map(h => `<div class="history-item"><div class="history-meta"><span class="history-time">${new Date(h.timestamp).toLocaleString('en-GB', {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span></div><div class="history-change"><span class="pip pip-${h.from}"></span><span class="history-arrow">→</span><span class="pip pip-${h.to}"></span></div></div>`).join(''); }

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
  const existing = getStatusObj(data.statuses[regionId], key);
  logHistory(regionId, integName, marketName, existing.status, selectedStatus);

  const update = (k, ex, st, nt) => {
    if (st === 'none' && !nt) delete data.statuses[regionId][k];
    else data.statuses[regionId][k] = { status: st, note: nt, updatedAt: today() };
  };

  update(key, existing, selectedStatus, note);

  const batch = data.integrations.find(i => i.name === integName);
  if (batch && batch.subItems?.length) {
    batch.subItems.forEach(s => {
      const subK = `${integName}:${s}|${marketName}`; const subEx = getStatusObj(data.statuses[regionId], subK);
      logHistory(regionId, subK, marketName, subEx.status, selectedStatus);
      update(subK, subEx, selectedStatus, subEx.note);
    });
  }
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
  document.getElementById('ip-int').value = integ.intDate || ''; document.getElementById('ip-uat2').value = integ.uat2Date || ''; document.getElementById('ip-prod').value = integ.prodDate || '';
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
  integ.intDate = document.getElementById('ip-int').value.trim(); integ.uat2Date = document.getElementById('ip-uat2').value.trim(); integ.prodDate = document.getElementById('ip-prod').value.trim();
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

function renderSummaryView() {
  const container = document.getElementById('summary-container'); if (!container) return;
  const stats = getGlobalStats();
  const brandSwitcher = `<div class="brand-tabs" style="margin-bottom: 24px; padding:0">
    <button class="brand-tab ${activeBrand === 'Nissan' ? 'active' : ''}" data-brand="Nissan" data-action="set-brand">Nissan</button>
    <button class="brand-tab ${activeBrand === 'INFINITI' ? 'active' : ''}" data-brand="INFINITI" data-action="set-brand">Infiniti</button>
  </div>`;

  const regionRows = data.regions.filter(r => r.brand === activeBrand).map(r => {
    const statuses = data.statuses[r.id] || {};
    let counts = { done: 0, progress: 0, blocked: 0, none: 0 };
    data.integrations.forEach(integ => {
      const items = integ.subItems?.length ? integ.subItems.map(s => `${integ.name}:${s}`) : [integ.name];
      items.forEach(name => { 
        r.markets.forEach(m => { 
          const st = getStatusObj(statuses, `${name}|${m.name}`).status;
          counts[st]++; 
        });
      });
    });
    
    const total = counts.done + counts.progress + counts.blocked + counts.none;
    const getP = (val) => total === 0 ? 0 : (val / total) * 100;
    const rPercent = total === 0 ? 0 : Math.round(getP(counts.done));

    return `<tr>
      <td class="rpt-name">${esc(r.name)}</td>
      <td>${r.markets.length}</td>
      <td class="rpt-progress-cell">
        <div class="status-stack">
          <div class="stack-segment done summary-bar" data-width="${getP(counts.done)}" style="width:0%" title="Done: ${counts.done}"></div>
          <div class="stack-segment progress summary-bar" data-width="${getP(counts.progress)}" style="width:0%" title="In Progress: ${counts.progress}"></div>
          <div class="stack-segment blocked summary-bar" data-width="${getP(counts.blocked)}" style="width:0%" title="Blocked: ${counts.blocked}"></div>
          <div class="stack-segment none summary-bar" data-width="${getP(counts.none)}" style="width:0%" title="Not Started: ${counts.none}"></div>
        </div>
        <span class="rpt-percent">${rPercent}%</span>
      </td>
    </tr>`;
  }).join('');

  container.innerHTML = brandSwitcher + `<div class="kpi-grid"><div class="kpi-card"><div class="kpi-label">Overall Progress</div><div class="kpi-value">${stats.percent}%</div><div class="kpi-sub">${stats.done} of ${stats.total} items completed</div></div><div class="kpi-card"><div class="kpi-label">Blocked Items</div><div class="kpi-value" style="color:var(--blocked)">${stats.blocked}</div><div class="kpi-sub">Items requiring immediate attention</div></div><div class="kpi-card"><div class="kpi-label">Overdue Milestones</div><div class="kpi-value" style="color:var(--blocked)">${stats.overdue}</div><div class="kpi-sub">Batches past Planned Production date</div></div></div><div class="summary-section" style="margin-top:32px"><div class="summary-section-header"><div class="summary-section-title">Regional Completion Breakdown (${activeBrand})</div></div><table class="region-progress-table"><thead><tr><th>Region</th><th>Markets</th><th>Distribution Status</th></tr></thead><tbody>${regionRows}</tbody></table></div>`;

  // Animate summary bars
  requestAnimationFrame(() => {
    container.querySelectorAll('.summary-bar').forEach(bar => {
      bar.style.width = bar.dataset.width + '%';
    });
  });
}

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

const debouncedRender = debounce(() => render(), 150);

function initFilters() {
  const chipContainer = document.getElementById('filter-chips'); if (!chipContainer) return; chipContainer.innerHTML = '';
  STATUSES.forEach(s => { const btn = document.createElement('button'); btn.className = `filter-chip fc-${s}${filterStatuses.has(s) ? ' active' : ''}`; btn.innerHTML = `<span class="filter-chip-dot ${s}"></span>${STATUS_LABELS[s]}`; btn.onclick = () => { if (filterStatuses.has(s)) filterStatuses.delete(s); else filterStatuses.add(s); render(); }; chipContainer.appendChild(btn); });
  const regionContainer = document.getElementById('region-chips'); regionContainer.innerHTML = '';
  data.regions.filter(r => r.brand === activeBrand).map(r => r.name).filter((v, i, a) => a.indexOf(v) === i).forEach(name => {
    const btn = document.createElement('button'); btn.className = `filter-chip${filterRegions.has(name) ? ' active' : ''}`;
    
    // Calculate Region Completion
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
    btn.onclick = () => {
      if (filterRegions.has(name)) {
        filterRegions.delete(name);
        render();
      } else {
        filterRegions.add(name);
        render();
        // Smooth scroll to the region block
        setTimeout(() => {
          const blocks = document.querySelectorAll('.region-block');
          const target = Array.from(blocks).find(b => b.querySelector('.region-title')?.textContent.trim() === name);
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    };
    regionContainer.appendChild(btn);
  });
  const batchContainer = document.getElementById('batch-chips'); batchContainer.innerHTML = '';
  data.integrations.forEach(integ => { const btn = document.createElement('button'); btn.className = `filter-chip${filterBatches.has(integ.name) ? ' active' : ''}`; btn.textContent = integ.name; btn.onclick = () => { if (filterBatches.has(integ.name)) filterBatches.delete(integ.name); else filterBatches.add(integ.name); render(); }; batchContainer.appendChild(btn); });
  const setupToggle = (id, key) => { const el = document.getElementById(id); if (el) { el.checked = window[key]; el.onchange = (e) => { window[key] = e.target.checked; render(); }; } };
  setupToggle('toggle-hide-done', 'hideDone'); setupToggle('toggle-only-blocked', 'onlyBlocked'); setupToggle('toggle-only-notes', 'onlyNotes');
  const searchEl = document.getElementById('filter-search'); if (searchEl) { searchEl.value = filterSearch; searchEl.oninput = e => { filterSearch = e.target.value.trim(); debouncedRender(); }; }
  syncResetBtn();
}

function syncResetBtn() { const btn = document.getElementById('filter-reset'); if (btn) { const isFiltered = filterStatuses.size > 0 || filterRegions.size > 0 || filterBatches.size > 0 || filterSearch !== '' || hideDone || onlyBlocked || onlyNotes; btn.classList.toggle('hidden', !isFiltered); } }
function resetFilters() { filterStatuses.clear(); filterRegions.clear(); filterBatches.clear(); filterSearch = ''; hideDone = false; onlyBlocked = false; onlyNotes = false; render(); }
function passesFilter(integName, markets, regionId) {
  if (filterBatches.size > 0 && !filterBatches.has(integName)) return false;
  if (filterSearch && !integName.toLowerCase().includes(filterSearch.toLowerCase())) return false;
  if (filterStatuses.size > 0 || hideDone || onlyBlocked || onlyNotes) {
    const statuses = data.statuses[regionId] || {};
    const hasMatch = markets.some(m => { const obj = getStatusObj(statuses, `${integName}|${m.name}`); if (hideDone && obj.status === 'done') return false; if (onlyBlocked && obj.status !== 'blocked') return false; if (onlyNotes && !obj.note?.trim()) return false; if (filterStatuses.size > 0 && !filterStatuses.has(obj.status)) return false; return true; });
    if (!hasMatch) return false;
  }
  return true;
}

// ── Utils ─────────────────────────────────────────

function setBrand(brand) { activeBrand = brand; document.querySelectorAll('.brand-tab').forEach(t => t.classList.toggle('active', t.dataset.brand === brand)); render(); }
function toggleBulkMode() { bulkMode = !bulkMode; if (!bulkMode) selectedCells.clear(); const btn = document.getElementById('bulk-mode-btn'); if (btn) btn.textContent = bulkMode ? '✕ Exit Bulk' : '⬚ Bulk Mode'; syncBulkBar(); render(); }
function syncBulkBar() {
  const bar = document.getElementById('bulk-bar');
  const countEl = document.getElementById('bulk-count');
  const btn = document.getElementById('bulk-mode-btn');
  
  if (bar) bar.classList.toggle('hidden', !bulkMode || selectedCells.size === 0);
  if (countEl) countEl.textContent = selectedCells.size;
  
  if (btn) {
    btn.textContent = bulkMode ? '✕ Exit Bulk' : '⬚ Bulk Mode';
  }
}

function commitEdit(raw) {
  const value = raw?.trim(); if (!editing) return; const { type, regionId, marketName } = editing; editing = null; if (!value && type !== 'edit-market-group') { render(); return; }
  if (type === 'rename') { const r = data.regions.find(reg => reg.id === regionId); if (r) r.name = value; }
  else if (type === 'edit-market-group') {
    const r = data.regions.find(reg => reg.id === regionId);
    if (r) {
      const m = r.markets.find(m => m.name === marketName);
      if (m) m.group = value || null;
    }
  }
  else if (type === 'add-region') data.regions.push({ id: slug(value), brand: activeBrand, name: value, markets: [] });
  else if (type === 'add-market') { const r = data.regions.find(reg => reg.id === regionId); if (r && !r.markets.find(m => m.name.toLowerCase() === value.toLowerCase())) r.markets.push({ name: value, group: null }); }
  else if (type === 'add-integ') { if (!data.integrations.find(i => i.name.toLowerCase() === value.toLowerCase())) data.integrations.push({ name: value, subItems: [], description: '', createdAt: today(), updatedAt: today() }); }
  saveData().then(() => render());
}

function deleteRegion(id) { if (confirm('Delete?')) { data.regions = data.regions.filter(r => r.id !== id); delete data.statuses[id]; saveData().then(() => render()); } }
function removeMarket(rid, name) { const r = data.regions.find(reg => reg.id === rid); if (r) { r.markets = r.markets.filter(m => m.name !== name); Object.keys(data.statuses[rid] || {}).forEach(k => { if (k.endsWith(`|${name}`)) delete data.statuses[rid][k]; }); } saveData().then(() => render()); }
function removeInteg(name) { if (confirm('Delete?')) { data.integrations = data.integrations.filter(i => i.name !== name); Object.keys(data.statuses).forEach(rid => { Object.keys(data.statuses[rid]).forEach(k => { if (k.startsWith(`${name}|`) || k.startsWith(`${name}:`)) delete data.statuses[rid][k]; }); }); saveData().then(() => render()); } }

function focusInput() {
  requestAnimationFrame(() => {
    const input = document.querySelector('.inline-input'); if (!input) return;
    input.focus();
    if (editing?.type === 'rename' || editing?.type === 'edit-market-group') input.select();
    input.onkeydown = e => { if (e.key === 'Enter') commitEdit(input.value); if (e.key === 'Escape') { editing = null; render(); } };
    input.onblur = () => setTimeout(() => { if (editing) commitEdit(input.value); }, 250);
  });
}

function showTooltip(e, text, isBatch, integObj) {
  const tt = document.getElementById('tooltip'); if (!tt) return;
  let content = `<div>${esc(text || 'No description.')}</div>`;
  if (isBatch && integObj) {
    const dates = [];
    if (integObj.intDate)  dates.push({ label: 'INT date', val: integObj.intDate });
    if (integObj.uat2Date) dates.push({ label: 'planned uat2 date', val: integObj.uat2Date });
    if (integObj.prodDate) dates.push({ label: 'Planned Prod (PO Sign-off)', val: integObj.prodDate });
    if (dates.length > 0) { content += `<div class="tt-dates">`; dates.forEach(d => { content += `<div class="tt-date" style="margin-bottom:4px;"><b>${esc(d.label)}</b><br/>${esc(formatDate(d.val))}</div>`; }); content += `</div>`; }
  }
  tt.innerHTML = content; tt.classList.remove('hidden'); tt.style.left = `${e.clientX + 15}px`; tt.style.top = `${e.clientY + 15}px`;
}
function hideTooltip() { const tt = document.getElementById('tooltip'); if (tt) tt.classList.add('hidden'); }
function today()      { return new Date().toISOString().split('T')[0]; }
function slug(s)      { return s.toLowerCase().replace(/\s+/g,'-') + '-' + Date.now(); }
function formatDate(d){ if (!d) return '—'; return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); }
function esc(str)     { return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function closePanels()    { document.getElementById('panel-overlay').classList.add('hidden'); closeCellPanel(); closeIntegPanel(); }
function closeCellPanel() { cellState = null;  document.getElementById('cell-panel').classList.add('hidden'); }
function closeIntegPanel(){ integState = null; document.getElementById('integ-panel').classList.add('hidden'); }

init();
