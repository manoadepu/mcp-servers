import { EventEmitter } from 'eventemitter3';
import {
  ProviderEvent,
  ProviderEventType,
  ProviderEventHandler,
  ProviderInfo
} from './types';

/**
 * Provider event bus implementation
 */
export class ProviderEventBus {
  private emitter: EventEmitter;
  private handlers: Map<string, Set<ProviderEventHandler>>;

  constructor() {
    this.emitter = new EventEmitter();
    this.handlers = new Map();
  }

  /**
   * Subscribe to provider events
   * @param type Event type to subscribe to
   * @param handler Event handler function
   * @returns Unsubscribe function
   */
  public subscribe<T = any>(
    type: ProviderEventType,
    handler: ProviderEventHandler<T>
  ): () => void {
    // Create handler set if it doesn't exist
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }

    // Add handler to set
    const handlers = this.handlers.get(type)!;
    handlers.add(handler);

    // Add to event emitter
    this.emitter.on(type, handler);

    // Return unsubscribe function
    return () => {
      handlers.delete(handler);
      this.emitter.off(type, handler);
    };
  }

  /**
   * Unsubscribe from provider events
   * @param type Event type to unsubscribe from
   * @param handler Event handler to remove
   */
  public unsubscribe<T = any>(
    type: ProviderEventType,
    handler: ProviderEventHandler<T>
  ): void {
    const handlers = this.handlers.get(type);
    if (handlers) {
      handlers.delete(handler);
      this.emitter.off(type, handler);
    }
  }

  /**
   * Publish a provider event
   * @param type Event type
   * @param provider Provider info
   * @param data Event data
   */
  public async publish<T = any>(
    type: ProviderEventType,
    provider: ProviderInfo,
    data: T
  ): Promise<void> {
    const event: ProviderEvent<T> = {
      type,
      provider,
      timestamp: new Date(),
      data
    };

    // Get handlers for this event type
    const handlers = this.handlers.get(type);
    if (!handlers) {
      return;
    }

    // Execute handlers in parallel
    const promises = Array.from(handlers).map(handler =>
      Promise.resolve(handler(event)).catch(error => {
        console.error('Error in event handler:', error);
      })
    );

    await Promise.all(promises);
  }

  /**
   * Remove all event handlers
   */
  public clear(): void {
    this.handlers.clear();
    this.emitter.removeAllListeners();
  }

  /**
   * Get number of handlers for an event type
   * @param type Event type
   * @returns Number of handlers
   */
  public handlerCount(type: ProviderEventType): number {
    const handlers = this.handlers.get(type);
    return handlers ? handlers.size : 0;
  }

  /**
   * Check if there are any handlers for an event type
   * @param type Event type
   * @returns True if there are handlers
   */
  public hasHandlers(type: ProviderEventType): boolean {
    return this.handlerCount(type) > 0;
  }

  /**
   * Get all registered event types
   * @returns Array of event types
   */
  public getEventTypes(): ProviderEventType[] {
    return Array.from(this.handlers.keys()) as ProviderEventType[];
  }
}

/**
 * Create a new event bus instance
 * @returns Provider event bus
 */
export function createEventBus(): ProviderEventBus {
  return new ProviderEventBus();
}

/**
 * Event bus singleton instance
 */
export const globalEventBus = createEventBus();
