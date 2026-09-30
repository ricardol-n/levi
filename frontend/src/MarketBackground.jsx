import React, { useEffect, useRef } from "react";
import styled from "styled-components";

import {
  createChart,
  CandlestickSeries,
} from "lightweight-charts";

const MarketBackgroundWrapper = styled.div`
  position: absolute;
  inset: 0;

  width: 100%;
  height: 100%;

  z-index: 0;

  pointer-events: none;
  overflow: hidden;

  opacity: 0.42;

  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 8%,
    black 92%,
    transparent 100%
  );

  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 8%,
    black 92%,
    transparent 100%
  );

  /*
   * Desktop
   */
  @media (min-width: 1440px) {
    opacity: 0.46;
  }

  /*
   * Laptop
   */
  @media (min-width: 1025px) and (max-width: 1439px) {
    opacity: 0.40;
  }

  /*
   * Tablet/mobile are handled by the mobile
   * market panel in AuthForm.
   */
  @media (max-width: 1024px) {
    opacity: 1;
  }
`;

const ChartOverlay = styled.div`
  position: absolute;
  inset: 0;

  z-index: 2;

  pointer-events: none;

  background:
    radial-gradient(
      ellipse at center,
      rgba(15, 23, 42, 0.04) 0%,
      rgba(15, 23, 42, 0.12) 48%,
      rgba(15, 23, 42, 0.30) 100%
    );

  @media (max-width: 1024px) {
    background: transparent;
  }
`;

const ChartContainer = styled.div`
  position: absolute;

  top: 0;
  bottom: 0;

  /*
   * Make the chart wider than the viewport.
   * This gives us enough candles across the screen.
   */
  left: -8%;
  width: 116%;

  height: 100%;

  z-index: 1;

  @media (min-width: 1600px) {
    left: -12%;
    width: 124%;
  }

  @media (min-width: 1200px) and (max-width: 1599px) {
    left: -9%;
    width: 118%;
  }

  @media (min-width: 1025px) and (max-width: 1199px) {
    left: -6%;
    width: 112%;
  }

  /*
   * Mobile sizing remains controlled by the
   * mobile market section.
   */
  @media (max-width: 1024px) {
    left: 0;
    width: 100%;
  }
`;

const MarketBackground = () => {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    const container = chartContainerRef.current;

    if (!container) {
      return;
    }

    let destroyed = false;
    let eventSource = null;

    /*
     * ---------------------------------------------------
     * Chart
     * ---------------------------------------------------
     */

    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,

      layout: {
        background: {
          type: "solid",
          color: "transparent",
        },

        textColor: "rgba(255, 255, 255, 0.35)",
      },

      grid: {
        vertLines: {
          color: "rgba(255, 255, 255, 0.035)",
        },

        horzLines: {
          color: "rgba(255, 255, 255, 0.035)",
        },
      },

      rightPriceScale: {
        visible: false,
        borderVisible: false,
      },

      leftPriceScale: {
        visible: false,
        borderVisible: false,
      },

      timeScale: {
        visible: false,
        borderVisible: false,

        rightOffset: 10,

        /*
         * Smaller spacing allows more candles
         * to fill the background.
         */
        barSpacing: 6,

        minBarSpacing: 2.5,

        fixLeftEdge: false,
        fixRightEdge: false,
      },

      crosshair: {
        vertLine: {
          visible: false,
        },

        horzLine: {
          visible: false,
        },
      },

      handleScroll: false,
      handleScale: false,

      kineticScroll: {
        mouse: false,
        touch: false,
      },
    });

    /*
     * ---------------------------------------------------
     * Candlestick series
     * ---------------------------------------------------
     */

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",

      borderUpColor: "#4ade80",
      borderDownColor: "#f87171",

      wickUpColor: "#4ade80",
      wickDownColor: "#f87171",

      borderVisible: true,

      priceLineVisible: false,
      lastValueVisible: false,
    });

    /*
     * ---------------------------------------------------
     * Candle state
     * ---------------------------------------------------
     */

    const candleHistory = [];

    const MAX_CANDLES = 120;

    /*
     * Find candle by timestamp.
     */
    const findCandleIndex = (time) => {
      return candleHistory.findIndex(
        (item) => item.time === time
      );
    };

    /*
     * Add or update candle.
     */
    const upsertCandle = (candle) => {
      if (!candle) {
        return;
      }

      const time = Number(candle.time);
      const open = Number(candle.open);
      const high = Number(candle.high);
      const low = Number(candle.low);
      const close = Number(candle.close);

      if (
        !Number.isFinite(time) ||
        !Number.isFinite(open) ||
        !Number.isFinite(high) ||
        !Number.isFinite(low) ||
        !Number.isFinite(close)
      ) {
        return;
      }

      const normalizedCandle = {
        time,
        open,
        high,
        low,
        close,
      };

      const existingIndex = findCandleIndex(time);

      if (existingIndex !== -1) {
        candleHistory[existingIndex] =
          normalizedCandle;
      } else {
        candleHistory.push(normalizedCandle);
      }

      /*
       * Always keep chronological order.
       */
      candleHistory.sort(
        (a, b) => a.time - b.time
      );

      /*
       * Keep only the most recent candles.
       */
      if (candleHistory.length > MAX_CANDLES) {
        candleHistory.splice(
          0,
          candleHistory.length - MAX_CANDLES
        );
      }
    };

    /*
     * ---------------------------------------------------
     * API
     * ---------------------------------------------------
     */

    const API_BASE =
      import.meta.env.VITE_API_URL ||
      "https://admin-backend-qyhk.onrender.com/api";

    const streamUrl =
      `${API_BASE}/market/stream?symbol=TSLA`;

    /*
     * ---------------------------------------------------
     * Connect SSE
     * ---------------------------------------------------
     */

    const connect = () => {
      if (destroyed) {
        return;
      }

      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }

      console.log(
        "🔌 Connecting to TSLA market stream..."
      );

      eventSource = new EventSource(streamUrl);

      eventSource.onopen = () => {
        if (destroyed) {
          return;
        }

        console.log(
          "🟢 TSLA market stream connected"
        );
      };

      eventSource.onmessage = (event) => {
        if (destroyed) {
          return;
        }

        try {
          const message = JSON.parse(
            event.data
          );

          /*
           * ------------------------------------------------
           * Initial history
           * ------------------------------------------------
           *
           * This fills the chart with all candles that
           * the backend currently has.
           */
          if (
            message.type === "history" &&
            Array.isArray(message.candles)
          ) {
            candleHistory.length = 0;

            for (const candle of message.candles) {
              upsertCandle(candle);
            }

            if (candleHistory.length > 0) {
              series.setData(candleHistory);

              /*
               * Show the newest candles rather than
               * leaving the history somewhere off-screen.
               */
              chart.timeScale().fitContent();

              /*
               * Then move the viewport toward the live
               * edge while leaving some breathing room.
               */
              chart
                .timeScale()
                .scrollToRealTime();
            }

            return;
          }

          /*
           * ------------------------------------------------
           * Single live candle
           * ------------------------------------------------
           */
          if (
            message.type === "candle" &&
            message.candle
          ) {
            const candle = message.candle;

            const time = Number(candle.time);
            const open = Number(candle.open);
            const high = Number(candle.high);
            const low = Number(candle.low);
            const close = Number(candle.close);

            if (
              !Number.isFinite(time) ||
              !Number.isFinite(open) ||
              !Number.isFinite(high) ||
              !Number.isFinite(low) ||
              !Number.isFinite(close)
            ) {
              return;
            }

            const normalizedCandle = {
              time,
              open,
              high,
              low,
              close,
            };

            /*
             * Keep our local history synchronized.
             */
            upsertCandle(normalizedCandle);

            /*
             * update() is important here:
             *
             * Same timestamp = update current candle
             * New timestamp  = append new candle
             */
            series.update(normalizedCandle);

            /*
             * Keep the newest candle visible.
             */
            chart
              .timeScale()
              .scrollToRealTime();

            return;
          }

          /*
           * ------------------------------------------------
           * Connection status
           * ------------------------------------------------
           */
          if (message.type === "status") {
            console.log(
              `📊 TSLA stream status: ${message.status}`
            );
          }
        } catch (error) {
          console.error(
            "❌ TSLA market stream message error:",
            error
          );
        }
      };

      eventSource.onerror = () => {
        if (destroyed) {
          return;
        }

        console.warn(
          "🟡 TSLA market stream disconnected. EventSource will retry..."
        );
      };
    };

    /*
     * ---------------------------------------------------
     * Resize
     * ---------------------------------------------------
     */

    const resizeObserver =
      new ResizeObserver(() => {
        if (destroyed) {
          return;
        }

        const width =
          container.clientWidth;

        const height =
          container.clientHeight;

        if (!width || !height) {
          return;
        }

        chart.applyOptions({
          width,
          height,
        });
      });

    resizeObserver.observe(container);

    /*
     * Start stream.
     */
    connect();

    /*
     * ---------------------------------------------------
     * Cleanup
     * ---------------------------------------------------
     */

    return () => {
      destroyed = true;

      resizeObserver.disconnect();

      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }

      chart.remove();
    };
  }, []);

  return (
    <MarketBackgroundWrapper>
      <ChartContainer ref={chartContainerRef} />
      <ChartOverlay />
    </MarketBackgroundWrapper>
  );
};

export default MarketBackground;