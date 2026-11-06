import { useEffect, useState } from "react";
import { startMarketData } from "./app/store/market-data-controller";
import { useMarketDataStore } from "./app/store/market-data-store";
import { CandlestickChart } from "./features/chart/CandlestickChart";
import { MarketSummary } from "./features/market-summary/MarketSummary";
import { OrderBook } from "./features/order-book/OrderBook";
import { TradesTape } from "./features/trades/TradesTape";
import { Select } from "./shared/components/ui/Select";

const MARKETS = ["BTC", "ETH", "SOL"] as const;

type Market = (typeof MARKETS)[number];

export default function App() {
	const [market, setMarket] = useState<Market>("BTC");
	const status = useMarketDataStore((state) => state.status);
	const simulateHighTraffic = useMarketDataStore(
		(state) => state.simulateHighTraffic,
	);
	const setSimulateHighTraffic = useMarketDataStore(
		(state) => state.setSimulateHighTraffic,
	);
	const isConnected = status === "connected";

	useEffect(() => {
		return startMarketData(market);
	}, [market]);

	return (
		<main className="min-h-screen bg-[#09090b] font-sans text-zinc-100">
			<header className="border-b border-emerald-800/50 bg-zinc-950/80">
				<div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-4">
					<h1 className="text-base font-semibold tracking-tight text-emerald-400">
						Hyperliquid
					</h1>

					<div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5">
						<span
							className={`size-2 rounded-full ${
								isConnected
									? "bg-emerald-400"
									: status === "connecting"
										? "animate-pulse bg-amber-400"
										: "bg-red-400"
							}`}
						/>
						<span className="text-xs capitalize text-zinc-400">{status}</span>
					</div>
				</div>
			</header>

			<div className="mx-auto max-w-screen-2xl px-6 py-8">
				<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-zinc-800 ">
					<Select
						id="market"
						label="Select market"
						value={market}
						onChange={setMarket}
						options={MARKETS.map((coin) => ({
							value: coin,
							label: `${coin}-PERP`,
						}))}
					/>

					<div className="text-end">
						<p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">
							Markets / Perpetuals
						</p>
						<h2 className="text-2xl font-semibold tracking-tight">
							Market Overview
						</h2>
						<p className="mt-1 text-sm text-zinc-500">
							Real-time order book and market depth
						</p>
					</div>
				</div>
				<div className="mb-6">
					<label className="mb-6 flex w-fit cursor-pointer items-center gap-3 text-sm text-zinc-300">
						<input
							type="checkbox"
							role="switch"
							aria-checked={simulateHighTraffic}
							checked={simulateHighTraffic}
							onChange={(event) => setSimulateHighTraffic(event.target.checked)}
							className="peer sr-only"
						/>
						<span
							aria-hidden="true"
							className="relative h-6 w-11 rounded-full bg-zinc-700 transition-colors after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-emerald-600 peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-zinc-950"
						/>
						<span>Simulate high traffic</span>
						<span className="text-xs text-zinc-500">
							{simulateHighTraffic ? "On · ~100 updates/s" : "Off"}
						</span>
					</label>
					<MarketSummary market={market} />
				</div>
				<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]">
					<section className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5">
						<div className="mb-4 flex items-center justify-between">
							<h3 className="text-sm font-medium text-zinc-300">
								Market Activity
							</h3>
							<span className="text-xs text-zinc-600">1m interval</span>
						</div>
						<CandlestickChart market={market} />
					</section>

					<OrderBook market={market} />
				</div>
				{/* Recent trades */}
				<div className="mt-5">
					<TradesTape market={market} />
				</div>
			</div>
		</main>
	);
}
