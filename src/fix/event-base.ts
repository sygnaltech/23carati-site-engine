/**
 * FIX - Functional Interactions
 * Base class for all Event handlers
 */

import type { ActionBase } from './action-base';
import type { TriggerData } from './trigger-base';

/**
 * Abstract base class for all event handlers
 */
export abstract class EventBase {
  protected eventName: string;
  protected actions: ActionBase[] = [];

  /**
   * @param eventName The name of this event
   */
  constructor(eventName: string) {
    this.eventName = eventName;
  }

  /**
   * Register an action to be invoked when this event fires
   * @param action The action handler to register
   */
  registerAction(action: ActionBase): void {
    this.actions.push(action);
    console.log(`[FIX Event] Registered action with event: ${this.eventName}`);
  }

  /**
   * Invoke the event - triggers all registered actions
   * @param triggerElement The element that triggered this event
   * @param triggerData The data object from the trigger
   */
  abstract invoke(triggerElement: HTMLElement, triggerData: TriggerData): void;
}
