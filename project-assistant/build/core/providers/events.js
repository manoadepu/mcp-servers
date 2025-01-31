"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalEventBus = exports.ProviderEventBus = void 0;
exports.createEventBus = createEventBus;
const eventemitter3_1 = require("eventemitter3");
/**
 * Provider event bus implementation
 */
class ProviderEventBus {
    emitter;
    handlers;
    constructor() {
        this.emitter = new eventemitter3_1.EventEmitter();
        this.handlers = new Map();
    }
    /**
     * Subscribe to provider events
     * @param type Event type to subscribe to
     * @param handler Event handler function
     * @returns Unsubscribe function
     */
    subscribe(type, handler) {
        // Create handler set if it doesn't exist
        if (!this.handlers.has(type)) {
            this.handlers.set(type, new Set());
        }
        // Add handler to set
        const handlers = this.handlers.get(type);
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
    unsubscribe(type, handler) {
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
    async publish(type, provider, data) {
        const event = {
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
        const promises = Array.from(handlers).map(handler => Promise.resolve(handler(event)).catch(error => {
            console.error('Error in event handler:', error);
        }));
        await Promise.all(promises);
    }
    /**
     * Remove all event handlers
     */
    clear() {
        this.handlers.clear();
        this.emitter.removeAllListeners();
    }
    /**
     * Get number of handlers for an event type
     * @param type Event type
     * @returns Number of handlers
     */
    handlerCount(type) {
        const handlers = this.handlers.get(type);
        return handlers ? handlers.size : 0;
    }
    /**
     * Check if there are any handlers for an event type
     * @param type Event type
     * @returns True if there are handlers
     */
    hasHandlers(type) {
        return this.handlerCount(type) > 0;
    }
    /**
     * Get all registered event types
     * @returns Array of event types
     */
    getEventTypes() {
        return Array.from(this.handlers.keys());
    }
}
exports.ProviderEventBus = ProviderEventBus;
/**
 * Create a new event bus instance
 * @returns Provider event bus
 */
function createEventBus() {
    return new ProviderEventBus();
}
/**
 * Event bus singleton instance
 */
exports.globalEventBus = createEventBus();
//# sourceMappingURL=events.js.map