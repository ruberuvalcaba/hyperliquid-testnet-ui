import type { Candle } from "./types";

const INFO_URL = "https://api.hyperliquid-testnet.xyz/info";

export const fetchCandles = async (
	coin: string,
	interval: string,
): Promise<Candle[]> => {
	const now = Date.now();

	const response = await fetch(INFO_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			type: "candleSnapshot",
			req: {
				coin,
				interval,
				startTime: now - 1000 * 60 * 60 * 3, // 3 hours ago
				endTime: now,
			},
		}),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch candles: ${response.status}`);
	}

	return response.json() as Promise<Candle[]>;
};
