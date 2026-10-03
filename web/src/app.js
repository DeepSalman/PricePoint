import { predictPrice, MODEL_METADATA } from './model/predictor.js';
import {
  BRAND_CATALOG,
  PROCESSOR_CATALOG,
  GRAPHICS_CATALOG,
  RELEASE_ERAS,
} from './model/laptop_knowledge.js';

// Pre-defined templates for quick exploration (No emojis)
const PRESETS = [
  {
    id: 'macbook_air_m2',
    name: 'MacBook Air M2 (13.6-inch)',
    config: {
      brand: 'Apple',
      seriesId: 'air',
      chipId: 'm2',
      eraId: 'recent',
      hasDedicatedGpu: false,
      dedicatedGpuId: 'apple_silicon_gpu',
      integratedGpuId: 'apple_silicon_gpu',
      os: 'Mac',
      cpu_speed_ghz: 2.8,
      ram_gb: 16,
      storage_gb: 512,
      storage_type: 'SSD',
      resolution_pixels: 2560 * 1664,
      inches: 13.6,
      touchscreen: false,
      ips: true,
      weight_kg: 1.24,
    },
    condition: 0.9,
  },
  {
    id: 'macbook_pro_m3max',
    name: 'MacBook Pro 16" (M3 Max)',
    config: {
      brand: 'Apple',
      seriesId: 'pro_max',
      chipId: 'm3_max',
      eraId: 'current',
      hasDedicatedGpu: false,
      dedicatedGpuId: 'apple_silicon_gpu',
      integratedGpuId: 'apple_silicon_gpu',
      os: 'Mac',
      cpu_speed_ghz: 3.4,
      ram_gb: 36,
      storage_gb: 1024,
      storage_type: 'SSD',
      resolution_pixels: 3456 * 2234,
      inches: 16.2,
      touchscreen: false,
      ips: true,
      weight_kg: 2.15,
    },
    condition: 1.0,
  },
  {
    id: 'dell_xps14',
    name: 'Dell XPS 14 (Core Ultra 7)',
    config: {
      brand: 'Dell',
      seriesId: 'xps',
      chipId: 'intel_ultra7',
      eraId: 'current',
      hasDedicatedGpu: false,
      dedicatedGpuId: 'nvidia_rtx40',
      integratedGpuId: 'intel_integrated',
      os: 'Windows',
      cpu_speed_ghz: 3.0,
      ram_gb: 16,
      storage_gb: 512,
      storage_type: 'SSD',
      resolution_pixels: 2560 * 1600,
      inches: 14.0,
      touchscreen: true,
      ips: true,
      weight_kg: 1.45,
    },
    condition: 1.0,
  },
  {
    id: 'lenovo_legion',
    name: 'Lenovo Legion Pro 5 (RTX 4070)',
    config: {
      brand: 'Lenovo',
      seriesId: 'legion',
      chipId: 'intel_i7',
      eraId: 'current',
      hasDedicatedGpu: true,
      dedicatedGpuId: 'nvidia_rtx40',
      integratedGpuId: 'intel_integrated',
      os: 'Windows',
      cpu_speed_ghz: 3.2,
      ram_gb: 32,
      storage_gb: 1024,
      storage_type: 'SSD',
      resolution_pixels: 2560 * 1600,
      inches: 16.0,
      touchscreen: false,
      ips: true,
      weight_kg: 2.4,
    },
    condition: 0.95,
  },
  {
    id: 'thinkpad_x1',
    name: 'ThinkPad X1 Carbon (Business)',
    config: {
      brand: 'Lenovo',
      seriesId: 'thinkpad',
      chipId: 'intel_ultra7',
      eraId: 'recent',
      hasDedicatedGpu: false,
      dedicatedGpuId: 'intel_integrated',
      integratedGpuId: 'intel_integrated',
      os: 'Windows',
      cpu_speed_ghz: 2.8,
      ram_gb: 16,
      storage_gb: 512,
      storage_type: 'SSD',
      resolution_pixels: 1920 * 1200,
      inches: 14.0,
      touchscreen: true,
      ips: true,
      weight_kg: 1.35,
    },
    condition: 0.95,
  },
  {
    id: 'hp_pavilion',
    name: 'HP Pavilion 15 (Everyday Student)',
    config: {
      brand: 'HP',
      seriesId: 'pavilion',
      chipId: 'intel_i5',
      eraId: 'recent',
      hasDedicatedGpu: false,
      dedicatedGpuId: 'intel_integrated',
      integratedGpuId: 'intel_integrated',
      os: 'Windows',
      cpu_speed_ghz: 2.5,
      ram_gb: 8,
      storage_gb: 512,
      storage_type: 'SSD',
      resolution_pixels: 1920 * 1080,
      inches: 15.6,
      touchscreen: false,
      ips: false,
      weight_kg: 1.75,
    },
    condition: 0.9,
  },
];

// Application State
let currentConfig = { ...PRESETS[0].config };
let currentCondition = PRESETS[0].condition;
let currentCurrency = 'BDT'; // 'BDT' | 'USD' | 'EUR'
let activePresetId = 'macbook_air_m2';

// DOM utility
const el = (id) => document.getElementById(id);

function initApp() {
  populateBrandSelect();
  populateEraSelect();
  syncBrandAndSeries(currentConfig.brand, currentConfig.seriesId, false);
  renderPresetChips();
  attachEventListeners();
  syncFormToState();
  recalculate();
}

function populateBrandSelect() {
  const brandSelect = el('spec-brand');
  if (!brandSelect) return;
  const brands = Object.keys(BRAND_CATALOG).sort();
  brandSelect.innerHTML = '';
  brands.forEach((brand) => {
    const opt = document.createElement('option');
    opt.value = brand;
    opt.textContent = brand;
    if (brand === currentConfig.brand) opt.selected = true;
    brandSelect.appendChild(opt);
  });
}

function populateEraSelect() {
  const eraSelect = el('spec-era');
  if (!eraSelect) return;
  eraSelect.innerHTML = '';
  RELEASE_ERAS.forEach((era) => {
    const opt = document.createElement('option');
    opt.value = era.id;
    opt.textContent = era.label;
    if (era.id === currentConfig.eraId) opt.selected = true;
    eraSelect.appendChild(opt);
  });
  updateEraNote(currentConfig.eraId);
}

function updateEraNote(eraId) {
  const note = el('era-helper-note');
  if (!note) return;
  const era = RELEASE_ERAS.find((e) => e.id === eraId) || RELEASE_ERAS[1];
  note.textContent = era.desc;
}

/**
 * Synchronizes series, processor, GPU, and constraints when brand or series changes.
 */
function syncBrandAndSeries(brandKey, desiredSeriesId, resetDefaults = true) {
  const brandData = BRAND_CATALOG[brandKey] || BRAND_CATALOG['Apple'];
  currentConfig.brand = brandKey;

  // 1. Populate Series
  const seriesSelect = el('spec-series');
  if (seriesSelect) {
    seriesSelect.innerHTML = '';
    brandData.series.forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.name;
      seriesSelect.appendChild(opt);
    });

    const seriesExists = brandData.series.some((s) => s.id === desiredSeriesId);
    currentConfig.seriesId = seriesExists ? desiredSeriesId : brandData.defaultSeries;
    seriesSelect.value = currentConfig.seriesId;
  }

  const series = brandData.series.find((s) => s.id === currentConfig.seriesId) || brandData.series[0];

  // Update Series Badge and Description
  const badgeEl = el('series-badge');
  if (badgeEl) badgeEl.textContent = series.badge;
  const seriesNote = el('series-helper-note');
  if (seriesNote) seriesNote.textContent = series.desc;

  // Set series defaults if requested
  if (resetDefaults) {
    currentConfig.inches = series.defaultInches;
    currentConfig.weight_kg = series.defaultWeight;
    currentConfig.resolution_pixels = series.defaultRes;
    currentConfig.ram_gb = series.defaultRam;
    currentConfig.storage_gb = series.defaultStorage;
    currentConfig.chipId = series.defaultChip;
    currentConfig.integratedGpuId = series.defaultGpu;
    if (series.formFactor === 'Gaming' || series.formFactor === 'Workstation') {
      currentConfig.hasDedicatedGpu = true;
      currentConfig.dedicatedGpuId = series.gpuOptions.find((g) => GRAPHICS_CATALOG[g]?.isDedicated) || 'nvidia_rtx40';
    } else {
      currentConfig.hasDedicatedGpu = false;
    }
  }

  // 2. Populate Processors for this series
  const cpuSelect = el('spec-cpu');
  if (cpuSelect) {
    cpuSelect.innerHTML = '';
    series.chipTiers.forEach((chipKey) => {
      const chip = PROCESSOR_CATALOG[chipKey];
      if (chip) {
        const opt = document.createElement('option');
        opt.value = chipKey;
        opt.textContent = chip.label;
        cpuSelect.appendChild(opt);
      }
    });

    if (!series.chipTiers.includes(currentConfig.chipId)) {
      currentConfig.chipId = series.defaultChip;
    }
    cpuSelect.value = currentConfig.chipId;
    updateCpuNote(currentConfig.chipId);
  }

  // 3. Operating System constraints
  const osSelect = el('spec-os');
  if (osSelect) {
    osSelect.innerHTML = '';
    series.os.forEach((o) => {
      const opt = document.createElement('option');
      opt.value = o;
      opt.textContent = o;
      osSelect.appendChild(opt);
    });

    if (!series.os.includes(currentConfig.os)) {
      currentConfig.os = series.os[0];
    }
    osSelect.value = currentConfig.os;
    osSelect.disabled = series.os.length === 1;
  }

  // 4. Touchscreen constraint
  const touchRow = el('toggle-touch-row');
  const touchNote = el('touch-helper-note');
  if (currentConfig.brand === 'Apple') {
    currentConfig.touchscreen = false;
    if (touchRow) touchRow.classList.add('disabled');
    if (touchNote) {
      touchNote.textContent = 'Apple MacBooks do not feature touchscreens. macOS is optimized for Trackpad gesture control.';
      touchNote.style.display = 'block';
    }
  } else if (series.formFactor === '2 in 1 Convertible') {
    currentConfig.touchscreen = true;
    if (touchRow) touchRow.classList.remove('disabled');
    if (touchNote) {
      touchNote.textContent = '2-in-1 Convertibles require a 360-degree touchscreen display.';
      touchNote.style.display = 'block';
    }
  } else if (!series.touchSupported) {
    currentConfig.touchscreen = false;
    if (touchRow) touchRow.classList.add('disabled');
    if (touchNote) {
      touchNote.textContent = 'Touchscreen is not supported on this performance gaming display.';
      touchNote.style.display = 'block';
    }
  } else {
    if (touchRow) touchRow.classList.remove('disabled');
    if (touchNote) touchNote.style.display = 'none';
  }

  // 5. Storage Type constraint
  const storageTypeSelect = el('spec-storagetype');
  const storageNote = el('storage-helper-note');
  if (storageTypeSelect) {
    if (currentConfig.brand === 'Apple') {
      storageTypeSelect.value = 'SSD';
      storageTypeSelect.disabled = true;
      if (storageNote) {
        storageNote.textContent = 'High-speed unified NVMe flash storage standard on Apple hardware.';
        storageNote.style.display = 'block';
      }
    } else {
      storageTypeSelect.disabled = false;
      if (storageNote) storageNote.style.display = 'none';
    }
  }

  // 6. Graphics configuration
  updateGraphicsUI(series);
}

function updateCpuNote(chipKey) {
  const note = el('cpu-helper-note');
  const chip = PROCESSOR_CATALOG[chipKey];
  if (!note || !chip) return;
  note.textContent = chip.desc;

  // Set default clock speed from chip
  currentConfig.cpu_speed_ghz = chip.speedGhz;
  const speedInput = el('spec-cpuspeed');
  if (speedInput) {
    speedInput.value = chip.speedGhz;
    el('val-cpuspeed').textContent = `${chip.speedGhz} GHz`;
  }
}

function updateGraphicsUI(series) {
  const cardIntegrated = el('gpu-card-integrated');
  const cardDedicated = el('gpu-card-dedicated');
  const integratedTitle = el('gpu-integrated-title');
  const integratedDesc = el('gpu-integrated-desc');
  const dedicatedContainer = el('dedicated-gpu-selector-box');
  const dedicatedSelect = el('spec-dedicated-gpu');
  const gpuNote = el('gpu-helper-note');

  const chip = PROCESSOR_CATALOG[currentConfig.chipId];
  const isAppleSilicon = chip?.family === 'Apple' && currentConfig.chipId.startsWith('m');
  const dedicatedOptions = series.gpuOptions.filter((g) => GRAPHICS_CATALOG[g]?.isDedicated);

  // Customize Integrated title & desc
  if (isAppleSilicon) {
    currentConfig.integratedGpuId = 'apple_silicon_gpu';
    if (integratedTitle) integratedTitle.textContent = 'Apple Silicon Unified GPU';
    if (integratedDesc) {
      integratedDesc.textContent = 'On-chip high-bandwidth GPU sharing unified memory across CPU and Neural Engine. No discrete GPU required.';
    }
  } else if (chip?.mlCpuBrand === 'AMD') {
    currentConfig.integratedGpuId = 'amd_integrated';
    if (integratedTitle) integratedTitle.textContent = 'AMD Radeon Integrated Graphics';
    if (integratedDesc) {
      integratedDesc.textContent = 'RDNA onboard processor graphics with capable 1080p efficiency.';
    }
  } else {
    currentConfig.integratedGpuId = 'intel_integrated';
    if (integratedTitle) integratedTitle.textContent = 'Intel Iris Xe / Arc Integrated Graphics';
    if (integratedDesc) {
      integratedDesc.textContent = 'Shared processor memory. Low thermal footprint and maximum battery life.';
    }
  }

  // Handle Dedicated GPU availability
  if (isAppleSilicon) {
    currentConfig.hasDedicatedGpu = false;
    if (cardDedicated) cardDedicated.classList.add('disabled');
    if (gpuNote) {
      gpuNote.textContent = 'Apple Silicon integrates unified GPU cores directly on the M-series SoC (discrete GPUs not applicable).';
      gpuNote.style.display = 'block';
    }
  } else if (dedicatedOptions.length === 0) {
    currentConfig.hasDedicatedGpu = false;
    if (cardDedicated) cardDedicated.classList.add('disabled');
    if (gpuNote) {
      gpuNote.textContent = 'Dedicated discrete GPUs are not offered on this ultra-portable series.';
      gpuNote.style.display = 'block';
    }
  } else {
    if (cardDedicated) cardDedicated.classList.remove('disabled');
    if (gpuNote) gpuNote.style.display = 'none';

    // Populate dedicated options
    if (dedicatedSelect) {
      dedicatedSelect.innerHTML = '';
      dedicatedOptions.forEach((dgKey) => {
        const opt = document.createElement('option');
        opt.value = dgKey;
        opt.textContent = GRAPHICS_CATALOG[dgKey]?.label || dgKey;
        dedicatedSelect.appendChild(opt);
      });

      if (!dedicatedOptions.includes(currentConfig.dedicatedGpuId)) {
        currentConfig.dedicatedGpuId = dedicatedOptions[0];
      }
      dedicatedSelect.value = currentConfig.dedicatedGpuId;
    }
  }

  // Sync active card visual state
  if (cardIntegrated && cardDedicated) {
    if (currentConfig.hasDedicatedGpu) {
      cardIntegrated.classList.remove('active');
      cardDedicated.classList.add('active');
      if (dedicatedContainer) dedicatedContainer.style.display = 'block';
    } else {
      cardIntegrated.classList.add('active');
      cardDedicated.classList.remove('active');
      if (dedicatedContainer) dedicatedContainer.style.display = 'none';
    }
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
      currentConfig = { ...p.config };
      currentCondition = p.condition;
      syncBrandAndSeries(currentConfig.brand, currentConfig.seriesId, false);
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
  if (el('spec-brand')) el('spec-brand').value = currentConfig.brand;
  if (el('spec-series')) el('spec-series').value = currentConfig.seriesId;
  if (el('spec-era')) el('spec-era').value = currentConfig.eraId;
  if (el('spec-cpu')) el('spec-cpu').value = currentConfig.chipId;
  if (el('spec-os')) el('spec-os').value = currentConfig.os;
  if (el('spec-ram')) el('spec-ram').value = currentConfig.ram_gb;
  if (el('spec-storagegb')) el('spec-storagegb').value = currentConfig.storage_gb;
  if (el('spec-storagetype')) el('spec-storagetype').value = currentConfig.storage_type;
  if (el('spec-res')) el('spec-res').value = currentConfig.resolution_pixels;

  if (el('spec-cpuspeed')) {
    el('spec-cpuspeed').value = currentConfig.cpu_speed_ghz;
    el('val-cpuspeed').textContent = `${currentConfig.cpu_speed_ghz} GHz`;
  }
  if (el('spec-inches')) {
    el('spec-inches').value = currentConfig.inches;
    el('val-inches').textContent = `${currentConfig.inches}"`;
  }
  if (el('spec-weight')) {
    el('spec-weight').value = currentConfig.weight_kg;
    el('val-weight').textContent = `${currentConfig.weight_kg} kg`;
  }

  // Toggles
  const touchSwitch = el('toggle-touch-switch');
  if (touchSwitch) touchSwitch.classList.toggle('active', !!currentConfig.touchscreen);

  const ipsSwitch = el('toggle-ips-switch');
  if (ipsSwitch) ipsSwitch.classList.toggle('active', !!currentConfig.ips);

  // Condition buttons
  document.querySelectorAll('.cond-btn').forEach((btn) => {
    const mult = parseFloat(btn.dataset.mult);
    btn.classList.toggle('active', mult === currentCondition);
  });
  if (el('val-condition')) {
    el('val-condition').textContent = `${Math.round(currentCondition * 100)}%`;
  }

  const brandData = BRAND_CATALOG[currentConfig.brand] || BRAND_CATALOG['Apple'];
  const series = brandData.series.find((s) => s.id === currentConfig.seriesId) || brandData.series[0];
  updateGraphicsUI(series);
}

function attachEventListeners() {
  const markCustom = () => {
    activePresetId = '';
    updatePresetChipsUI();
  };

  // 1. Brand Change
  el('spec-brand')?.addEventListener('change', (e) => {
    markCustom();
    syncBrandAndSeries(e.target.value, null, true);
    syncFormToState();
    recalculate();
  });

  // 2. Series Change
  el('spec-series')?.addEventListener('change', (e) => {
    markCustom();
    syncBrandAndSeries(currentConfig.brand, e.target.value, true);
    syncFormToState();
    recalculate();
  });

  // 3. Era Change
  el('spec-era')?.addEventListener('change', (e) => {
    markCustom();
    currentConfig.eraId = e.target.value;
    updateEraNote(currentConfig.eraId);
    recalculate();
  });

  // 4. CPU Change
  el('spec-cpu')?.addEventListener('change', (e) => {
    markCustom();
    currentConfig.chipId = e.target.value;
    updateCpuNote(currentConfig.chipId);
    const brandData = BRAND_CATALOG[currentConfig.brand] || BRAND_CATALOG['Apple'];
    const series = brandData.series.find((s) => s.id === currentConfig.seriesId) || brandData.series[0];
    updateGraphicsUI(series);
    recalculate();
  });

  // 5. GPU Card Integrated
  el('gpu-card-integrated')?.addEventListener('click', () => {
    markCustom();
    currentConfig.hasDedicatedGpu = false;
    const brandData = BRAND_CATALOG[currentConfig.brand] || BRAND_CATALOG['Apple'];
    const series = brandData.series.find((s) => s.id === currentConfig.seriesId) || brandData.series[0];
    updateGraphicsUI(series);
    recalculate();
  });

  // 6. GPU Card Dedicated
  el('gpu-card-dedicated')?.addEventListener('click', () => {
    const chip = PROCESSOR_CATALOG[currentConfig.chipId];
    if (chip?.family === 'Apple' && currentConfig.chipId.startsWith('m')) return;
    const brandData = BRAND_CATALOG[currentConfig.brand] || BRAND_CATALOG['Apple'];
    const series = brandData.series.find((s) => s.id === currentConfig.seriesId) || brandData.series[0];
    const dedicatedOptions = series.gpuOptions.filter((g) => GRAPHICS_CATALOG[g]?.isDedicated);
    if (dedicatedOptions.length === 0) return;

    markCustom();
    currentConfig.hasDedicatedGpu = true;
    updateGraphicsUI(series);
    recalculate();
  });

  el('spec-dedicated-gpu')?.addEventListener('change', (e) => {
    markCustom();
    currentConfig.dedicatedGpuId = e.target.value;
    recalculate();
  });

  // Standard inputs
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

  addChange('spec-os', (e) => (currentConfig.os = e.target.value));
  addChange('spec-ram', (e) => (currentConfig.ram_gb = parseInt(e.target.value, 10)));
  addChange('spec-storagegb', (e) => (currentConfig.storage_gb = parseInt(e.target.value, 10)));
  addChange('spec-storagetype', (e) => (currentConfig.storage_type = e.target.value));
  addChange('spec-res', (e) => (currentConfig.resolution_pixels = parseInt(e.target.value, 10)));

  addChange('spec-cpuspeed', (e) => {
    currentConfig.cpu_speed_ghz = parseFloat(e.target.value);
    el('val-cpuspeed').textContent = `${currentConfig.cpu_speed_ghz} GHz`;
  });

  addChange('spec-inches', (e) => {
    currentConfig.inches = parseFloat(e.target.value);
    el('val-inches').textContent = `${currentConfig.inches}"`;
  });

  addChange('spec-weight', (e) => {
    currentConfig.weight_kg = parseFloat(e.target.value);
    el('val-weight').textContent = `${currentConfig.weight_kg} kg`;
  });

  // Touchscreen Toggle
  el('toggle-touch-row')?.addEventListener('click', () => {
    if (currentConfig.brand === 'Apple') return;
    const brandData = BRAND_CATALOG[currentConfig.brand] || BRAND_CATALOG['Apple'];
    const series = brandData.series.find((s) => s.id === currentConfig.seriesId) || brandData.series[0];
    if (series.formFactor === '2 in 1 Convertible' || !series.touchSupported) return;

    markCustom();
    currentConfig.touchscreen = !currentConfig.touchscreen;
    el('toggle-touch-switch')?.classList.toggle('active', currentConfig.touchscreen);
    recalculate();
  });

  // IPS Toggle
  el('toggle-ips-row')?.addEventListener('click', () => {
    markCustom();
    currentConfig.ips = !currentConfig.ips;
    el('toggle-ips-switch')?.classList.toggle('active', currentConfig.ips);
    recalculate();
  });

  // Condition Buttons
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

  // Currency Buttons
  document.querySelectorAll('.curr-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentCurrency = btn.dataset.curr;
      document.querySelectorAll('.curr-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      recalculate();
    });
  });

  // Benchmark Section Toggle
  el('toggle-benchmark-btn')?.addEventListener('click', () => {
    const card = el('benchmark-section');
    if (!card) return;
    const isHidden = card.style.display === 'none' || !card.style.display;
    card.style.display = isHidden ? 'block' : 'none';
    el('toggle-benchmark-btn').textContent = isHidden ? 'Hide benchmarks' : 'View benchmarks';
  });
}

function generateMarketDrivers(specs, series, processor, gpu, era) {
  const drivers = [];

  // 1. Processor & Silicon Driver
  if (processor.family === 'Apple') {
    drivers.push({
      type: 'positive',
      title: 'Apple Silicon Architecture',
      desc: `${processor.label}: Industry-leading performance-per-watt with exceptional long-term market resale retention.`,
    });
  } else if (processor.marketWeight >= 0.5) {
    drivers.push({
      type: 'positive',
      title: 'High-Performance Processor',
      desc: `${processor.label}: Multi-core powerhouse with high thermal ceiling for creator workflows.`,
    });
  }

  // 2. Graphics Driver
  if (specs.hasDedicatedGpu) {
    drivers.push({
      type: 'positive',
      title: 'Discrete High-TGP Graphics',
      desc: `${gpu.label}: Dedicated GDDR6 VRAM accelerates 3D rendering, video encoding, and high-FPS gaming.`,
    });
  } else {
    drivers.push({
      type: 'neutral',
      title: 'Integrated Graphics Architecture',
      desc: `${gpu.label}: Optimized for silent operation, cool temperatures, and all-day battery life.`,
    });
  }

  // 3. Generation & Age
  if (era.id === 'current') {
    drivers.push({
      type: 'positive',
      title: 'Current Generation Hardware',
      desc: `${era.label}: Fresh component lifecycle with peak residual value.`,
    });
  } else if (era.id === 'legacy') {
    drivers.push({
      type: 'negative',
      title: 'Legacy Release Era',
      desc: `${era.label}: Standard market depreciation from generational silicon cycles and battery wear.`,
    });
  }

  // 4. Memory & Storage
  if (specs.ram_gb >= 32) {
    drivers.push({
      type: 'positive',
      title: 'Enthusiast Memory Capacity',
      desc: `${specs.ram_gb} GB RAM offers workstation-grade headroom for heavy multitasking and local LLM models.`,
    });
  } else if (specs.ram_gb <= 4) {
    drivers.push({
      type: 'negative',
      title: 'Base Memory Constraint',
      desc: '4 GB RAM limits multitasking in modern operating systems, lowering market valuation.',
    });
  }

  // 5. Display Panel
  if (specs.resolution_pixels >= 4000000) {
    drivers.push({
      type: 'positive',
      title: 'High-Density Retina / XDR Panel',
      desc: 'High pixel density panel delivers exceptional text clarity and color accuracy.',
    });
  }

  return drivers;
}

function recalculate() {
  const brandData = BRAND_CATALOG[currentConfig.brand] || BRAND_CATALOG['Apple'];
  const series = brandData.series.find((s) => s.id === currentConfig.seriesId) || brandData.series[0];
  const processor = PROCESSOR_CATALOG[currentConfig.chipId] || PROCESSOR_CATALOG['m2'];
  const activeGpuKey = currentConfig.hasDedicatedGpu
    ? currentConfig.dedicatedGpuId
    : currentConfig.integratedGpuId;
  const gpu = GRAPHICS_CATALOG[activeGpuKey] || GRAPHICS_CATALOG['apple_silicon_gpu'];
  const era = RELEASE_ERAS.find((e) => e.id === currentConfig.eraId) || RELEASE_ERAS[1];

  // Construct standard ML feature payload
  const mlSpecs = {
    brand: currentConfig.brand,
    type: series.formFactor,
    cpu_brand: processor.mlCpuBrand,
    cpu_speed_ghz: currentConfig.cpu_speed_ghz,
    storage_type: currentConfig.storage_type,
    gpu_brand: gpu.mlGpuBrand,
    os: currentConfig.os,
    inches: currentConfig.inches,
    touchscreen: currentConfig.touchscreen ? 1 : 0,
    ips: currentConfig.ips ? 1 : 0,
    resolution_pixels: currentConfig.resolution_pixels,
    ram_gb: currentConfig.ram_gb,
    storage_gb: currentConfig.storage_gb,
    weight_kg: currentConfig.weight_kg,
  };

  // Base inference from Gradient Boosted Decision Tree
  const rawPred = predictPrice(mlSpecs, 1.0);

  // Market calibration:
  // Evaluates real market valuation factoring generation era, processor tier weight, series prestige, and physical condition.
  const seriesMult = series.marketSeriesMult || 1.0;
  const chipMult = processor.marketWeight || 0.45;
  const eraMult = era.factor || 1.0;
  const conditionMult = currentCondition;

  const calibratedBdt = Math.max(
    14000,
    Math.round(rawPred.priceBdt * seriesMult * chipMult * eraMult * conditionMult)
  );

  const lowBdt = Math.round(calibratedBdt * 0.92);
  const highBdt = Math.round(calibratedBdt * 1.08);

  const symbol = currentCurrency === 'BDT' ? '৳' : currentCurrency === 'USD' ? '$' : '€';
  const amount =
    currentCurrency === 'BDT'
      ? calibratedBdt
      : currentCurrency === 'USD'
      ? Math.round(calibratedBdt / 120)
      : Math.round(calibratedBdt / 128);

  const low =
    currentCurrency === 'BDT'
      ? lowBdt
      : currentCurrency === 'USD'
      ? Math.round(lowBdt / 120)
      : Math.round(lowBdt / 128);

  const high =
    currentCurrency === 'BDT'
      ? highBdt
      : currentCurrency === 'USD'
      ? Math.round(highBdt / 120)
      : Math.round(highBdt / 128);

  // Update hero price display
  if (el('price-symbol')) el('price-symbol').textContent = symbol;
  if (el('price-amount')) el('price-amount').textContent = amount.toLocaleString();
  if (el('price-range-text')) {
    el('price-range-text').textContent = `${symbol}${low.toLocaleString()} – ${symbol}${high.toLocaleString()}`;
  }

  // Update Summary Card
  if (el('sum-config')) {
    el('sum-config').textContent = `${currentConfig.brand} ${series.name}`;
  }
  if (el('sum-era')) {
    el('sum-era').textContent = `${era.label} • ${Math.round(currentCondition * 100)}% Grade`;
  }
  if (el('sum-cpu')) {
    el('sum-cpu').textContent = `${processor.label} @ ${currentConfig.cpu_speed_ghz} GHz`;
  }
  if (el('sum-storage')) {
    const ramLabel = processor.family === 'Apple' ? `${currentConfig.ram_gb} GB Unified` : `${currentConfig.ram_gb} GB`;
    el('sum-storage').textContent = `${ramLabel} • ${currentConfig.storage_gb} GB ${currentConfig.storage_type}`;
  }
  if (el('sum-gpu')) {
    el('sum-gpu').textContent = currentConfig.hasDedicatedGpu
      ? `Dedicated ${gpu.label}`
      : gpu.label;
  }
  if (el('sum-display')) {
    const touch = currentConfig.touchscreen ? 'Touch' : '';
    const ips = currentConfig.ips ? 'IPS' : '';
    const features = [ips, touch].filter(Boolean).join('/');
    el('sum-display').textContent = `${currentConfig.inches}" ${features ? `(${features})` : ''} • ${currentConfig.weight_kg}kg`;
  }

  // Render Market Value Drivers
  const driversContainer = el('market-drivers-list');
  if (driversContainer) {
    const drivers = generateMarketDrivers(currentConfig, series, processor, gpu, era);
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
