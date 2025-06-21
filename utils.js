//utils.js
const config = require('./config');

// === Корреляция Пирсона ===
function calculatePearsonCorrelation(values1, values2) {
  if (values1.length !== values2.length || values1.length < 2) return 'N/A';
  const n = values1.length;
  const sum1 = values1.reduce((a, b) => a + b, 0);
  const sum2 = values2.reduce((a, b) => a + b, 0);
  const mean1 = sum1 / n;
  const mean2 = sum2 / n;
  let cov = 0, dev1 = 0, dev2 = 0;
  for (let i = 0; i < n; i++) {
    const diff1 = values1[i] - mean1;
    const diff2 = values2[i] - mean2;
    cov += diff1 * diff2;
    dev1 += diff1 * diff1;
    dev2 += diff2 * diff2;
  }
  const stdDev1 = Math.sqrt(dev1);
  const stdDev2 = Math.sqrt(dev2);
  if (stdDev1 === 0 || stdDev2 === 0) return 'N/A';
  const correlation = cov / (stdDev1 * stdDev2);
  return correlation.toFixed(2);
}

// === Форматирование объема ===
function formatVolume(v) {
  if (v >= 1e9) return `${Math.floor(v / 1e9)}B`;
  if (v >= 1e6) return `${Math.floor(v / 1e6)}M`;
  return `${Math.floor(v)}`;
}

// === Расчет nATR ===
function calculateNATR(price, data) {
  if (data.length < 2) return '0.00%';
  let sumTR = 0;
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1].close, hi = data[i].high, lo = data[i].low;
    sumTR += Math.max(hi - lo, Math.abs(hi - prev), Math.abs(lo - prev));
  }
  const atr = sumTR / (data.length - 1);
  return price > 0 ? `${((atr / price) * 100).toFixed(2)}%` : '0.00%';
}

// === Расчет SPL ===
function calculateSpl(prev, curr) {
  if (prev === 0) return 'N/A';
  const ch = ((curr - prev) / prev) * 100;
  return `${ch >= 0 ? '+' : ''}${ch.toFixed(2)}%`;
}

// === Парсинг SPL ===
function parseSplash(val) {
  const n = parseFloat(val.replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? -Infinity : n;
}

// === Фильтры ===
function baseFilter(item) {
  const natrValue = parseFloat(item.natr.replace('%', ''));
  const chg1hValue = typeof item.chg1h === 'string' && item.chg1h !== 'N/A' 
    ? parseFloat(item.chg1h.replace(/[^\d.-]/g, '')) 
    : -Infinity;
    
  return item.volume > config.MIN_VOL_24H &&
         natrValue >= config.MIN_NATR &&
         item.chg >= config.MIN_CHG &&
         chg1hValue >= config.MIN_CHG_1H;
}

function alertFilter(item, last) {
  const spl30 = parseSplash(item.spl30m);
  const spl1h = parseSplash(item.spl1h);
  const expired = last ? (Date.now() - last.timestamp) >= config.SPL_HISTORY_EXPIRE : false;
  return baseFilter(item) && 
         spl30 >= config.SPL_ALERT_THRESHOLD && 
         spl1h > config.MIN_SPL_1H && 
         (!last || last.splValue <= config.SPL_RESET_THRESHOLD || expired);
}

module.exports = {
  calculatePearsonCorrelation,
  formatVolume,
  calculateNATR,
  calculateSpl,
  parseSplash,
  baseFilter,
  alertFilter
};