const express = require("express");
const WebSocket = require("ws");

const router = express.Router();

require("dotenv").config();

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

const DEFAULT_SYMBOL = "TSLA";
const CANDLE_INTERVAL_MS = 60 * 1000;

const clients = new Set();

let finnhubSocket = null;
let reconnectTimer = null;
let reconnectAttempt = 0;

let currentCandle = null;

if (!FINNHUB_API_KEY) {
  console.error("❌ FINNHUB_API_KEY is missing.");
} else {
  console.log("✅ FINNHUB_API_KEY loaded for market stream.");
}

/* =========================================================
   HELPERS
========================================================= */

function getCandleStart(timestamp) {
  const date = new Date(timestamp);

  date.setUTCSeconds(0, 0);

  return date.getTime();
}

function createCandle(price, timestamp) {
  const candleTime = getCandleStart(timestamp);

  return {
    time: Math.floor(candleTime / 1000),
    open: price,
    high: price,
    low: price,
    close: price,
  };
}

function updateCandle(price, timestamp) {
  const candleTime = getCandleStart(timestamp);

  /*
   * No candle exists yet.
   */
  if (!currentCandle) {
    currentCandle = createCandle(price, timestamp);

    broadcastCandle(currentCandle);

    return;
  }

  const currentTimeMs = currentCandle.time * 1000;

  /*
   * New minute.
   */
  if (candleTime > currentTimeMs) {
    /*
     * Send the completed candle one more time so
     * the frontend definitely receives its final close.
     */
    broadcastCandle(currentCandle);

    /*
     * Create the new candle.
     */
    currentCandle = createCandle(price, timestamp);

    broadcastCandle(currentCandle);

    return;
  }

  /*
   * Ignore trades that somehow arrive from
   * an older minute.
   */
  if (candleTime < currentTimeMs) {
    return;
  }

  /*
   * Update the current candle.
   */
  currentCandle.high = Math.max(currentCandle.high, price);
  currentCandle.low = Math.min(currentCandle.low, price);
  currentCandle.close = price;

  broadcastCandle(currentCandle);
}

/* =========================================================
   SSE
========================================================= */

function sendSSE(client, payload) {
  try {
    client.write(`data: ${JSON.stringify(payload)}\n\n`);
  } catch (error) {
    console.error("❌ Failed to send SSE message:", error.message);
    clients.delete(client);
  }
}

function broadcastCandle(candle) {
  if (!candle || clients.size === 0) {
    return;
  }

  const payload = {
    type: "candle",
    symbol: DEFAULT_SYMBOL,
    interval: "1m",
    candle: {
      time: candle.time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    },
  };

  for (const client of clients) {
    sendSSE(client, payload);
  }
}

function broadcastStatus(status) {
  const payload = {
    type: "status",
    symbol: DEFAULT_SYMBOL,
    status,
  };

  for (const client of clients) {
    sendSSE(client, payload);
  }
}

/* =========================================================
   FINNHUB WEBSOCKET
========================================================= */

function connectFinnhub() {
  if (!FINNHUB_API_KEY) {
    console.error(
      "❌ Cannot connect to Finnhub because FINNHUB_API_KEY is missing."
    );

    return;
  }

  /*
   * Prevent duplicate connections.
   */
  if (
    finnhubSocket &&
    (finnhubSocket.readyState === WebSocket.OPEN ||
      finnhubSocket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  clearTimeout(reconnectTimer);

  const wsUrl = `wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`;

  console.log("🔌 Connecting to Finnhub WebSocket...");

  try {
    finnhubSocket = new WebSocket(wsUrl);
  } catch (error) {
    console.error("❌ Failed to create Finnhub WebSocket:", error.message);

    scheduleReconnect();

    return;
  }

  finnhubSocket.on("open", () => {
    reconnectAttempt = 0;

    console.log("✅ Finnhub WebSocket connected.");

    /*
     * Subscribe to Tesla.
     */
    finnhubSocket.send(
      JSON.stringify({
        type: "subscribe",
        symbol: DEFAULT_SYMBOL,
      })
    );

    console.log(`📡 Subscribed to ${DEFAULT_SYMBOL} trades.`);

    broadcastStatus("connected");
  });

  finnhubSocket.on("message", (rawMessage) => {
    try {
      const message = JSON.parse(rawMessage.toString());

      /*
       * Finnhub sends:
       *
       * {
       *   type: "trade",
       *   data: [...]
       * }
       */

      if (message.type !== "trade") {
        return;
      }

      if (!Array.isArray(message.data)) {
        return;
      }

      for (const trade of message.data) {
        /*
         * Finnhub trade:
         *
         * {
         *   p: price,
         *   s: symbol,
         *   t: timestamp,
         *   v: volume
         * }
         */

        const price = Number(trade.p);
        const timestamp = Number(trade.t);

        if (!Number.isFinite(price)) {
          continue;
        }

        if (!Number.isFinite(timestamp)) {
          continue;
        }

        if (trade.s && trade.s !== DEFAULT_SYMBOL) {
          continue;
        }

        updateCandle(price, timestamp);
      }
    } catch (error) {
      console.error(
        "❌ Error processing Finnhub WebSocket message:",
        error.message
      );
    }
  });

  finnhubSocket.on("error", (error) => {
    console.error("❌ Finnhub WebSocket error:", error.message);

    broadcastStatus("error");
  });

  finnhubSocket.on("close", (code, reason) => {
    const reasonText = reason
      ? reason.toString()
      : "No reason provided";

    console.warn(
      `⚠️ Finnhub WebSocket closed. Code: ${code}. Reason: ${reasonText}`
    );

    finnhubSocket = null;

    broadcastStatus("disconnected");

    scheduleReconnect();
  });
}

/* =========================================================
   RECONNECT
========================================================= */

function scheduleReconnect() {
  clearTimeout(reconnectTimer);

  reconnectAttempt += 1;

  /*
   * Exponential reconnect delay.
   *
   * 2s
   * 4s
   * 8s
   * 16s
   * ...
   *
   * Maximum 30 seconds.
   */
  const delay = Math.min(
    2000 * Math.pow(2, reconnectAttempt - 1),
    30000
  );

  console.log(
    `🔄 Reconnecting to Finnhub in ${Math.round(delay / 1000)} seconds...`
  );

  reconnectTimer = setTimeout(() => {
    connectFinnhub();
  }, delay);
}

/* =========================================================
   STREAM
   GET /api/market/stream
========================================================= */

router.get("/stream", (req, res) => {
  const requestedSymbol = String(
    req.query.symbol || DEFAULT_SYMBOL
  ).toUpperCase();

  /*
   * This market background currently supports TSLA only.
   */
  if (requestedSymbol !== DEFAULT_SYMBOL) {
    return res.status(400).json({
      success: false,
      message: `Only ${DEFAULT_SYMBOL} is supported by this stream.`,
    });
  }

  /*
   * SSE headers.
   */
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  /*
   * Flush headers if supported.
   */
  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  /*
   * Add this connection to our clients.
   */
  clients.add(res);

  console.log(
    `📈 Market SSE client connected. Total clients: ${clients.size}`
  );

  /*
   * Initial connection message.
   */
  sendSSE(res, {
    type: "connected",
    symbol: DEFAULT_SYMBOL,
    interval: "1m",
  });

  /*
   * If a candle already exists, immediately send it.
   *
   * This prevents a newly opened frontend connection
   * from waiting for another trade.
   */
  if (currentCandle) {
    sendSSE(res, {
      type: "candle",
      symbol: DEFAULT_SYMBOL,
      interval: "1m",
      candle: {
        time: currentCandle.time,
        open: currentCandle.open,
        high: currentCandle.high,
        low: currentCandle.low,
        close: currentCandle.close,
      },
    });
  }

  /*
   * Make sure the Finnhub connection exists.
   */
  connectFinnhub();

  /*
   * Heartbeat prevents proxies/load balancers from
   * considering the SSE connection idle.
   */
  const heartbeat = setInterval(() => {
    try {
      res.write(`: heartbeat ${Date.now()}\n\n`);
    } catch (error) {
      clearInterval(heartbeat);
    }
  }, 15000);

  /*
   * Client disconnected.
   */
  req.on("close", () => {
    clearInterval(heartbeat);

    clients.delete(res);

    console.log(
      `📉 Market SSE client disconnected. Total clients: ${clients.size}`
    );
  });
});

/* =========================================================
   CURRENT CANDLE
   GET /api/market/current
========================================================= */

router.get("/current", (req, res) => {
  if (!currentCandle) {
    return res.json({
      success: true,
      symbol: DEFAULT_SYMBOL,
      interval: "1m",
      candle: null,
    });
  }

  return res.json({
    success: true,
    symbol: DEFAULT_SYMBOL,
    interval: "1m",
    candle: {
      time: currentCandle.time,
      open: currentCandle.open,
      high: currentCandle.high,
      low: currentCandle.low,
      close: currentCandle.close,
    },
  });
});

/* =========================================================
   STATUS
   GET /api/market/test
========================================================= */

router.get("/test", (req, res) => {
  let websocketStatus = "disconnected";

  if (
    finnhubSocket &&
    finnhubSocket.readyState === WebSocket.OPEN
  ) {
    websocketStatus = "connected";
  } else if (
    finnhubSocket &&
    finnhubSocket.readyState === WebSocket.CONNECTING
  ) {
    websocketStatus = "connecting";
  }

  res.json({
    success: true,
    provider: "finnhub",
    symbol: DEFAULT_SYMBOL,
    interval: "1m",
    websocket: websocketStatus,
    clients: clients.size,
    currentCandle: currentCandle
      ? {
          time: currentCandle.time,
          open: currentCandle.open,
          high: currentCandle.high,
          low: currentCandle.low,
          close: currentCandle.close,
        }
      : null,
  });
});

/* =========================================================
   START FINNHUB CONNECTION
========================================================= */

connectFinnhub();

module.exports = router;