export type OrderBookLevel = {
	px: string;
	sz: string;
	n: number;
};

export type OrderBookSnapshot = {
	coin: string;
	time: number;
	levels: [OrderBookLevel[], OrderBookLevel[]];
};

export type OrderBookRow = OrderBookLevel & {
	cumulativeSize: number;
	depthPercentage: number;
};

export type OrderBookSide = "bid" | "ask";
