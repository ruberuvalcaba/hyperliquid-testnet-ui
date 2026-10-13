export type MarketSubscription =
	| { type: "l2Book"; coin: string }
	| { type: "trades"; coin: string }
	| { type: "candle"; coin: string; interval: string }
	| { type: "activeAssetCtx"; coin: string };

export type WsEnvelope = {
	channel?: string;
	data?: unknown;
};

export type DataListener = (data: unknown) => void;
export type Status = "connecting" | "connected" | "disconnected";

export type StatusListener = (status: Status) => void;

export type ActiveSubscription = {
	subscription: MarketSubscription;
	listeners: Set<DataListener>;
};
