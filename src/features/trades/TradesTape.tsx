import { memo } from "react";
import { useMarketDataStore } from "../../app/store/market-data-store";
import type { Trade } from "./types";

const MAX_TRADES = 50;

const formatPrice = (price: string) =>
  Number(price).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatSize = (size: string | number) =>
  Number(size).toLocaleString("en-US", {
    maximumFractionDigits: 5,
  });

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const EMPTY_TRADES: Trade[] = [];

const TradeRow = memo(({ trade }: { trade: Trade }) => {
  const isBuy = trade.side === "B";

  return (
    <div className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-3 px-4 py-2 font-mono text-xs tabular-nums">
      <span className={isBuy ? "text-emerald-400" : "text-red-400"}>
        {formatPrice(trade.px)}
      </span>

      <span className="text-right text-zinc-300">{formatSize(trade.sz)}</span>

      <span className="text-right text-zinc-400">
        {formatSize(Number(trade.px) * Number(trade.sz))}
      </span>

      <span className="text-right text-zinc-600">{formatTime(trade.time)}</span>
    </div>
  );
});

TradeRow.displayName = "TradeRow";

export const TradesTape = ({ market }: { market: string }) => {
  const trades = useMarketDataStore(
    (state) => state.trades[market] ?? EMPTY_TRADES,
  );

  return (
    <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-xl shadow-black/20">
      <header className="border-b border-zinc-800 px-4 py-4">
        <h2 className="text-sm font-semibold tracking-wide">Recent Trades</h2>
        <p className="mt-1 text-xs text-zinc-500">
          {market}-PERP · {trades.length} recent trades
        </p>
      </header>

      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 border-b border-zinc-800 px-4 py-2.5 text-[11px] text-zinc-500">
        <span>Price (USD)</span>
        <span className="text-right">Size</span>
        <span className="text-right">Value (USD)</span>
        <span className="text-right">Time</span>
      </div>

      {trades.length === 0 ? (
        <div
          role="status"
          className="flex h-48 items-center justify-center text-sm text-zinc-500"
        >
          Waiting for trades…
        </div>
      ) : (
        <div className="max-h-[420px] overflow-y-auto">
          {trades.map((trade, index) => (
            <TradeRow
              key={`${trade.tid}-${trade.hash}-${index}`}
              trade={trade}
            />
          ))}
        </div>
      )}

      <footer className="border-t border-zinc-800 px-4 py-2 text-[11px] text-zinc-600">
        Latest {MAX_TRADES} trades · Live updates
      </footer>
    </section>
  );
};
