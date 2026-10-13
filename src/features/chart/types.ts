export type Candle = {
	t: number;
	o: string;
	h: string;
	l: string;
	v: string;
	T: number;
	i: string;
	s: string;
	c: string;
	n: number;
};
/*
 *   t: candle opening time in milliseconds.
 *   o, h, l, c: open, high, low, and close prices.
 *   v: traded volume.
 *   i: candle interval, such as 1m.
 */

export type CandleSnapshot = {
	coin: string;
	interval: string;
	candles: Candle[];
};
