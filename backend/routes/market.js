const express = require("express");
const axios = require("axios");
const WebSocket = require("ws");

const router = express.Router();

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

const FINNHUB_REST = "https://finnhub.io/api/v1";
const FINNHUB_WS = `wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`;

const DEFAULT_SYMBOL = "TSLA";
const DEFAULT_RESOLUTION = "1";

const clients = new Set();

let finnhubSocket = null;
let reconnectTimer = null;
let reconnectAttempts = 0;

let currentCandle = null;

const MAX_CANDLES = 300;

/* =========================================================
   HELPERS
========================================================= */

const getMinuteTimestamp = (timestamp = Date.now()) => {
  return Math.floor(timestamp / 60000) * 60;
};

const sendSSE = (client, payload) => {
  try {
    client.res.write(`data: ${JSON.stringify(payload)}\n\n`);
  } catch (error) {
    clients.delete(client);
  }
};

const broadcast = (payload) => {
  for (const client of clients) {
    sendSSE(client, payload);
  }
};

const createCandleFromTrade = (trade) => {
  const price = Number(trade.p);
  const timestamp = Number(trade.t);

  if (!Number.isFinite(price) || !Number.isFinite(timestamp)) {
    return null;
  }

  const time = getMinuteTimestamp(timestamp);

  return {
    time,
    open: price,
    high: price,
    low: price,
    close: price,
  };
};

const updateCandle = (trade) => {
  const incoming = createCandleFromTrade(trade);

  if (!incoming) return null;

  if (!currentCandle) {
    currentCandle = incoming;
    return currentCandle;
  }

  if (incoming.time === currentCandle.time) {
    currentCandle.high = Math.max(
      currentCandle.high,
      incoming.close
    );

    currentCandle.low = Math.min(
      currentCandle.low,
      incoming.close
    );

    currentCandle.close = incoming.close;

    return currentCandle;
  }

  if (incoming.time > currentCandle.time) {
    currentCandle = incoming;

    return currentCandle;
  }

  return currentCandle;
};

/* =========================================================
   FINNHUB WEBSOCKET
========================================================= */

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

  console.log("🔵 Connecting to Finnhub WebSocket...");

  finnhubSocket = new WebSocket(FINNHUB_WS);

  finnhubSocket.on("open", () => {
    reconnectAttempts = 0;

    console.log("🟢 Finnhub WebSocket connected.");

    finnhubSocket.send(
      JSON.stringify({
        type: "subscribe",
        symbol: DEFAULT_SYMBOL,
      })
    );

    console.log(
      `📈 Subscribed to ${DEFAULT_SYMBOL} real-time trades.`
    );
  });

  finnhubSocket.on("message", (rawMessage) => {
    try {
      const message = JSON.parse(rawMessage.toString());

      if (message.type !== "trade") {
        return;
      }

      if (!Array.isArray(message.data)) {
        return;
      }

      for (const trade of message.data) {
        if (trade.s !== DEFAULT_SYMBOL) {
          continue;
        }

        const candle = updateCandle(trade);

        if (!candle) {
          continue;
        }

        broadcast({
          type: "candle",
          symbol: DEFAULT_SYMBOL,
          interval: "1m",
          candle,
        });
      }
    } catch (error) {
      console.error(
        "❌ Finnhub WebSocket message error:",
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
      "⚠️ Finnhub WebSocket disconnected."
    );

    finnhubSocket = null;

    scheduleFinnhubReconnect();
  });
};

const scheduleFinnhubReconnect = () => {
  if (reconnectTimer) {
    return;
  }

  reconnectAttempts += 1;

  const delay = Math.min(
    5000 * reconnectAttempts,
    30000
  );

  console.log(
    `🔄 Reconnecting to Finnhub in ${delay}ms...`
  );

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;

    connectFinnhub();
  }, delay);
};

/* =========================================================
   HISTORICAL TSLA CANDLES
========================================================= */

/**
 * GET
 *
 * /api/market/klines
 *
 * Example:
 *
 * /api/market/klines?symbol=TSLA&limit=150
 */

router.get("/klines", async (req, res) => {
  try {
    const symbol = String(
      req.query.symbol || DEFAULT_SYMBOL
    ).toUpperCase();

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 150,
        10
      ),
      MAX_CANDLES
    );

    const now = Math.floor(Date.now() / 1000);

    /*
      Get enough time to cover the requested
      number of 1-minute candles.
    */

    const from =
      now - (limit + 30) * 60;

    const response = await axios.get(
      `${FINNHUB_REST}/stock/candle`,
      {
        params: {
          symbol,
          resolution: DEFAULT_RESOLUTION,
          from,
          to: now,
          token: FINNHUB_API_KEY,
        },

        timeout: 15000,
      }
    );

    const data = response.data;

    if (
      !data ||
      data.s !== "ok" ||
      !Array.isArray(data.t)
    ) {
      console.error(
        "❌ Invalid Finnhub candle response:",
        data
      );

      return res.status(502).json({
        success: false,
        message: "Unable to retrieve TSLA market candles",
        providerResponse: data,
      });
    }

    const candles = data.t
      .map((timestamp, index) => ({
        time: Number(timestamp),
        open: Number(data.o[index]),
        high: Number(data.h[index]),
        low: Number(data.l[index]),
        close: Number(data.c[index]),
        volume: Number(data.v?.[index] || 0),
      }))
      .filter(
        (candle) =>
          Number.isFinite(candle.time) &&
          Number.isFinite(candle.open) &&
          Number.isFinite(candle.high) &&
          Number.isFinite(candle.low) &&
          Number.isFinite(candle.close)
      )
      .slice(-limit);

    /*
      Use the last historical candle as the starting
      point for the live candle.
    */

    const lastCandle = candles.at(-1);

    if (lastCandle) {
      currentCandle = {
        time: lastCandle.time,
        open: lastCandle.open,
        high: lastCandle.high,
        low: lastCandle.low,
        close: lastCandle.close,
      };
    }

    res.json({
      success: true,
      symbol,
      interval: "1m",
      candles,
    });
  } catch (error) {
    console.error(
      "❌ Finnhub candle error:"
    );

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "Status:",
      error.response?.status
    );

    console.error(
      "Response:",
      error.response?.data
    );

    res.status(502).json({
      success: false,
      message: "Unable to retrieve TSLA market data",
      error: error.message,
      providerStatus:
        error.response?.status || null,
      providerResponse:
        error.response?.data || null,
    });
  }
});

/* =========================================================
   CURRENT TSLA QUOTE
========================================================= */

router.get("/quote", async (req, res) => {
  try {
    const symbol = String(
      req.query.symbol || DEFAULT_SYMBOL
    ).toUpperCase();

    const response = await axios.get(
      `${FINNHUB_REST}/quote`,
      {
        params: {
          symbol,
          token: FINNHUB_API_KEY,
        },

        timeout: 10000,
      }
    );

    res.json({
      success: true,
      symbol,
      quote: response.data,
    });
  } catch (error) {
    console.error(
      "❌ Finnhub quote error:",
      error.response?.data || error.message
    );

    res.status(502).json({
      success: false,
      message: "Unable to retrieve TSLA quote",
      error: error.message,
      providerStatus:
        error.response?.status || null,
      providerResponse:
        error.response?.data || null,
    });
  }
});

/* =========================================================
   SSE STREAM
========================================================= */

router.get("/stream", (req, res) => {
  const symbol = String(
    req.query.symbol || DEFAULT_SYMBOL
  ).toUpperCase();

  res.setHeader(
    "Content-Type",
    "text/event-stream"
  );

  res.setHeader(
    "Cache-Control",
    "no-cache"
  );

  res.setHeader(
    "Connection",
    "keep-alive"
  );

  res.setHeader(
    "X-Accel-Buffering",
    "no"
  );

  if (res.flushHeaders) {
    res.flushHeaders();
  }

  const client = {
    res,
    symbol,
  };

  clients.add(client);

  console.log(
    `📡 SSE client connected: ${symbol}`
  );

  sendSSE(client, {
    type: "connected",
    symbol,
    interval: "1m",
  });

  /*
    Immediately send the current candle if we
    already have one.
  */

  if (currentCandle) {
    sendSSE(client, {
      type: "candle",
      symbol,
      interval: "1m",
      candle: currentCandle,
    });
  }

  /*
    Keep the SSE connection alive.
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

    clients.delete(client);

    console.log(
      `📡 SSE client disconnected: ${symbol}`
    );
  });

  /*
    Make sure the Finnhub connection exists
    whenever someone needs market data.
  */

  connectFinnhub();
});

/* =========================================================
   HEALTH CHECK
========================================================= */

router.get("/test", (req, res) => {
  res.json({
    success: true,
    provider: "finnhub",
    symbol: DEFAULT_SYMBOL,
    websocket:
      finnhubSocket?.readyState === WebSocket.OPEN
        ? "connected"
        : "disconnected",
    clients: clients.size,
  });
});

module.exports = router;

/* =========================================================
   START MARKET CONNECTION
========================================================= */

connectFinnhub();