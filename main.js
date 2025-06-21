//main.js
const { Telegraf } = require('telegraf');
const config = require('./config');
const data = require('./data');
const utils = require('./utils');
const chart = require('./chart');

// === История алертов ===
const alertHistory = {};

// === Инициализация бота ===
const bot = new Telegraf(config.BOT_TOKEN);

// === Основная логика ===
async function sendDataToChannel() {
  // Проверка времени работы: с 9:00 до 1:00
  const now = new Date();
  const hours = now.getHours();
  if (!((hours >= config.WORK_HOURS_START && hours < 24) || 
        (hours >= 0 && hours < config.WORK_HOURS_END))) {
    return;
  }

  try {
    // Получаем список активов
    const syms = await data.getBinanceSymbols();
    if (!syms.length) return;

    // Параллельно получаем данные BTC/ETH
    const [btcPrices, ethPrices] = await Promise.all([
      data.getBTCData(),
      data.getETHData()
    ]);

    // Обрабатываем каждый символ
    const processedData = await Promise.all(syms.map(async (it) => {
      const [klines, v30, v60, v240] = await Promise.all([
        data.getHistoricalData(it.symbol, '1m', 30),
        data.getVolumeData(it.symbol, 30),
        data.getVolumeData(it.symbol, 60),
        data.getVolumeData(it.symbol, 240)
      ]);

      // Расчёт метрик
      const closePrices = klines.map(k => k.close);
      const btcSlice = btcPrices.slice(-closePrices.length);
      const ethSlice = ethPrices.slice(-closePrices.length);
      const vol30m = v30.currentVolume;
      const vol30mTo24h = it.volume > 0 
        ? ((vol30m / it.volume) * 100).toFixed(2) + '%' 
        : 'N/A';
      const vol30mTo4h = v240.currentVolume > 0 
        ? ((vol30m / v240.currentVolume) * 100).toFixed(2) + '%' 
        : 'N/A';

      return {
        symbol: it.symbol,
        chg: it.priceChangePercent,
        chg1h: await data.getPriceChange1h(it.symbol),
        volume: it.volume,
        formattedVol: utils.formatVolume(it.volume),
        natr: utils.calculateNATR(it.price, klines),
        spl30m: utils.calculateSpl(v30.prevVolume, v30.currentVolume),
        spl1h: utils.calculateSpl(v60.prevVolume, v60.currentVolume),
        vol30m: utils.formatVolume(vol30m),
        vol30mTo24h,
        vol30mTo4h,
        btcCorrelation: closePrices.length === btcSlice.length && closePrices.length >= 2
          ? utils.calculatePearsonCorrelation(closePrices, btcSlice)
          : 'N/A',
        ethCorrelation: closePrices.length === ethSlice.length && closePrices.length >= 2
          ? utils.calculatePearsonCorrelation(closePrices, ethSlice)
          : 'N/A'
      };
    }));

    // Фильтруем алерты
    const alerts = processedData.filter(i => utils.alertFilter(i, alertHistory[i.symbol]));
    
    // Обновляем историю алертов
    alerts.forEach(i => {
      alertHistory[i.symbol] = { 
        splValue: utils.parseSplash(i.spl30m), 
        timestamp: Date.now() 
      };
    });

    // Отправляем уведомления
    if (alerts.length) {
      for (const item of alerts) {
        const fields = [
          { label: 'Symbol:', value: item.symbol },
          { label: 'Spl30m:', value: item.spl30m, icon: '⭐️' },
          { label: 'Spl1h:', value: item.spl1h },
          { label: 'Chg1h:', value: item.chg1h },
          { label: 'Chg%:', value: `${item.chg.toFixed(2)}%` },
          { label: 'nATR:', value: item.natr, icon: '⚡️' },
          { label: 'Vol:', value: item.formattedVol },
          { label: 'Vol30m:', value: item.vol30m },
          { label: 'Vol30m/4h:', value: item.vol30mTo4h },
          { label: 'Vol30m/24h:', value: item.vol30mTo24h },
          { label: 'BTC Corr:', value: item.btcCorrelation },
          { label: 'ETH Corr:', value: item.ethCorrelation, icon: '🟣' }
        ];

        // Форматируем таблицу
        const maxLabelLength = Math.max(...fields.map(f => f.label.length)) + 1;
        const table = fields.map(f => {
          const label = f.label.padEnd(maxLabelLength, ' ');
          const value = f.icon ? `${f.value} ${f.icon}` : f.value;
          return `│${label}${value}`;
        }).join('\n');

        // Генерируем сообщение
        const border = '▓▒░―――――――――――――――░▒▓';
        const symbolWithoutUSDT = item.symbol.replace('USDT', '');
        const title = `#<b>${symbolWithoutUSDT}:</b> ${item.spl30m}|${item.natr}|BTC:${item.btcCorrelation}|ETH:${item.ethCorrelation}`;
        
        const msg = `${title}
<code>${border}
${table}
${border}</code>`;

        // Отправляем изображение или текст
        try {
          const img = await chart.generateTradingViewSnapshot(item.symbol);
          if (img) {
            await bot.telegram.sendPhoto(config.CHANNELS.alerts, { source: img }, {
              caption: msg,
              parse_mode: 'HTML',
              disable_web_page_preview: true
            });
          } else {
            await bot.telegram.sendMessage(config.CHANNELS.alerts, msg, {
              parse_mode: 'HTML',
              disable_web_page_preview: true
            });
          }
        } catch (err) {
          console.error('Ошибка отправки сообщения:', err);
          await bot.telegram.sendMessage(config.CHANNELS.alerts, msg, {
            parse_mode: 'HTML',
            disable_web_page_preview: true
          });
        }
      }
    }
  } catch (e) {
    console.error('Критическая ошибка:', e);
  }
}

// === Запуск бота ===
bot.launch();
setInterval(sendDataToChannel, 60 * 1000);
sendDataToChannel();

// === Обработка завершения работы ===
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));