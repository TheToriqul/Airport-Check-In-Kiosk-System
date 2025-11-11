import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { SeatUpdateEvent, BaggageUpdateEvent } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

class WebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;
  private seatSubscriptions: Map<string, (event: SeatUpdateEvent) => void> = new Map();
  private baggageSubscriptions: Map<string, (event: BaggageUpdateEvent) => void> = new Map();

  connect(): void {
    if (this.client?.connected) {
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL) as unknown as WebSocket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.connected = true;
        console.log('WebSocket connected');
        // Re-subscribe to existing subscriptions
        this.seatSubscriptions.forEach((callback, flightId) => {
          this.subscribeToSeatUpdates(flightId, callback);
        });
        this.baggageSubscriptions.forEach((callback, flightId) => {
          this.subscribeToBaggageUpdates(flightId, callback);
        });
      },
      onStompError: (frame) => {
        console.error('WebSocket STOMP error:', frame);
        this.connected = false;
      },
      onDisconnect: () => {
        this.connected = false;
        console.log('WebSocket disconnected');
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.connected = false;
      this.seatSubscriptions.clear();
      this.baggageSubscriptions.clear();
    }
  }

  subscribeToSeatUpdates(flightId: string, callback: (event: SeatUpdateEvent) => void): void {
    if (!this.client || !this.connected) {
      this.seatSubscriptions.set(flightId, callback);
      this.connect();
      return;
    }

    this.client.subscribe(
      `/topic/flights/${flightId}/seats`,
      (message) => {
        const event: SeatUpdateEvent = JSON.parse(message.body);
        callback(event);
      }
    );

    this.seatSubscriptions.set(flightId, callback);
  }

  subscribeToBaggageUpdates(flightId: string, callback: (event: BaggageUpdateEvent) => void): void {
    if (!this.client || !this.connected) {
      this.baggageSubscriptions.set(flightId, callback);
      this.connect();
      return;
    }

    this.client.subscribe(
      `/topic/flights/${flightId}/baggage`,
      (message) => {
        const event: BaggageUpdateEvent = JSON.parse(message.body);
        callback(event);
      }
    );

    this.baggageSubscriptions.set(flightId, callback);
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const wsService = new WebSocketService();

