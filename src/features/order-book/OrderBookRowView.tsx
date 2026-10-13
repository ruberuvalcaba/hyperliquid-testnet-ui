import { memo } from "react";
import type { OrderBookRow, OrderBookSide } from "./types";
import { formatPrice, formatSize } from "./utils";

export const OrderBookRowView = memo(
  ({ row, side }: { row: OrderBookRow; side: OrderBookSide }) => (
    <div className="relative grid grid-cols-3 gap-2 overflow-hidden px-3 py-1.5 font-mono text-xs tabular-nums">
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 ${
          side === "bid" ? "bg-emerald-500/10" : "bg-red-500/10"
        }`}
        style={{ width: `${row.depthPercentage}%` }}
      />

      <span
        className={`relative ${
          side === "bid" ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {formatPrice(row.px)}
      </span>

      <span className="relative text-right text-zinc-300">
        {formatSize(Number(row.sz))}
      </span>

      <span className="relative text-right text-zinc-500">
        {formatSize(row.cumulativeSize)}
      </span>
    </div>
  ),
);
