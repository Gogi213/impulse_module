//chart.js
const puppeteer = require('puppeteer');
const config = require('./config');

async function generateTradingViewSnapshot(symbol) {
  const fullSymbol = `BINANCE:${symbol}.P`;
  const widgetHtml = `
<html>
<head>
  <meta charset="utf-8"/>
  <script src="https://s3.tradingview.com/tv.js "></script>
  <style>
    body, html { margin:0; padding:0; background:#131722; }
    #tv_chart { width:800px; height:500px; }
  </style>
</head>
<body>
  <div id="tv_chart"></div>
  <script>
    new TradingView.widget({
      container_id: "tv_chart",
      symbol: "${fullSymbol}",
      interval: "1",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      toolbar_bg: "#131722",
      hide_top_toolbar: true,
      hide_side_toolbar: true,
      withdateranges: false,
      allow_symbol_change: false,
    });
  </script>
</body>
</html>`;
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 550 });
    await page.setContent(widgetHtml, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#tv_chart');
    await new Promise(res => setTimeout(res, 5000));
    const chartElem = await page.$('#tv_chart');
    const buffer = await chartElem.screenshot({ omitBackground: false });
    await browser.close();
    return buffer;
  } catch (err) {
    console.error('Ошибка генерации скриншота:', err);
    return null;
  }
}

module.exports = {
  generateTradingViewSnapshot
};