import type { CandlestickData, Time } from "lightweight-charts";
import type { Candle } from "./types";

export const toChartCandle = (candle: Candle): CandlestickData<Time> => ({
	time: (candle.t / 1000) as Time,
	open: Number(candle.o),
	high: Number(candle.h),
	low: Number(candle.l),
	close: Number(candle.c),
});
export const areCandlesEqual = (a: Candle, b: Candle) =>
	a.t === b.t &&
	a.o === b.o &&
	a.h === b.h &&
	a.l === b.l &&
	a.c === b.c &&
	a.v === b.v;
