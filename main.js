/* PivotCalc — main application */
(function () {
  'use strict';

  const C = window.PivotCalc;
  const U = window.PivotUI;
  const LS_DESIGNS = 'pivotcalc-designs';
  const LS_CUSTOM = 'pivotcalc-custom-brands';
  const LS_THEME = 'pivotcalc-theme';
  const LS_STATE = 'pivotcalc-state';

  let tracks = [];
  let editingDesignId = null;
  let deferredPrompt = null;
  let currentBrand = 'Valley';

  // ---------- storage ----------
  function loadDesigns() {
    try { return JSON.parse(localStorage.getItem(LS_DESIGNS) || '[]'); } catch { return []; }
  }
  function saveDesigns(list) {
    localStorage.setItem(LS_DESIGNS, JSON.stringify(list));
  }
  function loadCustomBrands() {
    try { return JSON.parse(localStorage.getItem(LS_CUSTOM) || '{}'); } catch { return {}; }
  }
  function saveCustomBrands(obj) {
    localStorage.setItem(LS_CUSTOM, JSON.stringify(obj));
  }
  function persistState() {
    const state = {
      area: val('pivotArea'),
      brand: currentBrand,
      span: val('spanWidth'),
      tracks,
      plantWeight: val('avgJumboWeight'),
      plantJumbos: val('totalJumbos'),
      harvestJumbos: val('harvestedJumbos'),
      needWeight: val('needWeight'),
      needArea: val('needArea'),
      needPlantRate: val('needPlantRate'),
      needHarvestRate: val('needHarvestRateTon'),
      needHarvestArea: val('needHarvestArea'),
      needHarvestWeight: val('needHarvestWeight'),
      harvestMode: document.getElementById('harvestTargetMode')?.value,
      targetJumbos: val('targetHarvestJumbos'),
      targetTrucks: val('targetHarvestTrucks'),
      truckCap: val('truckCapacity')
    };
    localStorage.setItem(LS_STATE, JSON.stringify(state));
  }
  function restoreState() {
    try {
      const s = JSON.parse(localStorage.getItem(LS_STATE) || 'null');
      if (!s) return false;
      setVal('pivotArea', s.area);
      setVal('spanWidth', s.span);
      if (s.tracks) tracks = s.tracks;
      currentBrand = s.brand || 'Valley';
      setVal('avgJumboWeight', s.plantWeight);
      setVal('totalJumbos', s.plantJumbos);
      setVal('harvestedJumbos', s.harvestJumbos);
      setVal('needWeight', s.needWeight);
      setVal('needArea', s.needArea);
      setVal('needPlantRate', s.needPlantRate);
      setVal('needHarvestRateTon', s.needHarvestRate);
      setVal('needHarvestArea', s.needHarvestArea);
      setVal('needHarvestWeight', s.needHarvestWeight);
      if (s.harvestMode) {
        const sel = document.getElementById('harvestTargetMode');
        if (sel) sel.value = s.harvestMode;
      }
      setVal('targetHarvestJumbos', s.targetJumbos);
      setVal('targetHarvestTrucks', s.targetTrucks);
      setVal('truckCap', s.truckCap);
      return true;
    } catch { return false; }
  }

  function val(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
  }
  function num(id) {
    return parseFloat(val(id)) || 0;
  }
  function setVal(id, v) {
    const el = document.getElementById(id);
    if (el && v != null && v !== '') el.value = v;
  }

  // ---------- brand select ----------
  function populateBrands() {
    const sel = document.getElementById('brandSelect');
    if (!sel) return;
    const custom = loadCustomBrands();
    const builtins = C.brandList();
    sel.innerHTML = '';
    builtins.forEach(b => {
      const o = document.createElement('option');
      o.value = b;
      o.textContent = b;
      sel.appendChild(o);
    });
    Object.keys(custom).forEach(name => {
      const o = document.createElement('option');
      o.value = 'custom:' + name;
      o.textContent = name + ' ★';
      sel.appendChild(o);
    });
    const other = document.createElement('option');
    other.value = '__other__';
    other.textContent = U.t('otherBrand');
    sel.appendChild(other);

    // restore selection
    if (currentBrand.startsWith('custom:')) {
      sel.value = currentBrand;
    } else if (builtins.includes(currentBrand)) {
      sel.value = currentBrand;
    } else {
      sel.value = builtins[0];
      currentBrand = builtins[0];
    }
    updateBrandTools();
  }

  function updateBrandTools() {
    const box = document.getElementById('savedBrandTools');
    if (!box) return;
    box.innerHTML = '';
    if (currentBrand.startsWith('custom:')) {
      const name = currentBrand.slice(7);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = U.t('editBrand') + ': ' + name;
      btn.addEventListener('click', () => openCustomEditor(name));
      box.appendChild(btn);
    }
  }

  function getActiveTracksTemplate() {
    if (currentBrand.startsWith('custom:')) {
      const name = currentBrand.slice(7);
      const custom = loadCustomBrands();
      return custom[name] ? [...custom[name].tracks] : null;
    }
    return C.getBrandTracks(currentBrand);
  }

  // ---------- core recalculation ----------
  function recalc() {
    const area = num('pivotArea');
    const span = num('spanWidth') || 1.8;
    if (!tracks.length) {
      tracks = C.autoFillFromBrand(area, span, currentBrand.startsWith('custom:') ? null : currentBrand)
        || C.autoFillTracks(area, span, 12);
      // if custom brand template exists, scale it
      const tpl = getActiveTracksTemplate();
      if (tpl) {
        tracks = scaleTemplate(tpl, area, span);
      }
    }
    const result = C.computeFromTracks(area, span, tracks);
    renderSummary(result);
    renderWheelTable(result);
    recalcPlant();
    recalcHarvest();
    // sync need area default
    const needArea = document.getElementById('needArea');
    if (needArea && !needArea.dataset.touched) needArea.value = area || '';
    const nha = document.getElementById('needHarvestArea');
    if (nha && !nha.dataset.touched) nha.value = area || '';
    persistState();
  }

  function scaleTemplate(tpl, area, span) {
    const R = C.radiusFromArea(area);
    const totalTracks = span > 0 ? R / span : 0;
    const sum = tpl.reduce((a, b) => a + b, 0) || 1;
    const scale = totalTracks / sum;
    const out = tpl.map((t, i) => i === tpl.length - 1 ? 0 : Math.max(0, Math.round(t * scale * 100) / 100));
    const se = out.slice(0, -1).reduce((s, x) => s + x, 0);
    out[out.length - 1] = Math.max(0, Math.round((totalTracks - se) * 100) / 100);
    return out;
  }

  function renderSummary(r) {
    setText('radiusOut', U.fmt(r.radius, 1) + ' ' + U.t('m'));
    setText('totalTracksOut', U.fmt(r.totalTracks, 1));
    setText('tracksPerWheelOut', U.fmt(r.tracksPerWheel, 1));
    setText('activeWheelsOut', r.activeWheels);
    setText('totalAreaOut', U.fmt(r.totalArea, 2) + ' ' + U.t('feddan'));
    setText('halfAreaOut', U.fmt(r.halfAreaSum, 2));
    setText('towerLengthOut', U.fmt(r.towerLength, 1));
  }

  function renderWheelTable(r) {
    const tbody = document.getElementById('wheelTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    tracks.forEach((t, i) => {
      const tr = document.createElement('tr');
      const areaVal = r.halfAreas[i] != null ? r.halfAreas[i] : 0;
      tr.innerHTML =
        `<td>${i + 1}</td>` +
        `<td><input class="track-input" type="number" min="0" step="0.01" data-idx="${i}" value="${t}" inputmode="decimal"></td>` +
        `<td>${U.fmt(areaVal, 3)}</td>`;
      tbody.appendChild(tr);
    });
    setText('sumTracks', U.fmt(r.totalTracks, 1));
    setText('sumHalfArea', U.fmt(r.halfAreaSum, 3));

    tbody.querySelectorAll('.track-input').forEach(inp => {
      inp.addEventListener('input', onTrackEdit);
      inp.addEventListener('change', onTrackEdit);
    });
  }

  function onTrackEdit(e) {
    const idx = parseInt(e.target.dataset.idx, 10);
    const v = parseFloat(e.target.value);
    if (isNaN(v) || v < 0) return;
    tracks[idx] = v;
    // last wheel as remainder option: if editing non-last, adjust last to keep total near radius
    const area = num('pivotArea');
    const span = num('spanWidth') || 1.8;
    const R = C.radiusFromArea(area);
    const totalNeeded = span > 0 ? R / span : 0;
    if (idx < tracks.length - 1 && tracks.length > 1) {
      const se = tracks.slice(0, -1).reduce((s, x) => s + (Number(x) || 0), 0);
      tracks[tracks.length - 1] = Math.max(0, Math.round((totalNeeded - se) * 100) / 100);
    }
    const result = C.computeFromTracks(area, span, tracks);
    renderSummary(result);
    // update areas without full re-render of inputs focus
    const rows = document.querySelectorAll('#wheelTableBody tr');
    rows.forEach((row, i) => {
      const cells = row.querySelectorAll('td');
      if (cells[2]) cells[2].textContent = U.fmt(result.halfAreas[i] || 0, 3);
      if (i === tracks.length - 1 && cells[1]) {
        const inp = cells[1].querySelector('input');
        if (inp && document.activeElement !== inp) inp.value = tracks[i];
      }
    });
    setText('sumTracks', U.fmt(result.totalTracks, 1));
    setText('sumHalfArea', U.fmt(result.halfAreaSum, 3));
    persistState();
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // ---------- plant / harvest / needs ----------
  function recalcPlant() {
    const weight = num('avgJumboWeight');
    const jumbos = num('totalJumbos');
    const area = num('pivotArea');
    const seed = C.seedQuantity(jumbos, weight);
    const rate = C.plantRate(seed, area);
    setText('seedQtyOut', U.fmt(seed, 3));
    setText('plantRateOut', U.fmt(rate, 4));
  }

  function recalcHarvest() {
    const j = num('harvestedJumbos');
    const area = num('pivotArea');
    const rate = C.harvestRate(j, area);
    setText('harvestRateOut', U.fmt(rate, 3));
  }

  function recalcNeedsPlant() {
    const weight = num('needWeight');
    const area = num('needArea');
    const rate = num('needPlantRate');
    const j = C.needPlantJumbos(rate, area, weight);
    const tons = C.needPlantTons(j, weight);
    setText('needPlantJumbos', U.fmt(j, 1));
    setText('needPlantTons', U.fmt(tons, 3) + ' ' + U.t('ton'));
  }

  function recalcNeedsHarvest() {
    // Primary path (user spec): rate (jumbo/feddan) × area → jumbos; trucks = jumbos / capacity
    const rate = num('needHarvestRateTon');
    const weight = num('needHarvestWeight') || 1;
    let area = num('needHarvestArea');
    if (!area) area = num('needArea') || num('pivotArea');
    const mode = document.getElementById('harvestTargetMode')?.value || 'jumbos';
    let jumbos = 0;

    if (rate > 0 && area > 0 && !num('targetHarvestJumbos') && mode === 'jumbos') {
      jumbos = C.needHarvestJumbos(rate, area);
    } else if (mode === 'jumbos') {
      jumbos = num('targetHarvestJumbos');
      if (jumbos > 0 && rate > 0) area = jumbos / rate;
      else if (!jumbos && rate > 0) jumbos = C.needHarvestJumbos(rate, area);
    } else {
      const trucksTarget = num('targetHarvestTrucks');
      const cap = num('truckCapacity') || 1;
      jumbos = trucksTarget * cap;
      if (jumbos > 0 && rate > 0) area = jumbos / rate;
    }

    const tons = jumbos * weight;
    const cap = num('truckCapacity') || 20;
    const trucks = C.needTrucks(jumbos, cap);

    setText('needHarvestJumbos', U.fmt(jumbos, 1));
    setText('needHarvestTons', U.fmt(tons, 3) + ' ' + U.t('ton'));
    setText('needHarvestAreaOut', U.fmt(area, 2));
    setText('needTrucks', U.fmt(trucks, 0));
  }

  function toggleHarvestMode() {
    const mode = document.getElementById('harvestTargetMode')?.value;
    const jG = document.getElementById('targetJumbosGroup');
    const tG = document.getElementById('targetTrucksGroup');
    const cG = document.getElementById('truckCapacityGroup');
    if (mode === 'trucks') {
      jG?.classList.add('hidden');
      tG?.classList.remove('hidden');
      cG?.classList.remove('hidden');
    } else {
      jG?.classList.remove('hidden');
      tG?.classList.add('hidden');
      // capacity still useful
      cG?.classList.remove('hidden');
    }
    recalcNeedsHarvest();
  }

  // ---------- auto fill / clear ----------
  function doAutoFill() {
    const area = num('pivotArea');
    const span = num('spanWidth') || 1.8;
    const tpl = getActiveTracksTemplate();
    if (tpl) {
      tracks = scaleTemplate(tpl, area, span);
    } else {
      tracks = C.autoFillTracks(area, span, tracks.length || 12);
    }
    recalc();
  }

  function doClearTracks() {
    tracks = tracks.map(() => 0);
    if (!tracks.length) tracks = [0];
    recalc();
  }

  // ---------- designs ----------
  function saveCurrentDesign() {
    const nameInput = document.getElementById('designName');
    let name = (nameInput?.value || '').trim();
    if (!name) {
      name = `Pivot ${num('pivotArea')} - ${new Date().toLocaleDateString()}`;
      if (nameInput) nameInput.value = name;
    }
    const list = loadDesigns();
    const payload = {
      id: editingDesignId || ('d' + Date.now()),
      name,
      area: num('pivotArea'),
      brand: currentBrand,
      span: num('spanWidth'),
      tracks: [...tracks],
      savedAt: new Date().toISOString()
    };
    const idx = list.findIndex(d => d.id === payload.id);
    if (idx >= 0) list[idx] = payload;
    else list.unshift(payload);
    saveDesigns(list);
    editingDesignId = payload.id;
    updateEditingLabel();
    renderSavedDesigns();
  }

  function newDesign() {
    editingDesignId = null;
    const nameInput = document.getElementById('designName');
    if (nameInput) nameInput.value = '';
    updateEditingLabel();
    doAutoFill();
  }

  function loadDesign(id) {
    const d = loadDesigns().find(x => x.id === id);
    if (!d) return;
    setVal('pivotArea', d.area);
    setVal('spanWidth', d.span);
    tracks = [...(d.tracks || [])];
    currentBrand = d.brand || 'Valley';
    populateBrands();
    editingDesignId = d.id;
    setVal('designName', d.name);
    updateEditingLabel();
    recalc();
    renderSavedDesigns();
  }

  function deleteDesign(id) {
    if (!confirm(U.t('deleteDesignConfirm'))) return;
    const list = loadDesigns().filter(d => d.id !== id);
    saveDesigns(list);
    if (editingDesignId === id) {
      editingDesignId = null;
      updateEditingLabel();
    }
    renderSavedDesigns();
  }

  function updateEditingLabel() {
    const el = document.getElementById('editingDesignLabel');
    if (!el) return;
    if (editingDesignId) {
      const d = loadDesigns().find(x => x.id === editingDesignId);
      el.textContent = d ? '✎ ' + d.name : '';
    } else el.textContent = '';
  }

  function renderSavedDesigns() {
    const box = document.getElementById('savedDesignsList');
    if (!box) return;
    const list = loadDesigns();
    if (!list.length) {
      box.innerHTML = `<div class="note-box"><span>ℹ️</span><span>${U.t('noDesigns')}</span></div>`;
      return;
    }
    box.innerHTML = '';
    list.forEach(d => {
      const item = document.createElement('div');
      item.className = 'design-item' + (d.id === editingDesignId ? ' active' : '');
      item.innerHTML =
        `<div class="design-item-info">` +
        `<div class="design-item-name">${escapeHtml(d.name)}</div>` +
        `<div class="design-item-meta">${U.fmt(d.area, 1)} ${U.t('feddan')} · ${d.tracks?.length || 0} ${U.t('activeWheels')}</div>` +
        `</div>` +
        `<div class="design-item-actions">` +
        `<button type="button" title="${U.t('loadDesign')}" data-load="${d.id}">📂</button>` +
        `<button type="button" title="${U.t('deleteDesign')}" data-del="${d.id}">🗑</button>` +
        `</div>`;
      item.querySelector('[data-load]')?.addEventListener('click', e => { e.stopPropagation(); loadDesign(d.id); });
      item.querySelector('[data-del]')?.addEventListener('click', e => { e.stopPropagation(); deleteDesign(d.id); });
      item.addEventListener('click', () => loadDesign(d.id));
      box.appendChild(item);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ---------- custom brand modal ----------
  let customEditName = null;
  let customTracks = [];

  function openCustomEditor(existingName) {
    customEditName = existingName || null;
    const custom = loadCustomBrands();
    const area = num('pivotArea');
    const span = num('spanWidth') || 1.8;
    if (existingName && custom[existingName]) {
      customTracks = [...custom[existingName].tracks];
      setVal('customName', existingName);
    } else {
      customTracks = C.autoFillTracks(area, span, 12);
      setVal('customName', '');
    }
    document.getElementById('deleteCustomBtn')?.classList.toggle('hidden', !existingName);
    renderCustomGrid();
    U.openModal('customOverlay');
  }

  function renderCustomGrid() {
    const grid = document.getElementById('customGrid');
    if (!grid) return;
    const mode = document.getElementById('customMode')?.value || 'tracks';
    const span = num('spanWidth') || 1.8;
    grid.innerHTML = '';
    customTracks.forEach((t, i) => {
      const isLast = i === customTracks.length - 1;
      const div = document.createElement('div');
      div.className = 'custom-wheel-item' + (isLast ? ' locked' : '');
      const label = document.createElement('label');
      label.textContent = U.t('wheelNo') + ' ' + (i + 1) + (isLast ? ' *' : '');
      const inp = document.createElement('input');
      inp.type = 'number';
      inp.min = '0';
      inp.step = '0.01';
      inp.inputMode = 'decimal';
      if (mode === 'length') {
        inp.value = isLast ? '' : (Math.round(t * span * 100) / 100);
        inp.placeholder = 'm';
      } else {
        inp.value = isLast ? t : t;
      }
      if (isLast) inp.readOnly = true;
      else {
        inp.addEventListener('input', () => {
          let v = parseFloat(inp.value) || 0;
          if (mode === 'length') v = span > 0 ? v / span : 0;
          customTracks[i] = v;
          // update last remainder
          const area = num('pivotArea');
          const R = C.radiusFromArea(area);
          const totalNeeded = span > 0 ? R / span : 0;
          const se = customTracks.slice(0, -1).reduce((s, x) => s + (Number(x) || 0), 0);
          customTracks[customTracks.length - 1] = Math.max(0, Math.round((totalNeeded - se) * 100) / 100);
          // refresh last display
          const lastInp = grid.querySelectorAll('input')[customTracks.length - 1];
          if (lastInp) {
            lastInp.value = mode === 'length'
              ? Math.round(customTracks[customTracks.length - 1] * span * 100) / 100
              : customTracks[customTracks.length - 1];
          }
        });
      }
      div.appendChild(label);
      div.appendChild(inp);
      grid.appendChild(div);
    });
  }

  function saveCustomBrand() {
    let name = (val('customName') || '').trim();
    if (!name) name = 'Custom ' + (Object.keys(loadCustomBrands()).length + 1);
    const custom = loadCustomBrands();
    // if renaming, remove old
    if (customEditName && customEditName !== name) delete custom[customEditName];
    custom[name] = { tracks: [...customTracks], mode: val('customMode') };
    saveCustomBrands(custom);
    currentBrand = 'custom:' + name;
    populateBrands();
    tracks = scaleTemplate(customTracks, num('pivotArea'), num('spanWidth') || 1.8);
    U.closeModal('customOverlay');
    recalc();
  }

  function deleteCustomBrand() {
    if (!customEditName) return;
    if (!confirm(U.t('deleteBrandConfirm'))) return;
    const custom = loadCustomBrands();
    delete custom[customEditName];
    saveCustomBrands(custom);
    currentBrand = 'Valley';
    populateBrands();
    U.closeModal('customOverlay');
    doAutoFill();
  }

  // ---------- tabs ----------
  function initTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        const panel = document.getElementById(tab.dataset.tab);
        if (panel) panel.classList.add('active');
      });
    });
  }

  // ---------- theme ----------
  function initTheme() {
    const saved = localStorage.getItem(LS_THEME);
    if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('themeBtn')?.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem(LS_THEME, 'light');
        document.getElementById('themeBtn').textContent = '🌙';
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem(LS_THEME, 'dark');
        document.getElementById('themeBtn').textContent = '☀️';
      }
    });
    if (saved === 'dark') {
      const b = document.getElementById('themeBtn');
      if (b) b.textContent = '☀️';
    }
  }

  // ---------- modals info ----------
  function showInfo(type) {
    const title = document.getElementById('infoTitle');
    const body = document.getElementById('infoBody');
    if (type === 'about') {
      title.textContent = U.t('about');
      body.textContent = U.t('aboutBody');
    } else {
      title.textContent = U.t('idea');
      body.textContent = U.t('ideaBody');
    }
    U.openModal('infoOverlay');
  }

  // ---------- PWA install ----------
  function initPWA() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      deferredPrompt = e;
      const btn = document.getElementById('installBtn');
      if (btn) btn.style.display = '';
    });
    document.getElementById('installBtn')?.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
      } else {
        U.openModal('installOverlay');
        const st = document.getElementById('installStatus');
        if (st) {
          const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
          st.textContent = isStandalone ? '✓ Installed / مثبت' : 'Use browser menu to install';
        }
      }
    });
  }

  // ---------- wire events ----------
  function bind() {
    document.getElementById('langBtn')?.addEventListener('click', () => {
      U.toggleLang();
      U.applyI18n();
      populateBrands();
      recalc();
      renderSavedDesigns();
    });
    document.getElementById('aboutBtn')?.addEventListener('click', () => showInfo('about'));
    document.getElementById('ideaBtn')?.addEventListener('click', () => showInfo('idea'));
    document.getElementById('verseBtn')?.addEventListener('click', () => U.openModal('verseOverlay'));

    document.getElementById('pivotArea')?.addEventListener('input', () => {
      // reset tracks distribution when area changes significantly via auto
      tracks = [];
      recalc();
    });
    document.getElementById('spanWidth')?.addEventListener('input', () => {
      tracks = [];
      recalc();
    });
    document.getElementById('brandSelect')?.addEventListener('change', e => {
      const v = e.target.value;
      if (v === '__other__') {
        openCustomEditor(null);
        // revert select until saved
        populateBrands();
        return;
      }
      currentBrand = v;
      updateBrandTools();
      tracks = [];
      recalc();
    });

    document.getElementById('autoFillBtn')?.addEventListener('click', doAutoFill);
    document.getElementById('clearAreaBtn')?.addEventListener('click', doClearTracks);
    document.getElementById('saveDesignBtn')?.addEventListener('click', saveCurrentDesign);
    document.getElementById('saveDesignBtn2')?.addEventListener('click', saveCurrentDesign);
    document.getElementById('newDesignBtn')?.addEventListener('click', newDesign);

    ['avgJumboWeight', 'totalJumbos'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => { recalcPlant(); persistState(); });
    });
    document.getElementById('harvestedJumbos')?.addEventListener('input', () => { recalcHarvest(); persistState(); });

    ['needWeight', 'needArea', 'needPlantRate'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => {
        if (id === 'needArea') document.getElementById('needArea').dataset.touched = '1';
        recalcNeedsPlant();
        persistState();
      });
    document.getElementById('needHarvestArea')?.addEventListener('input', () => {
      document.getElementById('needHarvestArea').dataset.touched = '1';
      recalcNeedsHarvest(); persistState();
    });
    });
    ['needHarvestRateTon', 'needHarvestArea', 'needHarvestWeight', 'targetHarvestJumbos', 'targetHarvestTrucks', 'truckCapacity'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => { recalcNeedsHarvest(); persistState(); });
    });
    document.getElementById('harvestTargetMode')?.addEventListener('change', toggleHarvestMode);

    // custom modal
    document.getElementById('closeCustomBtn')?.addEventListener('click', () => U.closeModal('customOverlay'));
    document.getElementById('cancelCustomBtn')?.addEventListener('click', () => U.closeModal('customOverlay'));
    document.getElementById('saveCustomBtn')?.addEventListener('click', saveCustomBrand);
    document.getElementById('deleteCustomBtn')?.addEventListener('click', deleteCustomBrand);
    document.getElementById('customAutoBtn')?.addEventListener('click', () => {
      const area = num('pivotArea');
      const span = num('spanWidth') || 1.8;
      customTracks = C.autoFillTracks(area, span, customTracks.length || 12);
      renderCustomGrid();
    });
    document.getElementById('customClearBtn')?.addEventListener('click', () => {
      customTracks = customTracks.map(() => 0);
      renderCustomGrid();
    });
    document.getElementById('customMode')?.addEventListener('change', renderCustomGrid);

    // close modals
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => U.closeModal(btn.getAttribute('data-close')));
    });
    document.querySelectorAll('.modal-overlay').forEach(ov => {
      ov.addEventListener('click', e => { if (e.target === ov) U.closeModal(ov.id); });
    });
  }

  // ---------- boot ----------
  function boot() {
    U.applyI18n();
    initTheme();
    initTabs();
    initPWA();
    bind();
    const restored = restoreState();
    populateBrands();
    if (!restored || !tracks.length) {
      tracks = [];
    }
    recalc();
    renderSavedDesigns();
    toggleHarvestMode();
    recalcNeedsPlant();
    recalcNeedsHarvest();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
