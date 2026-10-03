import { predictPrice, MODEL_METADATA } from './model/predictor.js';
import { BRAND_RULES } from './model/brand_data.js';

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
      has_dedicated_gpu: false,
      dedicated_gpu_brand: 'Nvidia',
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
      has_dedicated_gpu: false,
      dedicated_gpu_brand: 'AMD',
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
      has_dedicated_gpu: true,
      dedicated_gpu_brand: 'Nvidia',
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
      has_dedicated_gpu: false,
      dedicated_gpu_brand: 'Nvidia',
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
      has_dedicated_gpu: false,
      dedicated_gpu_brand: 'Nvidia',
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
  populateBrandSelect();
  updateDependentOptions(currentSpecs.brand);
  renderPresetChips();
  attachEventListeners();
  syncFormToState();
  recalculate();
}

function populateBrandSelect() {
  const brandSelect = el('spec-brand');
  if (!brandSelect) return;
  const brands = Object.keys(BRAND_RULES).sort();
  brandSelect.innerHTML = '';
  brands.forEach((brand) => {
    const opt = document.createElement('option');
    opt.value = brand;
    opt.textContent = brand;
    if (brand === currentSpecs.brand) opt.selected = true;
    brandSelect.appendChild(opt);
  });
}

/**
 * Updates types, OS, CPUs, and GPU options based on the chosen brand constraints.
 */
function updateDependentOptions(brand) {
  const rules = BRAND_RULES[brand] || BRAND_RULES['Dell'];

  // 1. Laptop Type
  const typeSelect = el('spec-type');
  if (typeSelect) {
    typeSelect.innerHTML = '';
    rules.types.forEach((t) => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      typeSelect.appendChild(opt);
    });

    if (!rules.types.includes(currentSpecs.type)) {
      currentSpecs.type = rules.default_type || rules.types[0];
    }
    typeSelect.value = currentSpecs.type;
  }

  // Type helper note
  const typeNote = el('type-helper-note');
  if (typeNote) {
    if (brand === 'Apple') {
      typeNote.textContent = 'Apple only manufactures premium portable Ultrabooks (MacBook Air & MacBook Pro).';
      typeNote.style.display = 'block';
    } else if (brand === 'MSI') {
      typeNote.textContent = 'MSI specializes exclusively in high-performance Gaming laptops.';
      typeNote.style.display = 'block';
    } else {
      typeNote.style.display = 'none';
    }
  }

  // 2. Operating System
  const osSelect = el('spec-os');
  if (osSelect) {
    osSelect.innerHTML = '';
    rules.os.forEach((o) => {
      const opt = document.createElement('option');
      opt.value = o;
      opt.textContent = o;
      osSelect.appendChild(opt);
    });

    if (!rules.os.includes(currentSpecs.os)) {
      currentSpecs.os = rules.default_os || rules.os[0];
    }
    osSelect.value = currentSpecs.os;
    osSelect.disabled = rules.os.length === 1;
  }

  // 3. CPU Brands
  const cpuSelect = el('spec-cpu');
  if (cpuSelect) {
    cpuSelect.innerHTML = '';
    rules.cpu_brands.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      cpuSelect.appendChild(opt);
    });

    if (!rules.cpu_brands.includes(currentSpecs.cpu_brand)) {
      currentSpecs.cpu_brand = rules.cpu_brands[0];
    }
    cpuSelect.value = currentSpecs.cpu_brand;
  }

  // 4. Storage Type
  const storageTypeSelect = el('spec-storagetype');
  if (storageTypeSelect) {
    storageTypeSelect.innerHTML = '';
    rules.storage_types.forEach((st) => {
      const opt = document.createElement('option');
      opt.value = st;
      opt.textContent = st;
      storageTypeSelect.appendChild(opt);
    });

    if (!rules.storage_types.includes(currentSpecs.storage_type)) {
      currentSpecs.storage_type = rules.storage_types[0];
    }
    storageTypeSelect.value = currentSpecs.storage_type;
    storageTypeSelect.disabled = rules.storage_types.length === 1;
  }

  // 5. Touchscreen Support
  const touchRow = el('toggle-touch-row');
  const touchNote = el('touch-helper-note');
  if (brand === 'Apple') {
    currentSpecs.touchscreen = false;
    if (touchRow) touchRow.classList.add('disabled');
    if (touchNote) {
      touchNote.textContent = 'Touchscreens are not supported on Apple MacBooks.';
      touchNote.style.display = 'block';
    }
  } else if (currentSpecs.type === '2 in 1 Convertible') {
    currentSpecs.touchscreen = true;
    if (touchRow) touchRow.classList.remove('disabled');
    if (touchNote) {
      touchNote.textContent = '2-in-1 Convertibles require a touchscreen by design.';
      touchNote.style.display = 'block';
    }
  } else if (!rules.touchscreen_supported) {
    currentSpecs.touchscreen = false;
    if (touchRow) touchRow.classList.add('disabled');
    if (touchNote) {
      touchNote.textContent = 'Touchscreen is not supported on this manufacturer form factor.';
      touchNote.style.display = 'block';
    }
  } else {
    if (touchRow) touchRow.classList.remove('disabled');
    if (touchNote) touchNote.style.display = 'none';
  }

  // 6. Dedicated GPU Constraints
  const dedicatedGpuCard = el('gpu-card-dedicated');
  const dedicatedBrandSelect = el('spec-dedicated-gpubrand');
  const gpuNote = el('gpu-helper-note');

  if (!rules.has_dedicated_gpu) {
    currentSpecs.has_dedicated_gpu = false;
    if (dedicatedGpuCard) dedicatedGpuCard.classList.add('disabled');
    if (gpuNote) {
      gpuNote.textContent = 'Dedicated discrete GPUs are not offered on this brand/model.';
      gpuNote.style.display = 'block';
    }
  } else {
    if (dedicatedGpuCard) dedicatedGpuCard.classList.remove('disabled');
    if (gpuNote) gpuNote.style.display = 'none';

    // Populate dedicated options (e.g. AMD for Apple, Nvidia/AMD for Dell)
    if (dedicatedBrandSelect) {
      dedicatedBrandSelect.innerHTML = '';
      rules.dedicated_gpu_options.forEach((dg) => {
        const opt = document.createElement('option');
        opt.value = dg;
        opt.textContent = dg === 'Nvidia' ? 'Nvidia GeForce' : 'AMD Radeon';
        dedicatedBrandSelect.appendChild(opt);
      });

      if (!rules.dedicated_gpu_options.includes(currentSpecs.dedicated_gpu_brand)) {
        currentSpecs.dedicated_gpu_brand = rules.dedicated_gpu_options[0];
      }
      dedicatedBrandSelect.value = currentSpecs.dedicated_gpu_brand;
    }
  }

  // If Gaming, default to dedicated GPU
  if (currentSpecs.type === 'Gaming' && rules.has_dedicated_gpu) {
    currentSpecs.has_dedicated_gpu = true;
  }
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
      updateDependentOptions(currentSpecs.brand);
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

  // GPU Card selection UI
  const cardIntegrated = el('gpu-card-integrated');
  const cardDedicated = el('gpu-card-dedicated');
  const dedicatedBrandContainer = el('dedicated-gpu-selector-box');
  const dedicatedBrandSelect = el('spec-dedicated-gpubrand');

  if (cardIntegrated && cardDedicated) {
    if (currentSpecs.has_dedicated_gpu) {
      cardIntegrated.classList.remove('active');
      cardDedicated.classList.add('active');
      if (dedicatedBrandContainer) dedicatedBrandContainer.style.display = 'block';
    } else {
      cardIntegrated.classList.add('active');
      cardDedicated.classList.remove('active');
      if (dedicatedBrandContainer) dedicatedBrandContainer.style.display = 'none';
    }
  }

  if (dedicatedBrandSelect) {
    dedicatedBrandSelect.value = currentSpecs.dedicated_gpu_brand;
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
  const markCustom = () => {
    activePresetId = '';
    updatePresetChipsUI();
  };

  // 1. Brand Change Listener
  el('spec-brand')?.addEventListener('change', (e) => {
    markCustom();
    currentSpecs.brand = e.target.value;
    updateDependentOptions(currentSpecs.brand);
    syncFormToState();
    recalculate();
  });

  // 2. Type Change Listener
  el('spec-type')?.addEventListener('change', (e) => {
    markCustom();
    currentSpecs.type = e.target.value;
    const rules = BRAND_RULES[currentSpecs.brand] || BRAND_RULES['Dell'];

    if (currentSpecs.type === '2 in 1 Convertible') {
      currentSpecs.touchscreen = true;
    } else if (currentSpecs.brand === 'Apple') {
      currentSpecs.touchscreen = false;
    }

    if (currentSpecs.type === 'Gaming' && rules.has_dedicated_gpu) {
      currentSpecs.has_dedicated_gpu = true;
    } else if (currentSpecs.type === 'Ultrabook') {
      currentSpecs.weight_kg = rules.typical_weight < 1.6 ? rules.typical_weight : 1.35;
      currentSpecs.storage_type = 'SSD';
    }

    updateDependentOptions(currentSpecs.brand);
    syncFormToState();
    recalculate();
  });

  // 3. GPU Cards Listener
  el('gpu-card-integrated')?.addEventListener('click', () => {
    markCustom();
    currentSpecs.has_dedicated_gpu = false;
    syncFormToState();
    recalculate();
  });

  el('gpu-card-dedicated')?.addEventListener('click', () => {
    const rules = BRAND_RULES[currentSpecs.brand] || BRAND_RULES['Dell'];
    if (!rules.has_dedicated_gpu) return;
    markCustom();
    currentSpecs.has_dedicated_gpu = true;
    syncFormToState();
    recalculate();
  });

  el('spec-dedicated-gpubrand')?.addEventListener('change', (e) => {
    markCustom();
    currentSpecs.dedicated_gpu_brand = e.target.value;
    recalculate();
  });

  // 4. Other Standard Controls
  const addChange = (id, fn) => {
    const elem = el(id);
    if (!elem) return;
    elem.addEventListener('change', (e) => {
      markCustom();
      fn(e);
      recalculate();
    });
    elem.addEventListener('input', (e) => {
      markCustom();
      fn(e);
      recalculate();
    });
  };

  addChange('spec-cpu', (e) => (currentSpecs.cpu_brand = e.target.value));
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
    const rules = BRAND_RULES[currentSpecs.brand] || BRAND_RULES['Dell'];
    if (currentSpecs.brand === 'Apple' || !rules.touchscreen_supported) return;
    if (currentSpecs.type === '2 in 1 Convertible') return; // Cannot turn off touch on convertible

    markCustom();
    currentSpecs.touchscreen = !currentSpecs.touchscreen;
    el('toggle-touch-switch')?.classList.toggle('active', currentSpecs.touchscreen);
    recalculate();
  });

  el('toggle-ips-row')?.addEventListener('click', () => {
    markCustom();
    currentSpecs.ips = !currentSpecs.ips;
    el('toggle-ips-switch')?.classList.toggle('active', currentSpecs.ips);
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

function resolveGpuBrand(specs) {
  if (!specs.has_dedicated_gpu) {
    return specs.cpu_brand === 'AMD' ? 'AMD' : 'Intel';
  }
  return specs.dedicated_gpu_brand || 'Nvidia';
}

function generateMarketDrivers(specs, result) {
  const drivers = [];

  // GPU Driver
  if (specs.has_dedicated_gpu) {
    drivers.push({
      type: 'positive',
      title: 'Dedicated Graphics',
      desc: `${specs.dedicated_gpu_brand === 'Nvidia' ? 'Nvidia GeForce' : 'AMD Radeon'} dedicated VRAM adds value for gaming and 3D tasks.`,
    });
  } else {
    drivers.push({
      type: 'neutral',
      title: 'Integrated Graphics',
      desc: 'Shared system memory graphics keeps cost accessible and maximizes battery life.',
    });
  }

  // Brand / OS
  if (specs.brand === 'Apple') {
    drivers.push({
      type: 'positive',
      title: 'Apple Ecosystem',
      desc: 'High residual resale value retention and build quality.',
    });
  }

  // Storage
  if (specs.storage_type === 'SSD') {
    drivers.push({
      type: 'positive',
      title: 'Solid State Drive',
      desc: 'Fast NVMe/SATA SSD storage is favored over traditional hard drives.',
    });
  } else if (specs.storage_type === 'HDD') {
    drivers.push({
      type: 'negative',
      title: 'Mechanical HDD',
      desc: 'Spinning hard drive reduces market valuation compared to modern SSDs.',
    });
  }

  // Display
  if (specs.resolution_pixels >= 4000000) {
    drivers.push({
      type: 'positive',
      title: 'High Resolution Display',
      desc: 'Retina / 4K high pixel density panel commands a visual premium.',
    });
  }

  // RAM
  if (specs.ram_gb >= 16) {
    drivers.push({
      type: 'positive',
      title: 'High RAM Capacity',
      desc: `${specs.ram_gb} GB RAM offers strong multitasking overhead.`,
    });
  }

  return drivers;
}

function recalculate() {
  // Construct ML feature input payload
  const resolvedGpu = resolveGpuBrand(currentSpecs);
  const mlSpecs = {
    brand: currentSpecs.brand,
    type: currentSpecs.type,
    cpu_brand: currentSpecs.cpu_brand,
    cpu_speed_ghz: currentSpecs.cpu_speed_ghz,
    storage_type: currentSpecs.storage_type,
    gpu_brand: resolvedGpu,
    os: currentSpecs.os,
    inches: currentSpecs.inches,
    touchscreen: currentSpecs.touchscreen,
    ips: currentSpecs.ips,
    resolution_pixels: currentSpecs.resolution_pixels,
    ram_gb: currentSpecs.ram_gb,
    storage_gb: currentSpecs.storage_gb,
    weight_kg: currentSpecs.weight_kg,
  };

  const result = predictPrice(mlSpecs, currentCondition);

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
    el('sum-gpu').textContent = currentSpecs.has_dedicated_gpu
      ? `Dedicated ${currentSpecs.dedicated_gpu_brand === 'Nvidia' ? 'Nvidia GeForce' : 'AMD Radeon'}`
      : 'Integrated Graphics (No Dedicated GPU)';
  }
  if (el('sum-display')) {
    const touch = currentSpecs.touchscreen ? 'Touch' : '';
    const ips = currentSpecs.ips ? 'IPS' : '';
    const features = [ips, touch].filter(Boolean).join('/');
    el('sum-display').textContent = `${currentSpecs.inches}" ${features ? `(${features})` : ''} • ${currentSpecs.weight_kg}kg`;
  }

  // Render Market Value Drivers
  const driversContainer = el('market-drivers-list');
  if (driversContainer) {
    const drivers = generateMarketDrivers(currentSpecs, result);
    driversContainer.innerHTML = '';
    drivers.forEach((d) => {
      const item = document.createElement('div');
      item.className = `market-driver-badge ${d.type}`;
      item.innerHTML = `<strong>${d.title}:</strong> ${d.desc}`;
      driversContainer.appendChild(item);
    });
  }
}

// Boot on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
