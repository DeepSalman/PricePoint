import React, { useState, useMemo } from 'react';
import { predictPrice, MODEL_METADATA } from './model/predictor';

const PRESETS = [
  {
    id: 'student',
    name: '🎓 Student / Everyday',
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
    name: '🍎 MacBook Retina',
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
    name: '⚡ RTX Gaming Rig',
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
    name: '💼 Business Ultrabook',
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
    name: '💰 Budget / Basic',
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

const RESOLUTION_OPTIONS = [
  { label: '1366 × 768 (HD)', pixels: 1366 * 768 },
  { label: '1920 × 1080 (Full HD)', pixels: 1920 * 1080 },
  { label: '2560 × 1440 / 1600 (2K / QHD)', pixels: 2560 * 1600 },
  { label: '3840 × 2160 (4K UHD)', pixels: 3840 * 2160 },
];

const CONDITIONS = [
  { label: 'Mint / Like New', mult: 1.0, desc: 'Flawless condition, negligible battery wear' },
  { label: 'Good (Minor wear)', mult: 0.9, desc: 'Normal signs of use, good battery health' },
  { label: 'Fair (Scratches/Heavy)', mult: 0.8, desc: 'Visible cosmetic wear, reduced battery' },
];

export default function App() {
  const [activePreset, setActivePreset] = useState('student');
  const [specs, setSpecs] = useState(PRESETS[0].specs);
  const [conditionMult, setConditionMult] = useState(PRESETS[0].condition);
  const [currency, setCurrency] = useState('BDT'); // 'BDT' | 'USD' | 'EUR'
  const [showBenchmark, setShowBenchmark] = useState(false);
  const [engineMode, setEngineMode] = useState('client'); // 'client' | 'api'
  const [apiUrl, setApiUrl] = useState('http://localhost:8000/predict');

  // Real-time Prediction
  const prediction = useMemo(() => {
    return predictPrice(specs, conditionMult);
  }, [specs, conditionMult]);

  const handlePresetSelect = (preset) => {
    setActivePreset(preset.id);
    setSpecs(preset.specs);
    setConditionMult(preset.condition);
  };

  const updateSpec = (field, value) => {
    setActivePreset('');
    setSpecs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Format currency
  const formatPrice = (bdt, usd, eur) => {
    if (currency === 'USD') return `$${usd.toLocaleString()}`;
    if (currency === 'EUR') return `€${eur.toLocaleString()}`;
    return `৳ ${bdt.toLocaleString()}`;
  };

  return (
    <div className="app-wrapper">
      {/* Navigation Header */}
      <header className="app-header">
        <div className="brand-wrapper">
          <div className="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="14" x="2" y="3" rx="2" />
              <line x1="8" x2="16" y1="21" y2="21" />
              <line x1="12" x2="12" y1="17" y2="21" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="brand-title">PricePoint</span>
              <span className="brand-badge">ML v1.0</span>
            </div>
          </div>
        </div>

        <div className="header-links">
          <div className="badge-tag">
            <span className="badge-pulse"></span>
            <span>Client ML Engine Active</span>
          </div>
          <a
            href="https://github.com/DeepSalman/PricePoint"
            target="_blank"
            rel="noopener noreferrer"
            className="badge-tag"
            style={{ textDecoration: 'none', color: '#fff', cursor: 'pointer' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </header>

      <main className="container">
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title">
            Predict Fair Market Price for <span>Any Laptop</span>
          </h1>
          <p className="hero-desc">
            Powered by Gradient Boosted Decision Trees trained on 1,300+ laptops with cross-validated accuracy ($R^2 = 0.85$). 
            Runs 100% offline in your browser with zero latency.
          </p>
        </section>

        {/* Preset Selector */}
        <div className="preset-bar">
          <div className="preset-label">Quick Spec Templates:</div>
          <div className="preset-chips">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`preset-chip ${activePreset === preset.id ? 'active' : ''}`}
                onClick={() => handlePresetSelect(preset)}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form & Output Grid */}
        <div className="predictor-grid">
          {/* Left Column: Form Controls */}
          <div className="glass-panel">
            {/* Section 1: Brand & Form Factor */}
            <div className="form-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
              </svg>
              <span>1. Brand & Chassis Form Factor</span>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="spec-brand">
                  Manufacturer
                </label>
                <select
                  id="spec-brand"
                  className="form-select"
                  value={specs.brand}
                  onChange={(e) => updateSpec('brand', e.target.value)}
                >
                  {(MODEL_METADATA.categories.brand || []).map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="spec-type">
                  Laptop Type
                </label>
                <select
                  id="spec-type"
                  className="form-select"
                  value={specs.type}
                  onChange={(e) => updateSpec('type', e.target.value)}
                >
                  {(MODEL_METADATA.categories.type || []).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Section 2: Processor & Performance */}
            <div className="form-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="16" height="16" x="4" y="4" rx="2" />
                <rect width="6" height="6" x="9" y="9" rx="1" />
                <path d="M15 2v2" />
                <path d="M15 20v2" />
                <path d="M2 15h2" />
                <path d="M2 9h2" />
                <path d="M20 15h2" />
                <path d="M20 9h2" />
                <path d="M9 2v2" />
                <path d="M9 20v2" />
              </svg>
              <span>2. Processing & Graphics</span>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label" htmlFor="spec-cpu">
                  CPU Tier
                </label>
                <select
                  id="spec-cpu"
                  className="form-select"
                  value={specs.cpu_brand}
                  onChange={(e) => updateSpec('cpu_brand', e.target.value)}
                >
                  {(MODEL_METADATA.categories.cpu_brand || []).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="spec-gpu">
                  GPU Vendor
                </label>
                <select
                  id="spec-gpu"
                  className="form-select"
                  value={specs.gpu_brand}
                  onChange={(e) => updateSpec('gpu_brand', e.target.value)}
                >
                  {(MODEL_METADATA.categories.gpu_brand || []).map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="spec-os">
                  Operating System
                </label>
                <select
                  id="spec-os"
                  className="form-select"
                  value={specs.os}
                  onChange={(e) => updateSpec('os', e.target.value)}
                >
                  {(MODEL_METADATA.categories.os || []).map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="spec-cpuspeed">
                <span>CPU Clock Speed</span>
                <span className="form-label-val">{specs.cpu_speed_ghz} GHz</span>
              </label>
              <input
                id="spec-cpuspeed"
                type="range"
                className="range-slider"
                min="0.9"
                max="3.6"
                step="0.1"
                value={specs.cpu_speed_ghz}
                onChange={(e) => updateSpec('cpu_speed_ghz', parseFloat(e.target.value))}
              />
            </div>

            {/* Section 3: Memory & Storage */}
            <div className="form-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 19v-3" />
                <path d="M10 19v-3" />
                <path d="M14 19v-3" />
                <path d="M18 19v-3" />
                <rect width="20" height="12" x="2" y="4" rx="2" />
              </svg>
              <span>3. Memory & Storage</span>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label" htmlFor="spec-ram">
                  RAM Capacity
                </label>
                <select
                  id="spec-ram"
                  className="form-select"
                  value={specs.ram_gb}
                  onChange={(e) => updateSpec('ram_gb', parseInt(e.target.value, 10))}
                >
                  {[2, 4, 6, 8, 12, 16, 24, 32, 64].map((gb) => (
                    <option key={gb} value={gb}>
                      {gb} GB
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="spec-storagetype">
                  Drive Type
                </label>
                <select
                  id="spec-storagetype"
                  className="form-select"
                  value={specs.storage_type}
                  onChange={(e) => updateSpec('storage_type', e.target.value)}
                >
                  {(MODEL_METADATA.categories.storage_type || []).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="spec-storagegb">
                  Capacity
                </label>
                <select
                  id="spec-storagegb"
                  className="form-select"
                  value={specs.storage_gb}
                  onChange={(e) => updateSpec('storage_gb', parseInt(e.target.value, 10))}
                >
                  <option value={128}>128 GB</option>
                  <option value={256}>256 GB</option>
                  <option value={512}>512 GB</option>
                  <option value={1024}>1024 GB (1 TB)</option>
                  <option value={2048}>2048 GB (2 TB)</option>
                </select>
              </div>
            </div>

            {/* Section 4: Display & Dimensions */}
            <div className="form-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="3" rx="2" />
                <line x1="8" x2="16" y1="21" y2="21" />
                <line x1="12" x2="12" y1="17" y2="21" />
              </svg>
              <span>4. Display & Ergonomics</span>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="spec-res">
                  Resolution
                </label>
                <select
                  id="spec-res"
                  className="form-select"
                  value={specs.resolution_pixels}
                  onChange={(e) => updateSpec('resolution_pixels', parseInt(e.target.value, 10))}
                >
                  {RESOLUTION_OPTIONS.map((opt) => (
                    <option key={opt.pixels} value={opt.pixels}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="spec-inches">
                  <span>Screen Size</span>
                  <span className="form-label-val">{specs.inches}&quot;</span>
                </label>
                <input
                  id="spec-inches"
                  type="range"
                  className="range-slider"
                  min="11.6"
                  max="17.3"
                  step="0.1"
                  value={specs.inches}
                  onChange={(e) => updateSpec('inches', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div
                className="toggle-row"
                onClick={() => updateSpec('touchscreen', !specs.touchscreen)}
              >
                <div className="toggle-info">
                  <div className="toggle-title">Touchscreen</div>
                  <div className="toggle-sub">Touch-interactive glass panel</div>
                </div>
                <div className={`toggle-switch ${specs.touchscreen ? 'active' : ''}`}>
                  <div className="toggle-knob"></div>
                </div>
              </div>

              <div
                className="toggle-row"
                onClick={() => updateSpec('ips', !specs.ips)}
              >
                <div className="toggle-info">
                  <div className="toggle-title">IPS Display</div>
                  <div className="toggle-sub">Wide viewing angles &amp; accurate colors</div>
                </div>
                <div className={`toggle-switch ${specs.ips ? 'active' : ''}`}>
                  <div className="toggle-knob"></div>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label" htmlFor="spec-weight">
                <span>Laptop Weight</span>
                <span className="form-label-val">{specs.weight_kg} kg</span>
              </label>
              <input
                id="spec-weight"
                type="range"
                className="range-slider"
                min="0.9"
                max="4.5"
                step="0.05"
                value={specs.weight_kg}
                onChange={(e) => updateSpec('weight_kg', parseFloat(e.target.value))}
              />
            </div>
          </div>

          {/* Right Column: Prediction Results Card */}
          <div className="results-card">
            <div className="price-hero-label">
              <span>Estimated Market Price</span>
              <span className="badge-pulse"></span>
            </div>

            <div className="price-hero-amount">
              <span className="price-symbol">
                {currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : '€'}
              </span>
              <span>
                {currency === 'BDT'
                  ? prediction.priceBdt.toLocaleString()
                  : currency === 'USD'
                  ? prediction.priceUsd.toLocaleString()
                  : prediction.priceEur.toLocaleString()}
              </span>
            </div>

            <div className="price-range-badge">
              <span>Typical Range:</span>
              <strong>
                {formatPrice(prediction.lowBdt, Math.round(prediction.lowBdt / 120), Math.round(prediction.lowBdt / 128))}
                {' – '}
                {formatPrice(prediction.highBdt, Math.round(prediction.highBdt / 120), Math.round(prediction.highBdt / 128))}
              </strong>
            </div>

            {/* Currency switcher */}
            <div>
              <div className="currency-selector">
                {['BDT', 'USD', 'EUR'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`curr-btn ${currency === c ? 'active' : ''}`}
                    onClick={() => setCurrency(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Cosmetic Condition Picker */}
            <div className="condition-picker">
              <div className="form-label">
                <span>Physical Condition Factor</span>
                <span className="form-label-val">{Math.round(conditionMult * 100)}%</span>
              </div>
              <div className="condition-grid">
                {CONDITIONS.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    className={`cond-btn ${conditionMult === c.mult ? 'active' : ''}`}
                    onClick={() => setConditionMult(c.mult)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Spec breakdown summary */}
            <div className="spec-summary-list">
              <div className="spec-summary-item">
                <span>Configuration</span>
                <span className="spec-summary-val">{specs.brand} {specs.type}</span>
              </div>
              <div className="spec-summary-item">
                <span>Processor</span>
                <span className="spec-summary-val">{specs.cpu_brand} @ {specs.cpu_speed_ghz} GHz</span>
              </div>
              <div className="spec-summary-item">
                <span>RAM &amp; Storage</span>
                <span className="spec-summary-val">{specs.ram_gb} GB • {specs.storage_gb} GB {specs.storage_type}</span>
              </div>
              <div className="spec-summary-item">
                <span>Graphics &amp; OS</span>
                <span className="spec-summary-val">{specs.gpu_brand} • {specs.os}</span>
              </div>
              <div className="spec-summary-item">
                <span>Display &amp; Weight</span>
                <span className="spec-summary-val">
                  {specs.inches}&quot; {specs.ips ? 'IPS' : ''} {specs.touchscreen ? 'Touch' : ''} ({specs.weight_kg}kg)
                </span>
              </div>
            </div>

            {/* Engine status info */}
            <div className="engine-status-box">
              <div className="engine-status-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Zero-Latency ML Inference Engine</span>
              </div>
              <button
                type="button"
                onClick={() => setShowBenchmark(!showBenchmark)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'inherit',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                {showBenchmark ? 'Hide stats' : 'View benchmarks'}
              </button>
            </div>
          </div>
        </div>

        {/* Model Benchmarking Card */}
        {showBenchmark && (
          <section className="benchmark-card">
            <h2 className="form-section-title" style={{ border: 'none', padding: 0 }}>
              Model Cross-Validation Benchmarking Results
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Evaluated across 5-fold cross validation on 1,303 laptops. The Gradient Boosting model offers the highest generalization power ($R^2 = 0.85$).
            </p>

            <table className="benchmarks-table">
              <thead>
                <tr>
                  <th>Model Architecture</th>
                  <th>Test MAE (BDT)</th>
                  <th>5-Fold CV MAE</th>
                  <th>R² Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: 'rgba(16, 185, 129, 0.08)' }}>
                  <td className="winner">Gradient Boosting Regressor (120 Trees)</td>
                  <td className="winner">৳ 21,432</td>
                  <td className="winner">৳ 22,988</td>
                  <td className="winner">0.8534</td>
                  <td className="winner">Active Production Model</td>
                </tr>
                <tr>
                  <td>Random Forest (100 Trees)</td>
                  <td>৳ 23,021</td>
                  <td>৳ 22,695</td>
                  <td>0.8259</td>
                  <td>Benchmark Candidate</td>
                </tr>
                <tr>
                  <td>Decision Tree Regressor</td>
                  <td>৳ 30,412</td>
                  <td>৳ 29,513</td>
                  <td>0.6490</td>
                  <td>Baseline</td>
                </tr>
                <tr>
                  <td>Linear Regression (One-Hot Encoded)</td>
                  <td>৳ 41,015</td>
                  <td>৳ 40,040</td>
                  <td>0.6489</td>
                  <td>Baseline</td>
                </tr>
                <tr>
                  <td>Support Vector Regressor (SVR)</td>
                  <td>৳ 63,216</td>
                  <td>৳ 65,205</td>
                  <td>-0.0247</td>
                  <td>Underfit</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          <strong>PricePoint</strong> — Laptop market valuation using machine learning.
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          Configured for GitHub Pages deployment. Built by <a href="https://github.com/DeepSalman" target="_blank" rel="noreferrer">DeepSalman</a>.
        </p>
      </footer>
    </div>
  );
}
