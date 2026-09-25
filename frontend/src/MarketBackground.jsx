import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import {
  createChart,
  CandlestickSeries,
} from "lightweight-charts";

const MarketBackgroundWrapper = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;

  opacity: 0.2;

  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 15%,
    black 85%,
    transparent 100%
  );

  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 15%,
    black 85%,
    transparent 100%
  );

  @media (max-width: 1024px) {
    opacity: 0.12;
  }

  @media (max-width: 425px) {
    opacity: 0.08;
  }

  @media (max-width: 320px) {
    opacity: 0.05;
  }
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const MarketBackground = () => {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,

      layout: {
        background: {
          type: "solid",
          color: "transparent",
        },
        textColor: "rgba(201, 162, 39, 0.25)",
      },

      grid: {
        vertLines: {
          color: "rgba(255,255,255,0.025)",
        },
        horzLines: {
          color: "rgba(255,255,255,0.025)",
        },
      },

      rightPriceScale: {
        visible: false,
        borderVisible: false,
      },

      timeScale: {
        visible: false,
        borderVisible: false,
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
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",

      priceLineVisible: false,
      lastValueVisible: false,
    });

    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    });

    resizeObserver.observe(container);

    let socket;
    let reconnectTimer;
    let destroyed = false;

    const connect = () => {
      if (destroyed) return;

      socket = new WebSocket(
        "wss://stream.binance.com:9443/ws/btcusdt@kline_1m"
      );

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.e !== "kline") return;

          const candle = message.k;

          series.update({
            time: Math.floor(candle.t / 1000),
            open: Number(candle.o),
            high: Number(candle.h),
            low: Number(candle.l),
            close: Number(candle.c),
          });
        } catch (error) {
          console.error(
            "Market candle error:",
            error
          );
        }
      };

      socket.onerror = () => {
        socket?.close();
      };

      socket.onclose = () => {
        if (destroyed) return;

        reconnectTimer = setTimeout(() => {
          connect();
        }, 3000);
      };
    };

    connect();

    return () => {
      destroyed = true;

      clearTimeout(reconnectTimer);

      resizeObserver.disconnect();

      if (socket) {
        socket.close();
      }

      chart.remove();
    };
  }, []);

  return (
    <MarketBackgroundWrapper>
      <ChartContainer ref={chartContainerRef} />
    </MarketBackgroundWrapper>
  );
};

export default MarketBackground;