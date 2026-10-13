import { useMemo } from "react";
import { useMarketDataStore } from "../../app/store/market-data-store";
import { OrderBookSideView } from "./OrderBookSideView";
import { calculateCumulativeDepth, formatPrice, normalizeDepth } from "./utils";

type OrderBookProps = {
	market: string;
};

export const OrderBook = ({ market }: OrderBookProps) => {
	const snapshot = useMarketDataStore(
		(state) => state.orderBooks[market] ?? null,
	);

	const { bids, asks } = useMemo(() => {
		if (!snapshot) return { bids: [], asks: [] };

		const [rawBids, rawAsks] = snapshot.levels;

		return normalizeDepth(
			calculateCumulativeDepth(rawBids.slice(0, 10)),
			calculateCumulativeDepth(rawAsks.slice(0, 10)),
		);
	}, [snapshot]);

	const spread = useMemo(() => {
		if (!bids.length || !asks.length) return null;

		return Number(asks[0].px) - Number(bids[0].px);
	}, [bids, asks]);

	return (
		<section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-xl shadow-black/20">
			<header className="border-b border-zinc-800 px-4 py-4">
				<h2 className="text-sm font-semibold tracking-wide">Order Book</h2>
				<p className="mt-1 text-xs text-zinc-500">
					{market}-PERP · {snapshot ? "Live market data" : "Waiting for data…"}
				</p>
			</header>

			{!snapshot ? (
				<div
					role="status"
					className="flex h-48 items-center justify-center gap-2 text-sm text-zinc-500"
				>
					<span className="size-4 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-400" />
					Loading order book...
				</div>
			) : (
				<>
					<OrderBookSideView side="ask" rows={[...asks].reverse()} />

					<div className="border-y border-zinc-800 bg-zinc-900/70 px-3 py-3 text-center">
						<span className="text-xs text-zinc-500">Spread </span>
						<span className="font-mono text-sm font-medium tabular-nums text-zinc-200">
							{spread === null ? "—" : `$${formatPrice(String(spread))}`}
						</span>
					</div>

					<OrderBookSideView side="bid" rows={bids} />

					<footer className="border-t border-zinc-800 px-3 py-2 text-[11px] text-zinc-600">
						Showing up to 10 levels per side
					</footer>
				</>
			)}
		</section>
	);
};
