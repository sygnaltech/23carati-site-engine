/**
 * FIX - Functional Interactions
 * Base class for all Trigger handlers
 */

import { EventRegistry } from './event-registry';

export interface TriggerData {
  [key: string]: string;
}

/**
 * Abstract base class for all trigger handlers
 */
export abstract class TriggerBase {
  protected element: HTMLElement;
  protected eventName: string;
  protected attributeName: string;

  /**
   * @param element The element this trigger is attached to
   * @param eventName The name of the event to invoke
   * @param attributeName The full attribute name (e.g., "trigger:click")
   */
  constructor(element: HTMLElement, eventName: string, attributeName: string) {
    this.element = element;
    this.eventName = eventName;
    this.attributeName = attributeName;
  }

  /**
   * Initialize the trigger (e.g., attach event listeners)
   * Must be implemented by subclasses
   */
  abstract init(): void;

  /**
   * Invoke the trigger - collects data and fires the event
   */
  protected invoke(): void {
    console.log(`[FIX Trigger] Invoking trigger ${this.attributeName} for event: ${this.eventName}`);

    // Compose trigger data object from data attributes
    const triggerData = this.composeTriggerData();

    // Get the event from the registry and invoke it
    const event = EventRegistry.getEvent(this.eventName);
    if (event) {
      event.invoke(this.element, triggerData);
    } else {
      console.warn(`[FIX Trigger] Event not found in registry: ${this.eventName}`);
    }
  }

  /**
   * Compose the trigger data object from element attributes
   * Looks for attributes like trigger:click:data:slug="value"
   */
  protected composeTriggerData(): TriggerData {
    const data: TriggerData = {};
    const dataPrefix = `${this.attributeName}:data:`;

    // Iterate through all attributes on the element
    Array.from(this.element.attributes).forEach((attr) => {
      if (attr.name.startsWith(dataPrefix)) {
        // Extract the data key name
        const dataKey = attr.name.substring(dataPrefix.length);
        data[dataKey] = attr.value;
      }
    });

    console.log(`[FIX Trigger] Composed data:`, data);
    return data;
  }
}
