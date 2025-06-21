//data.js
const axios = require('axios');
const config = require('./config');
const utils = require('./utils');

// === BTC Data Cache ===
let cachedBTCData = { data: [], timestamp: 0 };
async function getBTCData() {
  const now = Date.now();
  if (cachedBTCData.data.length && now - cachedBTCData.timestamp < config.BTC_CACHE_TTL) {
    return cachedBTCData.data;
  }
  try {
    const resp = await axios.get('https://fapi.binance.com/fapi/v1/klines ', {
      params: { symbol: 'BTCUSDT', interval: '1m', limit: 60 }
    });
    const prices = resp.data.map(c => +c[4]);
    cachedBTCData = { data: prices, timestamp: now };
    return prices;
  } catch {
    return [];
  }
}

// === ETH Data Cache ===
let cachedETHData = { data: [], timestamp: 0 };
async function getETHData() {
  const now = Date.now();
  if (cachedETHData.data.length && now - cachedETHData.timestamp < config.ETH_CACHE_TTL) {
    return cachedETHData.data;
  }
  try {
    const resp = await axios.get('https://fapi.binance.com/fapi/v1/klines ', {
      params: { symbol: 'ETHUSDT', interval: '1m', limit: 60 }
    });
    const prices = resp.data.map(c => +c[4]);
    cachedETHData = { data: prices, timestamp: now };
    return prices;
  } catch {
    return [];
  }
}

// === Market Data Fetchers ===
async function getBinanceSymbols() {
  try {
    const { data } = await axios.get('https://fapi.binance.com/fapi/v1/ticker/24hr ');
    return data
      .filter(i =>
        i.symbol.endsWith('USDT') &&
        parseFloat(i.quoteVolume) > config.MIN_VOL_24H &&
        !config.BLACKLIST.includes(i.symbol)
      )
      .map(i => ({
        symbol: i.symbol,
        volume: parseFloat(i.quoteVolume),
        price: parseFloat(i.lastPrice),
        priceChangePercent: parseFloat(i.priceChangePercent)
      }));
  } catch {
    return [];
  }
}

async function getHistoricalData(symbol, interval = '1m', limit = 30) {
  try {
    const resp = await axios.get('https://fapi.binance.com/fapi/v1/klines ', { 
      params: { symbol, interval, limit } 
    });
    return resp.data.map(c => ({
      open:                +c[1],
      high:                +c[2],
      low:                 +c[3],
      close:               +c[4],
      volume:              +c[5],
      takerBuyBaseVolume:  +c[9]
    }));
  } catch {
    return [];
  }
}

// === Volume Calculations ===
async function getVolumeData(symbol, period = 60) {
  try {
    const resp = await axios.get('https://fapi.binance.com/fapi/v1/klines ', { 
      params: { symbol, interval: '1m', limit: period * 2 } 
    });
    const vols = resp.data.map(c => +c[7]);
    return {
      prevVolume: vols.slice(0, period).reduce((a, b) => a + b, 0),
      currentVolume: vols.slice(period).reduce((a, b) => a + b, 0)
    };
  } catch {
    return { prevVolume: 0, currentVolume: 0 };
  }
}

async function getPriceChange1h(symbol) {
  try {
    const klines = await getHistoricalData(symbol, '1m', 60);
    if (klines.length < 60) return 'N/A';
    const change = ((klines.at(-1).close - klines[0].open) / klines[0].open) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  } catch {
    return 'N/A';
  }
}

module.exports = {
  getBTCData,
  getETHData,
  getBinanceSymbols,
  getHistoricalData,
  getVolumeData,
  getPriceChange1h
};