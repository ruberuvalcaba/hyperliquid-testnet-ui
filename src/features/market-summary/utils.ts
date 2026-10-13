export const formatPrice = (value: string) =>
	Number(value).toLocaleString("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});

export const formatCompact = (value: string) =>
	Number(value).toLocaleString("en-US", {
		notation: "compact",
		maximumFractionDigits: 2,
	});

export const formatPercent = (value: number) =>
	`${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
