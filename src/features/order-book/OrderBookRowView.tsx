import { memo } from "react";
import type { OrderBookRow, OrderBookSide } from "./types";
import { formatPrice, formatSize } from "./utils";

type RowViewProps = {
  row: OrderBookRow;
  side: OrderBookSide;
};

export const OrderBookRowView = memo(
  ({ row, side }: RowViewProps) => (
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
  (prev, next) =>
    prev.side === next.side &&
    prev.row.px === next.row.px &&
    prev.row.sz === next.row.sz &&
    prev.row.cumulativeSize === next.row.cumulativeSize &&
    prev.row.depthPercentage === next.row.depthPercentage,
);
//React's default memo comparison checks the row reference, not its individual properties. Adding validation for that.
