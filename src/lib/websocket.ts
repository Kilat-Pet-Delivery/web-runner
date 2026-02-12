import type { TrackingUpdate } from '@/types/tracking';
import { getAccessToken } from './auth';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
const MAX_RECONNECT_ATTEMPTS = 5;

type TrackingCallback = (update: TrackingUpdate) => void;
type ErrorCallback = (error: string) => void;

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private bookingId: string | null = null;
  private onUpdate: TrackingCallback | null = null;
  private onError: ErrorCallback | null = null;

  connect(bookingId: string, onUpdate: TrackingCallback, onError?: ErrorCallback) {
    this.bookingId = bookingId;
    this.onUpdate = onUpdate;
    this.onError = onError || null;
    this.reconnectAttempts = 0;
    this.doConnect();
  }

  private doConnect() {
    if (!this.bookingId) return;

    const token = getAccessToken();
    if (!token) {
      this.onError?.('No authentication token');
      return;
    }

    const url = `${WS_BASE_URL}/ws/tracking/${this.bookingId}?token=${token}`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as TrackingUpdate;
          this.onUpdate?.(data);
          this.reconnectAttempts = 0;
        } catch {
          this.onError?.('Failed to parse tracking update');
        }
      };

      this.ws.onerror = () => this.attemptReconnect();
      this.ws.onclose = () => this.attemptReconnect();
    } catch {
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (!this.bookingId) return;
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      this.onError?.('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.pow(2, this.reconnectAttempts) * 1000;

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.ws?.close();
      this.doConnect();
    }, delay);
  }

  disconnect() {
    this.bookingId = null;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
    this.onUpdate = null;
    this.onError = null;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
