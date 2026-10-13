import { memo } from "react";
import { OrderBookRowView } from "./OrderBookRowView";
import type { OrderBookRow, OrderBookSide } from "./types";

type SideProps = {
	side: OrderBookSide;
	rows: OrderBookRow[];
};

export const OrderBookSideView = memo(({ side, rows }: SideProps) => (
	<div>
		<div className="grid grid-cols-3 gap-2 border-b border-zinc-800 px-3 py-2.5 text-[11px] text-zinc-500">
			<span>Price (USD)</span>
			<span className="text-right">Size</span>
			<span className="text-right">Total</span>
		</div>

		{rows.map((row) => (
			<OrderBookRowView key={`${side}-${row.px}`} row={row} side={side} />
		))}
	</div>
));
