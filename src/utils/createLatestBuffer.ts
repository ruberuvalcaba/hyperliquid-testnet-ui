//Assumes the simulator produces 100 updates/sec continuously. Actual browser scheduling and rendering may produce 20 updates with a 50 ms buffer rather than 100.
export const createLatestBuffer = <T>(
	publish: (value: T) => void,
	interval = 50,
) => {
	let latest: T | null = null;
	let timer: ReturnType<typeof setInterval> | null = null;

	const flush = () => {
		if (latest === null) return;

		const value = latest;
		latest = null;

		publish(value);
	};

	return {
		push(value: T) {
			latest = value;

			if (timer === null) {
				timer = setInterval(flush, interval);
			}
		},

		stop() {
			if (timer !== null) {
				clearInterval(timer);
				timer = null;
			}

			latest = null;
		},
	};
};
