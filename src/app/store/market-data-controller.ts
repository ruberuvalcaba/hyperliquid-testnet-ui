import { fetchCandles } from "../../features/chart/services";
import type { Candle } from "../../features/chart/types";
import type { AssetContext } from "../../features/market-summary/types";
import type { OrderBookSnapshot } from "../../features/order-book/types";
import type { Trade } from "../../features/trades/types";
import { hyperliquidWs } from "../../services/hyperliquid/websocket";
import { useMarketDataStore } from "./market-data-store";

const CANDLES_INTERVAL = "1m";
const isOrderBookSnapshot = (value: unknown): value is OrderBookSnapshot => {
	if (typeof value !== "object" || value === null) return false;

	const data = value as Record<string, unknown>;

	return (
		typeof data.coin === "string" &&
		typeof data.time === "number" &&
		Array.isArray(data.levels) &&
		data.levels.length === 2
	);
};
// Validates that a payload matches the Hyperliquid order book snapshot shape before updating the store.

const isTrade = (value: unknown): value is Trade => {
	if (typeof value !== "object" || value === null) return false;

	const trade = value as Record<string, unknown>;

	return (
		typeof trade.coin === "string" &&
		(trade.side === "B" || trade.side === "A") &&
		typeof trade.px === "string" &&
		typeof trade.sz === "string" &&
		typeof trade.time === "number" &&
		typeof trade.hash === "string" &&
		typeof trade.tid === "number"
	);
};
// Confirms that a message contains the fields needed to represent a valid trade event.

const isCandle = (value: unknown): value is Candle => {
	if (typeof value !== "object" || value === null) return false;

	const candle = value as Record<string, unknown>;

	return (
		typeof candle.t === "number" &&
		typeof candle.s === "string" &&
		typeof candle.i === "string" &&
		typeof candle.o === "string" &&
		typeof candle.h === "string" &&
		typeof candle.l === "string" &&
		typeof candle.c === "string" &&
		typeof candle.v === "string"
	);
};
// Checks whether an incoming payload is a valid candlestick object for chart updates.

const isAssetContext = (
	value: unknown,
): value is Omit<AssetContext, "coin"> => {
	if (typeof value !== "object" || value === null) return false;

	const context = value as Record<string, unknown>;

	return (
		typeof context.markPx === "string" &&
		typeof context.prevDayPx === "string" &&
		typeof context.dayNtlVlm === "string" &&
		typeof context.openInterest === "string" &&
		typeof context.funding === "string"
	);
};
// Verifies that a payload includes the fields required for an asset context update.

export const startMarketData = (market: string) => {
	const store = useMarketDataStore.getState();
	const unsubscribers: Array<() => void> = [];

	store.setStatus("connecting");

	unsubscribers.push(
		hyperliquidWs.onStatus((status) => {
			useMarketDataStore.getState().setStatus(status);
		}),
	);

	unsubscribers.push(
		hyperliquidWs.subscribe({ type: "l2Book", coin: market }, (data) => {
			if (!isOrderBookSnapshot(data) || data.coin !== market) return;

			useMarketDataStore.getState().setOrderBook(market, data);
		}),
	);

	unsubscribers.push(
		hyperliquidWs.subscribe({ type: "trades", coin: market }, (data) => {
			if (!Array.isArray(data)) return;

			const trades = data
				.filter(isTrade)
				.filter((trade) => trade.coin === market);

			if (trades.length > 0) {
				useMarketDataStore.getState().addTrades(market, trades);
			}
		}),
	);

	unsubscribers.push(
		hyperliquidWs.subscribe(
			{ type: "candle", coin: market, interval: CANDLES_INTERVAL },
			(data) => {
				if (!isCandle(data) || data.s !== market || data.i !== CANDLES_INTERVAL)
					return;

				useMarketDataStore.getState().updateCandle(market, data);
			},
		),
	);

	unsubscribers.push(
		hyperliquidWs.subscribe(
			{ type: "activeAssetCtx", coin: market },
			(data) => {
				if (typeof data !== "object" || data === null) return;

				const message = data as Record<string, unknown>;

				if (message.coin !== market || !isAssetContext(message.ctx)) return;

				useMarketDataStore.getState().setAssetContext(market, {
					coin: market,
					...message.ctx,
				});
			},
		),
	);

	let cancelled = false;

	void fetchCandles(market, CANDLES_INTERVAL).then((candles) => {
		if (cancelled) return;

		useMarketDataStore.getState().setCandles(market, candles.filter(isCandle));
	});

	return () => {
		cancelled = true;

		unsubscribers.forEach((unsubscribe) => {
			unsubscribe();
		});
	};
};
// Starts a live market-data subscription for a coin, syncs the store with incoming updates, and cleans up listeners on teardown.
