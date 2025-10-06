/**
 * Observability & Telemetry Tracker
 * Minimal, targeted event tracking with correlation IDs
 * Records: action, latency, errors, flag state snapshot
 */

import { getFlagSnapshot } from '@/config/runtime';

export type TelemetryEvent = 
  | 'start_guidance'
  | 'find_item_open'
  | 'settings_save'
  | 'checkout_open'
  | 'portal_open'
  | 'auth_signin'
  | 'auth_signup'
  | 'auth_signout'
  | 'payment_success'
  | 'payment_failed'
  | 'webhook_received';

export interface TelemetryData {
  event: TelemetryEvent;
  correlationId: string;
  timestamp: number;
  latency?: number;
  error?: string;
  flagSnapshot: Record<string, boolean>;
  metadata?: Record<string, any>;
}

class TelemetryTracker {
  private events: TelemetryData[] = [];
  private readonly maxEvents = 1000;

  /**
   * Generate correlation ID for request tracing
   */
  generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track an event with automatic correlation
   */
  track(event: TelemetryEvent, metadata?: Record<string, any>): string {
    const correlationId = this.generateCorrelationId();
    
    const data: TelemetryData = {
      event,
      correlationId,
      timestamp: Date.now(),
      flagSnapshot: getFlagSnapshot(),
      metadata,
    };

    this.events.push(data);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log in dev
    if (import.meta.env.DEV) {
      console.info('[Telemetry]', event, data);
    }

    return correlationId;
  }

  /**
   * Track with latency measurement
   */
  async trackWithLatency<T>(
    event: TelemetryEvent,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const start = performance.now();
    const correlationId = this.generateCorrelationId();

    try {
      const result = await fn();
      const latency = performance.now() - start;

      const data: TelemetryData = {
        event,
        correlationId,
        timestamp: Date.now(),
        latency,
        flagSnapshot: getFlagSnapshot(),
        metadata,
      };

      this.events.push(data);

      if (this.events.length > this.maxEvents) {
        this.events = this.events.slice(-this.maxEvents);
      }

      if (import.meta.env.DEV) {
        console.info('[Telemetry]', event, `${latency.toFixed(2)}ms`, data);
      }

      return result;
    } catch (error) {
      const latency = performance.now() - start;
      const errorMessage = error instanceof Error ? error.message : String(error);

      const data: TelemetryData = {
        event,
        correlationId,
        timestamp: Date.now(),
        latency,
        error: errorMessage,
        flagSnapshot: getFlagSnapshot(),
        metadata,
      };

      this.events.push(data);

      if (import.meta.env.DEV) {
        console.error('[Telemetry]', event, errorMessage, data);
      }

      throw error;
    }
  }

  /**
   * Get recent events for debugging
   */
  getRecentEvents(count = 50): TelemetryData[] {
    return this.events.slice(-count);
  }

  /**
   * Get error count for specific event
   */
  getErrorCount(event: TelemetryEvent, since: number = Date.now() - 86400000): number {
    return this.events.filter(
      e => e.event === event && e.error && e.timestamp >= since
    ).length;
  }

  /**
   * Get p95 latency for specific event
   */
  getP95Latency(event: TelemetryEvent, since: number = Date.now() - 86400000): number | null {
    const latencies = this.events
      .filter(e => e.event === event && e.latency && e.timestamp >= since)
      .map(e => e.latency!)
      .sort((a, b) => a - b);

    if (latencies.length === 0) return null;

    const p95Index = Math.floor(latencies.length * 0.95);
    return latencies[p95Index];
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
  }
}

export const telemetry = new TelemetryTracker();
