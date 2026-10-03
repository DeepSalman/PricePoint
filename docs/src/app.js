import { predictPrice, MODEL_METADATA } from './model/predictor.js';

// Pre-defined templates for quick exploration
const PRESETS = [
  {
    id: 'student',
    name: 'Student / Everyday',
    specs: {
      brand: 'Dell',
      type: 'Notebook',
      inches: 15.6,
      touchscreen: false,
      ips: false,
      resolution_pixels: 1920 * 1080,
      cpu_brand: 'Intel i3',
      cpu_speed_ghz: 2.0,
      ram_gb: 8,
      storage_gb: 256,
      storage_type: 'SSD',
      gpu_brand: 'Intel',
      os: 'Windows',
      weight_kg: 1.85,
    },
    condition: 0.9,
  },
  {
    id: 'macbook',
    name: 'MacBook Retina',
    specs: {
      brand: 'Apple',
      type: 'Ultrabook',
      inches: 13.3,
      touchscreen: false,
      ips: true,
      resolution_pixels: 2560 * 1600,
      cpu_brand: 'Intel i5',
      cpu_speed_ghz: 2.3,
      ram_gb: 16,
      storage_gb: 512,
      storage_type: 'SSD',
      gpu_brand: 'Intel',
      os: 'Mac',
      weight_kg: 1.37,
    },
    condition: 1.0,
  },
  {
    id: 'gaming',
    name: 'RTX Gaming Rig',
    specs: {
      brand: 'Asus',
      type: 'Gaming',
      inches: 15.6,
      touchscreen: false,
      ips: true,
      resolution_pixels: 1920 * 1080,
      cpu_brand: 'Intel i7',
      cpu_speed_ghz: 2.8,
      ram_gb: 16,
      storage_gb: 1024,
      storage_type: 'SSD',
      gpu_brand: 'Nvidia',
      os: 'Windows',
      weight_kg: 2.3,
    },
    condition: 0.95,
  },
  {
    id: 'business',
    name: 'Business Ultrabook',
    specs: {
      brand: 'Lenovo',
      type: 'Ultrabook',
      inches: 14.0,
      touchscreen: true,
      ips: true,
      resolution_pixels: 1920 * 1080,
      cpu_brand: 'Intel i7',
      cpu_speed_ghz: 2.6,
      ram_gb: 16,
      storage_gb: 512,
      storage_type: 'SSD',
      gpu_brand: 'Intel',
      os: 'Windows',
      weight_kg: 1.4,
    },
    condition: 0.95,
  },
  {
    id: 'budget',
    name: 'Budget / Basic',
    specs: {
      brand: 'HP',
      type: 'Notebook',
      inches: 15.6,
      touchscreen: false,
      ips: false,
      resolution_pixels: 1366 * 768,
      cpu_brand: 'Intel Other',
      cpu_speed_ghz: 1.6,
      ram_gb: 4,
      storage_gb: 500,
      storage_type: 'HDD',
      gpu_brand: 'Intel',
      os: 'Windows',
      weight_kg: 2.1,
    },
    condition: 0.8,
  },
];

// Current State
let currentSpecs = { ...PRESETS[0].specs };
let currentCondition = PRESETS[0].condition;
let currentCurrency = 'BDT'; // 'BDT' | 'USD' | 'EUR'
let activePresetId = 'student';

// DOM elements cache
const el = (id) => document.getElementById(id);

function initApp() {
  populateDropdowns();
  renderPresetChips();
  attachEventListeners();
  syncFormToState();
  recalculate();
}

function populateDropdowns() {
  const categories = MODEL_METADATA.categories;

  const populateSelect = (selectId, items, selectedVal) => {
    const sel = el(selectId);
    if (!sel) return;
    sel.innerHTML = '';
    items.forEach((item) => {
      const opt = document.createElement('option');
      opt.value = item;
      opt.textContent = item;
      if (item === selectedVal) opt.selected = true;
      sel.appendChild(opt);
    });
  };

  populateSelect('spec-brand', categories.brand || [], currentSpecs.brand);
  populateSelect('spec-type', categories.type || [], currentSpecs.type);
  populateSelect('spec-cpu', categories.cpu_brand || [], currentSpecs.cpu_brand);
  populateSelect('spec-gpu', categories.gpu_brand || [], currentSpecs.gpu_brand);
  populateSelect('spec-os', categories.os || [], currentSpecs.os);
  populateSelect('spec-storagetype', categories.storage_type || [], currentSpecs.storage_type);
}

function renderPresetChips() {
  const container = el('preset-chips-container');
  if (!container) return;
  container.innerHTML = '';

  PRESETS.forEach((p) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `preset-chip ${p.id === activePresetId ? 'active' : ''}`;
    btn.textContent = p.name;
    btn.addEventListener('click', () => {
      activePresetId = p.id;
      currentSpecs = { ...p.specs };
      currentCondition = p.condition;
      syncFormToState();
      updatePresetChipsUI();
      recalculate();
    });
    container.appendChild(btn);
  });
}

function updatePresetChipsUI() {
  const container = el('preset-chips-container');
  if (!container) return;
  const chips = container.querySelectorAll('.preset-chip');
  PRESETS.forEach((p, idx) => {
    if (chips[idx]) {
      chips[idx].classList.toggle('active', p.id === activePresetId);
    }
  });
}

function syncFormToState() {
  if (el('spec-brand')) el('spec-brand').value = currentSpecs.brand;
  if (el('spec-type')) el('spec-type').value = currentSpecs.type;
  if (el('spec-cpu')) el('spec-cpu').value = currentSpecs.cpu_brand;
  if (el('spec-gpu')) el('spec-gpu').value = currentSpecs.gpu_brand;
  if (el('spec-os')) el('spec-os').value = currentSpecs.os;
  if (el('spec-ram')) el('spec-ram').value = currentSpecs.ram_gb;
  if (el('spec-storagegb')) el('spec-storagegb').value = currentSpecs.storage_gb;
  if (el('spec-storagetype')) el('spec-storagetype').value = currentSpecs.storage_type;
  if (el('spec-res')) el('spec-res').value = currentSpecs.resolution_pixels;

  if (el('spec-cpuspeed')) {
    el('spec-cpuspeed').value = currentSpecs.cpu_speed_ghz;
    el('val-cpuspeed').textContent = `${currentSpecs.cpu_speed_ghz} GHz`;
  }
  if (el('spec-inches')) {
    el('spec-inches').value = currentSpecs.inches;
    el('val-inches').textContent = `${currentSpecs.inches}"`;
  }
  if (el('spec-weight')) {
    el('spec-weight').value = currentSpecs.weight_kg;
    el('val-weight').textContent = `${currentSpecs.weight_kg} kg`;
  }

  // Toggles
  const touchSwitch = el('toggle-touch-switch');
  if (touchSwitch) touchSwitch.classList.toggle('active', !!currentSpecs.touchscreen);

  const ipsSwitch = el('toggle-ips-switch');
  if (ipsSwitch) ipsSwitch.classList.toggle('active', !!currentSpecs.ips);

  // Condition buttons
  document.querySelectorAll('.cond-btn').forEach((btn) => {
    const mult = parseFloat(btn.dataset.mult);
    btn.classList.toggle('active', mult === currentCondition);
  });
  if (el('val-condition')) {
    el('val-condition').textContent = `${Math.round(currentCondition * 100)}%`;
  }
}

function attachEventListeners() {
  // Input changes
  const addChange = (id, fn) => {
    const elem = el(id);
    if (!elem) return;
    elem.addEventListener('change', (e) => {
      activePresetId = '';
      updatePresetChipsUI();
      fn(e);
      recalculate();
    });
    elem.addEventListener('input', (e) => {
      activePresetId = '';
      updatePresetChipsUI();
      fn(e);
      recalculate();
    });
  };

  addChange('spec-brand', (e) => (currentSpecs.brand = e.target.value));
  addChange('spec-type', (e) => (currentSpecs.type = e.target.value));
  addChange('spec-cpu', (e) => (currentSpecs.cpu_brand = e.target.value));
  addChange('spec-gpu', (e) => (currentSpecs.gpu_brand = e.target.value));
  addChange('spec-os', (e) => (currentSpecs.os = e.target.value));
  addChange('spec-ram', (e) => (currentSpecs.ram_gb = parseInt(e.target.value, 10)));
  addChange('spec-storagegb', (e) => (currentSpecs.storage_gb = parseInt(e.target.value, 10)));
  addChange('spec-storagetype', (e) => (currentSpecs.storage_type = e.target.value));
  addChange('spec-res', (e) => (currentSpecs.resolution_pixels = parseInt(e.target.value, 10)));

  addChange('spec-cpuspeed', (e) => {
    currentSpecs.cpu_speed_ghz = parseFloat(e.target.value);
    el('val-cpuspeed').textContent = `${currentSpecs.cpu_speed_ghz} GHz`;
  });

  addChange('spec-inches', (e) => {
    currentSpecs.inches = parseFloat(e.target.value);
    el('val-inches').textContent = `${currentSpecs.inches}"`;
  });

  addChange('spec-weight', (e) => {
    currentSpecs.weight_kg = parseFloat(e.target.value);
    el('val-weight').textContent = `${currentSpecs.weight_kg} kg`;
  });

  // Toggles
  el('toggle-touch-row')?.addEventListener('click', () => {
    currentSpecs.touchscreen = !currentSpecs.touchscreen;
    el('toggle-touch-switch')?.classList.toggle('active', currentSpecs.touchscreen);
    activePresetId = '';
    updatePresetChipsUI();
    recalculate();
  });

  el('toggle-ips-row')?.addEventListener('click', () => {
    currentSpecs.ips = !currentSpecs.ips;
    el('toggle-ips-switch')?.classList.toggle('active', currentSpecs.ips);
    activePresetId = '';
    updatePresetChipsUI();
    recalculate();
  });

  // Condition buttons
  document.querySelectorAll('.cond-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentCondition = parseFloat(btn.dataset.mult);
      document.querySelectorAll('.cond-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      if (el('val-condition')) {
        el('val-condition').textContent = `${Math.round(currentCondition * 100)}%`;
      }
      recalculate();
    });
  });

  // Currency switcher
  document.querySelectorAll('.curr-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentCurrency = btn.dataset.curr;
      document.querySelectorAll('.curr-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      recalculate();
    });
  });

  // Benchmark toggle
  el('toggle-benchmark-btn')?.addEventListener('click', () => {
    const card = el('benchmark-section');
    if (!card) return;
    const isHidden = card.style.display === 'none' || !card.style.display;
    card.style.display = isHidden ? 'block' : 'none';
    el('toggle-benchmark-btn').textContent = isHidden ? 'Hide benchmarks' : 'View benchmarks';
  });
}

function recalculate() {
  const result = predictPrice(currentSpecs, currentCondition);

  // Update symbols and amounts
  const symbol = currentCurrency === 'BDT' ? '৳' : currentCurrency === 'USD' ? '$' : '€';
  const amount =
    currentCurrency === 'BDT'
      ? result.priceBdt
      : currentCurrency === 'USD'
      ? result.priceUsd
      : result.priceEur;

  const low =
    currentCurrency === 'BDT'
      ? result.lowBdt
      : currentCurrency === 'USD'
      ? Math.round(result.lowBdt / 120)
      : Math.round(result.lowBdt / 128);

  const high =
    currentCurrency === 'BDT'
      ? result.highBdt
      : currentCurrency === 'USD'
      ? Math.round(result.highBdt / 120)
      : Math.round(result.highBdt / 128);

  if (el('price-symbol')) el('price-symbol').textContent = symbol;
  if (el('price-amount')) el('price-amount').textContent = amount.toLocaleString();
  if (el('price-range-text')) {
    el('price-range-text').textContent = `${symbol}${low.toLocaleString()} – ${symbol}${high.toLocaleString()}`;
  }

  // Update Summary Card
  if (el('sum-config')) {
    el('sum-config').textContent = `${currentSpecs.brand} ${currentSpecs.type}`;
  }
  if (el('sum-cpu')) {
    el('sum-cpu').textContent = `${currentSpecs.cpu_brand} @ ${currentSpecs.cpu_speed_ghz} GHz`;
  }
  if (el('sum-storage')) {
    el('sum-storage').textContent = `${currentSpecs.ram_gb} GB • ${currentSpecs.storage_gb} GB ${currentSpecs.storage_type}`;
  }
  if (el('sum-gpu')) {
    el('sum-gpu').textContent = `${currentSpecs.gpu_brand} • ${currentSpecs.os}`;
  }
  if (el('sum-display')) {
    const touch = currentSpecs.touchscreen ? 'Touch' : '';
    const ips = currentSpecs.ips ? 'IPS' : '';
    const features = [ips, touch].filter(Boolean).join('/');
    el('sum-display').textContent = `${currentSpecs.inches}" ${features ? `(${features})` : ''} • ${currentSpecs.weight_kg}kg`;
  }
}

// Boot on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
