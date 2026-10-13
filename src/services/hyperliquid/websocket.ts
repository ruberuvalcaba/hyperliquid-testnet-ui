const WS_URL = "wss://api.hyperliquid-testnet.xyz/ws";

import type {
	ActiveSubscription,
	DataListener,
	MarketSubscription,
	Status,
	StatusListener,
	WsEnvelope,
} from "./types";

const subscriptionKey = (subscription: MarketSubscription) =>
	JSON.stringify(subscription);
// Builds a stable key for a subscription so duplicate listeners can be tracked and cleaned up.

const createHyperliquidWebSocket = () => {
	// Creates the managed WebSocket client that connects to Hyperliquid, resubscribes automatically, and exposes status updates.
	let socket: WebSocket | null = null;
	let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	let reconnectAttempts = 0;
	let shouldReconnect = true;
	let status: Status = "disconnected";

	const subscriptions = new Map<string, ActiveSubscription>();
	const statusListeners = new Set<StatusListener>();

	const setStatus = (nextStatus: Status) => {
		status = nextStatus;
		statusListeners.forEach((listener) => {
			listener(status);
		});
	};
	// Updates the current WebSocket status and notifies every registered listener.

	const send = (message: object) => {
		if (socket?.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify(message));
		} else {
			console.warn("WS send skipped; socket isn't open");
		}
	};
	// Sends an outbound message only when the socket is ready and logs when it is not.

	const disconnect = () => {
		shouldReconnect = false;

		if (reconnectTimer !== null) {
			clearTimeout(reconnectTimer);
			reconnectTimer = null;
		}

		const currentSocket = socket;
		socket = null;

		if (currentSocket) {
			// Prevent a manually closed socket from changing status
			// or triggering another reconnect.
			currentSocket.onopen = null;
			currentSocket.onmessage = null;
			currentSocket.onerror = null;
			currentSocket.onclose = null;

			if (
				currentSocket.readyState === WebSocket.CONNECTING ||
				currentSocket.readyState === WebSocket.OPEN
			) {
				currentSocket.close();
			}
		}

		setStatus("disconnected");
	};
	// Stops the WebSocket, cancels reconnect attempts, and resets the connection state.

	const scheduleReconnect = () => {
		if (
			reconnectTimer !== null ||
			!shouldReconnect ||
			subscriptions.size === 0
		) {
			return;
		}

		const baseDelay = Math.min(1000 * 2 ** reconnectAttempts, 30_000);
		const delay = baseDelay * (0.8 + Math.random() * 0.4);

		reconnectAttempts += 1;

		reconnectTimer = setTimeout(() => {
			reconnectTimer = null;
			connect();
		}, delay);
	};
	// Schedules a reconnect attempt with exponential backoff when the socket drops unexpectedly.

	const handleMessage = (event: MessageEvent<string>) => {
		let message: WsEnvelope;

		try {
			message = JSON.parse(event.data) as WsEnvelope;
		} catch {
			console.error("Invalid WebSocket JSON message");
			return;
		}

		if (!message.channel || message.channel === "subscriptionResponse") {
			return;
		}

		subscriptions.forEach(({ subscription, listeners }) => {
			if (subscription.type !== message.channel) return;

			const data = message.data;

			if (typeof data !== "object" || data === null) return;

			const payload = data as Record<string, unknown>;

			const coin = Array.isArray(data)
				? (data[0] as Record<string, unknown> | undefined)?.coin
				: (payload.coin ?? payload.s);

			if (coin !== subscription.coin) return;

			if (
				subscription.type === "candle" &&
				payload.i !== subscription.interval
			) {
				return;
			}

			listeners.forEach((listener) => {
				listener(data);
			});
		});
	};
	// Dispatches incoming market data to the correct listeners based on channel and coin.

	const connect = () => {
		if (socket || subscriptions.size === 0 || !shouldReconnect) return;

		setStatus("connecting");

		const currentSocket = new WebSocket(WS_URL);
		socket = currentSocket;

		currentSocket.onopen = () => {
			if (socket !== currentSocket) return;

			reconnectAttempts = 0;
			setStatus("connected");

			subscriptions.forEach(({ subscription }) => {
				send({ method: "subscribe", subscription });
			});
		};

		currentSocket.onmessage = handleMessage;

		currentSocket.onerror = () => {
			if (socket !== currentSocket) return;

			console.error("WebSocket error");
			currentSocket.close();
		};

		currentSocket.onclose = () => {
			if (socket !== currentSocket) return;

			socket = null;
			setStatus("disconnected");

			if (shouldReconnect && subscriptions.size > 0) {
				scheduleReconnect();
			}
		};
	};
	// Opens the WebSocket and resubscribes any active market listeners when it connects.

	const subscribe = (
		subscription: MarketSubscription,
		listener: DataListener,
	) => {
		const key = subscriptionKey(subscription);
		const existing = subscriptions.get(key);

		if (existing) {
			existing.listeners.add(listener);
		} else {
			subscriptions.set(key, {
				subscription,
				listeners: new Set([listener]),
			});
		}

		shouldReconnect = true;

		if (!socket) {
			connect();
		} else if (socket.readyState === WebSocket.OPEN && !existing) {
			send({ method: "subscribe", subscription });
		}

		return () => {
			const active = subscriptions.get(key);

			if (!active) return;

			active.listeners.delete(listener);

			if (active.listeners.size === 0) {
				subscriptions.delete(key);

				if (socket?.readyState === WebSocket.OPEN) {
					send({
						method: "unsubscribe",
						subscription: active.subscription,
					});
				}
			}

			if (subscriptions.size === 0) {
				disconnect();
			}
		};
	};
	// Registers a listener for a market subscription and returns a cleanup function to unsubscribe it.

	const onStatus = (listener: StatusListener) => {
		statusListeners.add(listener);
		listener(status);

		return () => {
			statusListeners.delete(listener);
		};
	};
	// Adds a status listener and immediately emits the current connection state.

	return { subscribe, onStatus };
};

export const hyperliquidWs = createHyperliquidWebSocket();
