export type Trade = {
	coin: string;
	side: "B" | "A";
	px: string;
	sz: string;
	time: number;
	hash: string;
	tid: number;
};
