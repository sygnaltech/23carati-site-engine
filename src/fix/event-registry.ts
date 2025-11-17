/**
 * FIX - Functional Interactions
 * Event Registry - manages all events in the system
 */

import type { EventBase } from './event-base';

/**
 * Global registry for FIX events
 */
export class EventRegistry {
  private static events: Map<string, EventBase> = new Map();

  /**
   * Register an event in the registry
   * @param eventName The name of the event
   * @param event The event handler instance
   */
  static registerEvent(eventName: string, event: EventBase): void {
    this.events.set(eventName, event);
    console.log(`[FIX Registry] Event registered: ${eventName}`);
  }

  /**
   * Get an event from the registry
   * @param eventName The name of the event to retrieve
   * @returns The event handler, or undefined if not found
   */
  static getEvent(eventName: string): EventBase | undefined {
    return this.events.get(eventName);
  }

  /**
   * Check if an event exists in the registry
   * @param eventName The name of the event to check
   * @returns True if the event exists
   */
  static hasEvent(eventName: string): boolean {
    return this.events.has(eventName);
  }

  /**
   * Get all registered event names
   * @returns Array of event names
   */
  static getEventNames(): string[] {
    return Array.from(this.events.keys());
  }

  /**
   * Clear all events from the registry
   */
  static clear(): void {
    this.events.clear();
    console.log('[FIX Registry] All events cleared');
  }
}
