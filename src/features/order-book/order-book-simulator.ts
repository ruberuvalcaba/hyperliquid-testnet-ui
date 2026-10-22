import type { OrderBookSnapshot } from "./types";

type SimulatorOptions = {
	interval?: number;
	onSnapshot: (snapshot: OrderBookSnapshot) => void;
};

export const createOrderBookSimulator = ({
	interval = 10,
	onSnapshot,
}: SimulatorOptions) => {
	let latestSnapshot: OrderBookSnapshot | null = null;
	let timer: ReturnType<typeof setInterval> | null = null;
	// Small shared price movement: ±0.01% per update.
	const priceVariation = 1 + (Math.random() - 0.5) * 0.0002;

	const generateSnapshot = (
		snapshot: OrderBookSnapshot,
	): OrderBookSnapshot => ({
		...snapshot,
		time: Date.now(),
		levels: snapshot.levels.map((side) =>
			side.map((level) => {
				const size = Number(level.sz);
				const variation = 1 + (Math.random() - 0.5) * 0.02;

				return {
					...level,
					px: (Number(level.px) * priceVariation).toFixed(2),
					sz: Math.max(0, size * variation).toFixed(5),
				};
			}),
		) as OrderBookSnapshot["levels"],
	});

	return {
		updateBaseline(snapshot: OrderBookSnapshot) {
			latestSnapshot = snapshot;
		},

		start() {
			if (timer !== null) return;

			timer = setInterval(() => {
				if (!latestSnapshot) return;

				latestSnapshot = generateSnapshot(latestSnapshot);
				onSnapshot(latestSnapshot);
			}, interval);
		},

		stop() {
			if (timer !== null) {
				clearInterval(timer);
				timer = null;
			}

			latestSnapshot = null;
		},
	};
};
