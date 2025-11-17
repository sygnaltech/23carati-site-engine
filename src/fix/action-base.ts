/**
 * FIX - Functional Interactions
 * Base class for all Action handlers
 */

import type { TriggerData } from './trigger-base';

/**
 * Abstract base class for all action handlers
 */
export abstract class ActionBase {
  protected element: HTMLElement | null;
  protected attributeName: string;

  /**
   * @param element The element this action is attached to (can be null for non-element actions)
   * @param attributeName The full attribute name (e.g., "action:click")
   */
  constructor(element: HTMLElement | null, attributeName: string) {
    this.element = element;
    this.attributeName = attributeName;
  }

  /**
   * Initialize the action (perform any setup)
   * Must be implemented by subclasses
   */
  abstract init(): void;

  /**
   * Trigger the action - perform the action's behavior
   * @param triggerElement The element that triggered the event
   * @param triggerData The data object from the trigger
   */
  abstract trigger(triggerElement: HTMLElement, triggerData: TriggerData): void;
}
