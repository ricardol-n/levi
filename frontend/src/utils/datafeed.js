// frontend/src/utils/tradingviewDatafeed.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;


export default function createDatafeed(symbol) {
  return {
    onReady: (callback) => {
      setTimeout(() => callback({
        supports_search: true,
        supports_group_request: false,
        supported_resolutions: ["1", "5", "15", "30", "60", "D"],
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: true,
      }), 0);
    },

    resolveSymbol: (symbolName, onSymbolResolvedCallback) => {
      setTimeout(() => {
        onSymbolResolvedCallback({
          name: symbolName,
          ticker: symbolName,
          type: "stock",
          session: "0930-1630",
          timezone: "Etc/UTC",
          has_intraday: true,
          has_daily: true,
          supported_resolutions: ["1", "5", "15", "30", "60", "D"],
          pricescale: 100,
          volume_precision: 2,
        });
      }, 0);
    },

    getBars: async (symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback) => {
      try {
        const { data } = await axios.get(`${API_URL}/candles/${symbolInfo.ticker}`);
        
        const bars = data.t.map((time, i) => ({
          time: time * 1000,
          low: data.l[i],
          high: data.h[i],
          open: data.o[i],
          close: data.c[i],
          volume: data.v[i],
        }));

        onHistoryCallback(bars, { noData: bars.length === 0 });
      } catch (err) {
        console.error("❌ Error loading candles:", err);
        onErrorCallback(err);
      }
    },

    subscribeBars: () => {},
    unsubscribeBars: () => {},
  };
}
