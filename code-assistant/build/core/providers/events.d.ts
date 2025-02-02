import { ProviderEventType, ProviderEventHandler, ProviderInfo } from './types';
/**
 * Provider event bus implementation
 */
export declare class ProviderEventBus {
    private emitter;
    private handlers;
    constructor();
    /**
     * Subscribe to provider events
     * @param type Event type to subscribe to
     * @param handler Event handler function
     * @returns Unsubscribe function
     */
    subscribe<T = any>(type: ProviderEventType, handler: ProviderEventHandler<T>): () => void;
    /**
     * Unsubscribe from provider events
     * @param type Event type to unsubscribe from
     * @param handler Event handler to remove
     */
    unsubscribe<T = any>(type: ProviderEventType, handler: ProviderEventHandler<T>): void;
    /**
     * Publish a provider event
     * @param type Event type
     * @param provider Provider info
     * @param data Event data
     */
    publish<T = any>(type: ProviderEventType, provider: ProviderInfo, data: T): Promise<void>;
    /**
     * Remove all event handlers
     */
    clear(): void;
    /**
     * Get number of handlers for an event type
     * @param type Event type
     * @returns Number of handlers
     */
    handlerCount(type: ProviderEventType): number;
    /**
     * Check if there are any handlers for an event type
     * @param type Event type
     * @returns True if there are handlers
     */
    hasHandlers(type: ProviderEventType): boolean;
    /**
     * Get all registered event types
     * @returns Array of event types
     */
    getEventTypes(): ProviderEventType[];
}
/**
 * Create a new event bus instance
 * @returns Provider event bus
 */
export declare function createEventBus(): ProviderEventBus;
/**
 * Event bus singleton instance
 */
export declare const globalEventBus: ProviderEventBus;
