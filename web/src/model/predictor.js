import modelData from './model_data.js';

/**
 * Predict market price in BDT for a laptop configuration using the pre-trained Gradient Boosting Regressor.
 *
 * @param {Object} specs
 * @param {string} specs.brand e.g. "Dell", "Apple", "Lenovo"
 * @param {string} specs.type e.g. "Ultrabook", "Notebook", "Gaming"
 * @param {string} specs.cpu_brand e.g. "Intel i5", "AMD", "Intel i7"
 * @param {string} specs.storage_type e.g. "SSD", "HDD", "Hybrid"
 * @param {string} specs.gpu_brand e.g. "Intel", "Nvidia", "AMD"
 * @param {string} specs.os e.g. "Windows", "Mac", "Linux", "Chrome OS"
 * @param {number} specs.inches e.g. 13.3, 15.6
 * @param {number|boolean} specs.touchscreen 1 or 0
 * @param {number|boolean} specs.ips 1 or 0
 * @param {number} specs.resolution_pixels e.g. 1920*1080 = 2073600
 * @param {number} specs.cpu_speed_ghz e.g. 2.5
 * @param {number} specs.ram_gb e.g. 8, 16, 32
 * @param {number} specs.storage_gb e.g. 256, 512, 1024
 * @param {number} specs.weight_kg e.g. 1.8
 * @param {number} [conditionMultiplier=1.0] Condition factor (e.g. 0.85 for fair, 0.95 for good, 1.05 for like-new)
 * @returns {{ priceBdt: number, priceUsd: number, priceEur: number, lowBdt: number, highBdt: number }}
 */
export function predictPrice(specs, conditionMultiplier = 1.0) {
  const featVec = [];

  // 1. One-hot encode categorical features in exact training order
  for (const catCol of modelData.categorical_features) {
    const categories = modelData.categories[catCol] || [];
    const val = specs[catCol];
    for (const c of categories) {
      featVec.push(val === c ? 1.0 : 0.0);
    }
  }

  // 2. Append numeric features in exact training order
  for (const numCol of modelData.numeric_features) {
    let val = specs[numCol];
    if (typeof val === 'boolean') val = val ? 1 : 0;
    featVec.push(Number(val) || 0);
  }

  // 3. Traverse gradient boosted decision trees
  let pred = modelData.init_value;
  const lr = modelData.learning_rate;
  const trees = modelData.trees;

  for (let i = 0; i < trees.length; i++) {
    const tree = trees[i];
    let node = 0;
    while (tree.f[node] >= 0) {
      const featIdx = tree.f[node];
      const threshold = tree.th[node];
      if (featVec[featIdx] <= threshold) {
        node = tree.l[node];
      } else {
        node = tree.r[node];
      }
    }
    pred += lr * tree.v[node];
  }

  // Apply condition adjustment (e.g., used/cosmetic grade)
  const basePriceBdt = Math.max(12000, Math.round(pred));
  const finalPriceBdt = Math.round(basePriceBdt * conditionMultiplier);

  // Reasonable market spread range (+/- 8%)
  const lowBdt = Math.round(finalPriceBdt * 0.92);
  const highBdt = Math.round(finalPriceBdt * 1.08);

  // Conversions (approx 1 USD = 120 BDT, 1 EUR = 128 BDT)
  const priceUsd = Math.round(finalPriceBdt / 120);
  const priceEur = Math.round(finalPriceBdt / 128);

  return {
    priceBdt: finalPriceBdt,
    priceUsd,
    priceEur,
    lowBdt,
    highBdt,
    rawBdt: basePriceBdt,
    metrics: modelData.metrics,
  };
}

export const MODEL_METADATA = {
  version: modelData.version,
  modelType: modelData.model_type,
  maeBdt: modelData.metrics.mae_bdt,
  r2Score: modelData.metrics.r2_score,
  samples: modelData.metrics.samples,
  categories: modelData.categories,
};
