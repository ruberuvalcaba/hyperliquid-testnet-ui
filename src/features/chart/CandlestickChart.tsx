import {
  CandlestickSeries,
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import { useEffect, useRef } from "react";
import { useMarketDataStore } from "../../app/store/market-data-store";
import type { Candle } from "./types";
import { areCandlesEqual, toChartCandle } from "./utils";

/** This component:
 * Creates the chart once and removes it on unmount.
 * Subscribes to the selected market's one-minute candles.
 * Fetches the last 3 hours of candles on market change.
 * Uses the lightweight-charts library.
 * Calls series.update() as new candle updates arrive, rather than rebuilding the whole chart.
 * Clears the previous series when switching markets.
 * Uses the existing shared WebSocket connection.
 */

const EMPTY_CANDLES: Candle[] = [];

export const CandlestickChart = ({ market }: { market: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const previousCandlesRef = useRef<Candle[]>([]);
  const previousMarketRef = useRef(market);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const candles = useMarketDataStore(
    (state) => state.candles[market] ?? EMPTY_CANDLES,
  );
  const hasData = candles.length > 0;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "#09090b" },
        textColor: "#a1a1aa",
      },
      grid: {
        vertLines: { color: "#27272a" },
        horzLines: { color: "#27272a" },
      },
      rightPriceScale: {
        borderColor: "#27272a",
      },
      timeScale: {
        borderColor: "#27272a",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#34d399",
      downColor: "#f87171",
      borderUpColor: "#34d399",
      borderDownColor: "#f87171",
      wickUpColor: "#34d399",
      wickDownColor: "#f87171",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

    const previousCandles = previousCandlesRef.current;
    const marketChanged = previousMarketRef.current !== market;

    // First load or switching markets: reset the complete dataset.
    if (marketChanged || previousCandles.length === 0) {
      series.setData(candles.map(toChartCandle));
    } else {
      const sameLength = candles.length === previousCandles.length;

      const unchangedBeforeLast =
        sameLength &&
        candles
          .slice(0, -1)
          .every((candle, index) =>
            areCandlesEqual(candle, previousCandles[index]),
          );

      const appendedOneCandle =
        candles.length === previousCandles.length + 1 &&
        previousCandles.every((candle, index) =>
          areCandlesEqual(candle, candles[index]),
        );

      if (
        unchangedBeforeLast &&
        candles.length > 0 &&
        candles[candles.length - 1].t ===
          previousCandles[previousCandles.length - 1].t
      ) {
        // The current candle changed.
        series.update(toChartCandle(candles[candles.length - 1]));
      } else if (appendedOneCandle) {
        // A new candle arrived.
        series.update(toChartCandle(candles[candles.length - 1]));
      } else {
        // Historical data changed or multiple candles were added.
        series.setData(candles.map(toChartCandle));
      }
    }

    previousCandlesRef.current = candles;
    previousMarketRef.current = market;
  }, [candles, market]);

  return (
    <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-4 py-4">
        <h2 className="text-sm font-semibold tracking-wide">
          {market}-PERP · Candlestick Chart
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          3h Historical View · 1m Candles · Testnet
        </p>
      </header>

      <div className="relative">
        <div ref={containerRef} className="h-80 w-full" />

        {!hasData && (
          <div
            role="status"
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-zinc-950/50 text-sm text-zinc-500"
          >
            Waiting for candle data...
          </div>
        )}
      </div>
    </section>
  );
};
