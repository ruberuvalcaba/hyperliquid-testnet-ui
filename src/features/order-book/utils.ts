import type { OrderBookLevel, OrderBookRow } from "./types";

export const calculateCumulativeDepth = (
	levels: OrderBookLevel[],
): OrderBookRow[] => {
	let cumulativeSize = 0;

	return levels.map((level) => {
		cumulativeSize += Number(level.sz);

		return {
			...level,
			cumulativeSize,
			depthPercentage: 0,
		};
	});
};

export const normalizeDepth = (bids: OrderBookRow[], asks: OrderBookRow[]) => {
	const maxDepth = Math.max(
		...bids.map((level) => level.cumulativeSize),
		...asks.map((level) => level.cumulativeSize),
		0,
	);

	const normalize = (levels: OrderBookRow[]) =>
		levels.map((level) => ({
			...level,
			depthPercentage:
				maxDepth > 0 ? (level.cumulativeSize / maxDepth) * 100 : 0,
		}));

	return {
		bids: normalize(bids),
		asks: normalize(asks),
	};
};

export const formatPrice = (price: string) =>
	Number(price).toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});

export const formatSize = (size: number) =>
	size.toLocaleString("en-US", {
		maximumFractionDigits: 5,
	});
