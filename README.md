## 🚨 IMPULSE:ALERTS


### 📌 Quick Summary

**A Telegram bot that detects volume spikes on cryptocurrencies in real time and delivers actionable alerts. Updates every minute. Fully featured analytics and automation.**

---

### 🧠 What the Bot Does

> **Goal**: Automatically spot potential short-term trends by analyzing sudden volume surges.

Every minute, the bot scans hundreds of symbols on Binance and filters only those that meet all of:

*  **Spl30m** — 30-minute volume spike compared to the previous 30 minutes
*  **Chg1h** & **Chg%** — price change over the last hour and 24 hours
*  **nATR** — normalized ATR as a volatility gauge
*  **BTC/ETH Correlation** — 1-hour Pearson correlation with BTC and ETH prices

If conditions are met (24h volume ≥ 20 M, 30m volume spike ≥ 200%, Chg% > 0%, Chg1h > 0%, etc.), the bot sends a **detailed metrics table** plus an **automatically generated TradingView chart screenshot** to your Telegram channel.

---

### 📊 Metrics the Bot Reports

| Metric           | Description                                                         |
| ---------------- | ------------------------------------------------------------------- |
| **Spl30m**       | Volume spike: current 30 min vs. previous 30 min                    |
| **Spl1h**        | Volume spike: current 1 h vs. previous 1 h                          |
| **Chg1h**        | Price change over the last 1 hour                                   |
| **Chg%**         | Price change over the last 24 hours                                 |
| **nATR**         | Normalized ATR (% of price)                                         |
| **Vol**          | 24 h total trading volume                                           |
| **Vol30m**       | Absolute volume for the last 30 min                                 |
| **Vol30m/4h**    | Ratio of 30 min volume to the last 4 h volume                       |
| **Vol30m/24h**   | Ratio of 30 min volume to the 24 h volume                           |
| **BTC/ETH Corr** | Pearson correlation coefficient with BTC and ETH over the past hour |

---

### 🚀 Key Features

*  **Auto-refresh every 60 seconds**
*  **Alerts when 30 min volume spike ≥ 200%**
*  **Re-alert logic**: only after volume falls to 90% then spikes again, or after 60 minutes
*  **Blacklist** of unwanted tokens
*  **Operational hours** configurable (e.g. 09:00–01:00)
*  **Automated TradingView screenshots** via Puppeteer

---

### 🧪 Tech Stack

* **Node.js** & **Telegraf.js** for bot framework
* **axios** for Binance REST API calls
* **puppeteer** for headless chart rendering
* **TradingView tv.js** widget for chart embedding
* Custom caching and alert-history management

---

### 📸 Screenshot
![image](https://github.com/user-attachments/assets/2c817fda-af99-42c1-bff6-1a1e5af335cb)

