//config.js

module.exports = {
  // === Бот ===
  BOT_TOKEN: '8136734508:AAGKMwsMpGeiJM77sR7O_3ySZ2lkLnTgc94',
  CHANNELS: { alerts: -1002448601937 },

  // === Черный список ===
  BLACKLIST: [
    'BNXUSDT', 'XEMUSDT', 'CRVUSDT', 'ANIMEUSDT',
    '1000PEPEUSDT', 'PEPEUSDT', 'WIFUSDT', 'FLMUSDT',
    '1000SATSUSDT', 'NFPUSDT', 'TAOUSDT', 'OGNUSDT',
    'MUBARAKUSDT', 'GTCUSDT', 'EOSUSDT', '1000BONKUSUSDT',
    'CTSIUSDT', 'FETUSDT', 'SUIUSDT', 'SEIUSDT', 'HIPPOUSDT'
  ],

  // === Кэширование ===
  BTC_CACHE_TTL: 5 * 60 * 1000,  // 5 минут
  ETH_CACHE_TTL: 5 * 60 * 1000,  // 5 минут

  // === Интервалы ===
  INTERVAL_1H: 60,                // 60 минут
  INTERVAL_4H: 240,               // 240 минут
  INTERVAL_24H: 1440,             // 1440 минут

  // === Фильтры ===
  MIN_VOL_24H: 20_000_000,       // Минимальный объем за 24ч
  MIN_NATR: 0.6,                 // Минимальный nATR (%)
  MIN_CHG: 5,                    // Минимальное изменение цены (%)
  MIN_CHG_1H: 0,                 // Минимальное изменение цены за 1ч (%)
  MIN_SPL_1H: 0,                 // Минимальный SPL за 1ч (%)
  SPL_ALERT_THRESHOLD: 200,      // Порог SPL для алерта
  SPL_RESET_THRESHOLD: 90,       // Порог сброса алерта
  SPL_HISTORY_EXPIRE: 1 * 60 * 60 * 1000, // Время жизни алерта (1 час)

  // === Время работы ===
  WORK_HOURS_START: 9,
  WORK_HOURS_END: 1
};