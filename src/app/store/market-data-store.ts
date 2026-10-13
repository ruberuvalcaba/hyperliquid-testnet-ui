import { create } from "zustand";
import type { Candle } from "../../features/chart/types";
import type { AssetContext } from "../../features/market-summary/types";
import type { OrderBookSnapshot } from "../../features/order-book/types";
import type { Trade } from "../../features/trades/types";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

type MarketDataState = {
	status: ConnectionStatus;
	orderBooks: Record<string, OrderBookSnapshot | undefined>;
	trades: Record<string, Trade[] | undefined>;
	candles: Record<string, Candle[] | undefined>;
	assetContexts: Record<string, AssetContext | undefined>;

	setStatus: (status: ConnectionStatus) => void;
	setOrderBook: (coin: string, snapshot: OrderBookSnapshot) => void;
	addTrades: (coin: string, incoming: Trade[]) => void;
	updateCandle: (coin: string, candle: Candle) => void;
	setCandles: (coin: string, candles: Candle[]) => void;
	setAssetContext: (coin: string, context: AssetContext) => void;
};

const MAX_TRADES = 50;

export const useMarketDataStore = create<MarketDataState>((set) => ({
	// Stores live order books, trades, candles, and asset context keyed by market symbol for the UI.
	status: "disconnected",
	orderBooks: {},
	trades: {},
	candles: {},
	assetContexts: {},

	setStatus: (status) => set({ status }),
	// Sets the current websocket connection status for the active market data stream.

	setOrderBook: (coin, snapshot) =>
		set((state) => ({
			orderBooks: {
				...state.orderBooks,
				[coin]: snapshot,
			},
		})),
	// Stores the latest order book snapshot for a coin so consumers can read the current book state.

	addTrades: (coin, incoming) =>
		set((state) => ({
			trades: {
				...state.trades,
				[coin]: [...incoming, ...(state.trades[coin] ?? [])].slice(
					0,
					MAX_TRADES,
				),
			},
		})),
	// Prepends the newest trades to the per-market list while keeping only the most recent entries.

	updateCandle: (coin, candle) =>
		set((state) => {
			const existing = state.candles[coin] ?? [];
			const last = existing[existing.length - 1];

			if (last && last.t === candle.t) {
				return {
					candles: {
						...state.candles,
						[coin]: [...existing.slice(0, -1), candle],
					},
				};
			}

			if (last && candle.t < last.t) {
				return {};
			}

			return {
				candles: {
					...state.candles,
					[coin]: [...existing, candle].slice(-500),
				},
			};
		}),
	// Replaces the last candle when it is refreshed or appends a newer candle to the market timeline.

	setCandles: (coin, incoming) =>
		set((state) => {
			const existing = state.candles[coin] ?? [];
			const byTimestamp = new Map<number, Candle>();

			for (const candle of incoming) {
				byTimestamp.set(candle.t, candle);
			}

			// Preserve live candles that may have arrived while the historical request was in flight.
			for (const candle of existing) {
				byTimestamp.set(candle.t, candle);
			}

			const candles = [...byTimestamp.values()]
				.sort((a, b) => a.t - b.t)
				.slice(-500);

			return {
				candles: {
					...state.candles,
					[coin]: candles,
				},
			};
		}),
	// Merges historical and live candles for a coin and keeps the latest 500 timestamps in order.

	setAssetContext: (coin, context) =>
		set((state) => ({
			assetContexts: {
				...state.assetContexts,
				[coin]: context,
			},
		})),
	// Saves the latest pricing and funding context associated with a market symbol.
}));
