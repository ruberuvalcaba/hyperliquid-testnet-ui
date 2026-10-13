import { useMarketDataStore } from "../../app/store/market-data-store";
import { Stat } from "./Stat";
import { formatCompact, formatPercent, formatPrice } from "./utils";

export const MarketSummary = ({ market }: { market: string }) => {
	const markPx = useMarketDataStore(
		(state) => state.assetContexts[market]?.markPx,
	);
	const prevDayPx = useMarketDataStore(
		(state) => state.assetContexts[market]?.prevDayPx,
	);
	const dayNtlVlm = useMarketDataStore(
		(state) => state.assetContexts[market]?.dayNtlVlm,
	);
	const openInterest = useMarketDataStore(
		(state) => state.assetContexts[market]?.openInterest,
	);

	const hasContext =
		markPx !== undefined &&
		prevDayPx !== undefined &&
		dayNtlVlm !== undefined &&
		openInterest !== undefined;

	const markPrice = Number(markPx);
	const previousPrice = Number(prevDayPx);

	const change =
		hasContext && previousPrice > 0
			? ((markPrice - previousPrice) / previousPrice) * 100
			: null;

	return (
		<section className="space-y-3">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-sm font-semibold text-zinc-200">{market}-PERP</h2>
					<p className="mt-1 text-xs text-zinc-500">Live market statistics</p>
				</div>
				<span className="flex items-center gap-2 text-xs text-zinc-500">
					<span
						className={`size-2 rounded-full ${hasContext ? "bg-emerald-400" : "animate-pulse bg-amber-400"}`}
					/>
					{hasContext ? "Live" : "Waiting for data"}
				</span>
			</div>

			<div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
				<Stat
					label="Mark Price"
					value={hasContext ? formatPrice(markPx) : "—"}
				/>
				<Stat
					label="24h Change"
					value={change === null ? "—" : formatPercent(change)}
					valueClassName={
						change === null
							? "text-zinc-100"
							: change >= 0
								? "text-emerald-400"
								: "text-red-400"
					}
				/>
				<Stat
					label="24h Volume"
					value={hasContext ? `$${formatCompact(dayNtlVlm)}` : "—"}
				/>
				<Stat
					label="Open Interest"
					value={hasContext ? formatCompact(openInterest) : "—"}
				/>
			</div>
		</section>
	);
};
