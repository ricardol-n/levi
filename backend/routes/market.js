const express = require("express");
const WebSocket = require("ws");
require("dotenv").config();

const router = express.Router();

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const DEFAULT_SYMBOL = "TSLA";

const MAX_CANDLES = 120;
const clients = new Set();

let finnhubSocket = null;
let reconnectTimer = null;
let reconnectAttempt = 0;

let candleHistory = [];
let currentCandle = null;

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */

const getCandleStart = (timestamp) => {
  const milliseconds = Number(timestamp);

  if (!Number.isFinite(milliseconds)) {
    return null;
  }

  const date = new Date(milliseconds);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setUTCSeconds(0, 0);

  return Math.floor(date.getTime() / 1000);
};

const createCandle = (price, timestamp) => {
  const numericPrice = Number(price);
  const time = getCandleStart(timestamp);

  if (!Number.isFinite(numericPrice) || !time) {
    return null;
  }

  return {
    time,
    open: numericPrice,
    high: numericPrice,
    low: numericPrice,
    close: numericPrice,
  };
};

const sendSSE = (res, payload) => {
  try {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  } catch (error) {
    // Client probably disconnected.
  }
};

const broadcast = (payload) => {
  for (const client of clients) {
    sendSSE(client, payload);
  }
};

const broadcastCandle = (candle) => {
  if (!candle) return;

  broadcast({
    type: "candle",
    symbol: DEFAULT_SYMBOL,
    interval: "1m",
    candle,
  });
};

const broadcastStatus = (status) => {
  broadcast({
    type: "status",
    symbol: DEFAULT_SYMBOL,
    status,
  });
};

/* -------------------------------------------------------
   Candle history
------------------------------------------------------- */

const addCandleToHistory = (candle) => {
  if (!candle) return;

  const existingIndex = candleHistory.findIndex(
    (item) => item.time === candle.time
  );

  if (existingIndex !== -1) {
    candleHistory[existingIndex] = candle;
  } else {
    candleHistory.push(candle);
  }

  candleHistory.sort((a, b) => a.time - b.time);

  if (candleHistory.length > MAX_CANDLES) {
    candleHistory = candleHistory.slice(-MAX_CANDLES);
  }
};

const updateCandle = (price, timestamp) => {
  const numericPrice = Number(price);
  const candleTime = getCandleStart(timestamp);

  if (!Number.isFinite(numericPrice) || !candleTime) {
    return;
  }

  /*
   * First trade received.
   */
  if (!currentCandle) {
    currentCandle = createCandle(numericPrice, timestamp);

    if (!currentCandle) {
      return;
    }

    addCandleToHistory(currentCandle);
    broadcastCandle(currentCandle);

    return;
  }

  /*
   * Older trade.
   */
  if (candleTime < currentCandle.time) {
    return;
  }

  /*
   * New minute.
   */
  if (candleTime > currentCandle.time) {
    /*
     * Make sure the previous candle is permanently
     * stored in history.
     */
    addCandleToHistory(currentCandle);

    /*
     * Create the new live candle.
     */
    currentCandle = createCandle(numericPrice, timestamp);

    if (!currentCandle) {
      return;
    }

    addCandleToHistory(currentCandle);

    broadcastCandle(currentCandle);

    return;
  }

  /*
   * Same minute — update OHLC.
   */
  currentCandle.high = Math.max(
    currentCandle.high,
    numericPrice
  );

  currentCandle.low = Math.min(
    currentCandle.low,
    numericPrice
  );

  currentCandle.close = numericPrice;

  addCandleToHistory(currentCandle);

  broadcastCandle(currentCandle);
};

/* -------------------------------------------------------
   Finnhub WebSocket
------------------------------------------------------- */

const connectFinnhub = () => {
  if (!FINNHUB_API_KEY) {
    console.error(
      "❌ FINNHUB_API_KEY is missing from environment variables."
    );

    return;
  }

  if (
    finnhubSocket &&
    (
      finnhubSocket.readyState === WebSocket.OPEN ||
      finnhubSocket.readyState === WebSocket.CONNECTING
    )
  ) {
    return;
  }

  const socketUrl =
    `wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`;

  console.log("🔌 Connecting to Finnhub...");

  finnhubSocket = new WebSocket(socketUrl);

  finnhubSocket.on("open", () => {
    reconnectAttempt = 0;

    console.log("🟢 Finnhub WebSocket connected");

    finnhubSocket.send(
      JSON.stringify({
        type: "subscribe",
        symbol: DEFAULT_SYMBOL,
      })
    );

    console.log(
      `📈 Subscribed to ${DEFAULT_SYMBOL}`
    );

    broadcastStatus("connected");
  });

  finnhubSocket.on("message", (rawMessage) => {
    try {
      const message = JSON.parse(rawMessage.toString());

      if (!message) {
        return;
      }

      /*
       * Finnhub sends:
       *
       * {
       *   type: "trade",
       *   data: [...]
       * }
       */

      if (
        message.type !== "trade" ||
        !Array.isArray(message.data)
      ) {
        return;
      }

      for (const trade of message.data) {
        if (!trade) continue;

        const price = Number(trade.p);
        const timestamp = Number(trade.t);
        const symbol = trade.s;

        if (symbol !== DEFAULT_SYMBOL) {
          continue;
        }

        if (!Number.isFinite(price)) {
          continue;
        }

        if (!Number.isFinite(timestamp)) {
          continue;
        }

        updateCandle(price, timestamp);
      }
    } catch (error) {
      console.error(
        "❌ Finnhub message processing error:",
        error.message
      );
    }
  });

  finnhubSocket.on("error", (error) => {
    console.error(
      "❌ Finnhub WebSocket error:",
      error.message
    );
  });

  finnhubSocket.on("close", () => {
    console.warn(
      "🟡 Finnhub WebSocket closed"
    );

    finnhubSocket = null;

    broadcastStatus("disconnected");

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }

    reconnectAttempt += 1;

    const delay = Math.min(
      1000 * 2 ** Math.min(reconnectAttempt, 5),
      30000
    );

    console.log(
      `🔄 Reconnecting to Finnhub in ${delay}ms...`
    );

    reconnectTimer = setTimeout(() => {
      connectFinnhub();
    }, delay);
  });
};

/* -------------------------------------------------------
   SSE stream
------------------------------------------------------- */

router.get("/stream", (req, res) => {
  const requestedSymbol = String(
    req.query.symbol || DEFAULT_SYMBOL
  ).toUpperCase();

  if (requestedSymbol !== DEFAULT_SYMBOL) {
    return res.status(400).json({
      success: false,
      message: `Only ${DEFAULT_SYMBOL} is supported.`,
    });
  }

  res.setHeader(
    "Content-Type",
    "text/event-stream"
  );

  res.setHeader(
    "Cache-Control",
    "no-cache, no-transform"
  );

  res.setHeader(
    "Connection",
    "keep-alive"
  );

  res.setHeader(
    "X-Accel-Buffering",
    "no"
  );

  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  clients.add(res);

  console.log(
    `📡 Market client connected. Clients: ${clients.size}`
  );

  /*
   * Tell frontend that connection is ready.
   */
  sendSSE(res, {
    type: "connected",
    symbol: DEFAULT_SYMBOL,
    interval: "1m",
  });

  /*
   * Send the entire candle history immediately.
   *
   * This is the important part that keeps the
   * chart populated instead of showing only one candle.
   */
  sendSSE(res, {
    type: "history",
    symbol: DEFAULT_SYMBOL,
    interval: "1m",
    candles: candleHistory,
  });

  /*
   * Also send the current candle if one exists.
   */
  if (currentCandle) {
    sendSSE(res, {
      type: "candle",
      symbol: DEFAULT_SYMBOL,
      interval: "1m",
      candle: currentCandle,
    });
  }

  /*
   * Make sure the provider connection is running.
   */
  connectFinnhub();

  /*
   * Heartbeat.
   */
  const heartbeat = setInterval(() => {
    try {
      res.write(": heartbeat\n\n");
    } catch (error) {
      clearInterval(heartbeat);
    }
  }, 15000);

  req.on("close", () => {
    clearInterval(heartbeat);

    clients.delete(res);

    console.log(
      `📴 Market client disconnected. Clients: ${clients.size}`
    );
  });
});

/* -------------------------------------------------------
   Current candle
------------------------------------------------------- */

router.get("/current", (req, res) => {
  res.json({
    success: true,
    symbol: DEFAULT_SYMBOL,
    interval: "1m",
    candle: currentCandle,
  });
});

/* -------------------------------------------------------
   Candle history
------------------------------------------------------- */

router.get("/history", (req, res) => {
  res.json({
    success: true,
    symbol: DEFAULT_SYMBOL,
    interval: "1m",
    candles: candleHistory,
  });
});

/* -------------------------------------------------------
   Debug / health
------------------------------------------------------- */

router.get("/test", (req, res) => {
  res.json({
    success: true,
    provider: "Finnhub",
    symbol: DEFAULT_SYMBOL,
    interval: "1m",

    websocket:
      finnhubSocket?.readyState === WebSocket.OPEN
        ? "connected"
        : "disconnected",

    clients: clients.size,

    candleCount: candleHistory.length,

    currentCandle,

    latestCandle:
      candleHistory.length > 0
        ? candleHistory[candleHistory.length - 1]
        : null,
  });
});

/* -------------------------------------------------------
   Start provider connection
------------------------------------------------------- */

connectFinnhub();

module.exports = router;