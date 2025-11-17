/**
 * FIX - Functional Interactions
 * Click Action Handler
 */

import { ActionBase } from '../action-base';
import { action } from '../registry';
import type { TriggerData } from '../trigger-base';

/**
 * Action handler that performs a click on the tagged element
 * Attribute: action:click="event-name"
 */
@action('click')
export class ActionClick extends ActionBase {
  /**
   * Initialize the action
   */
  init(): void {
    console.log(`[FIX Action:Click] Initializing click action on element:`, this.element);
  }

  /**
   * Trigger the action - perform a click on the element
   * @param triggerElement The element that triggered the event
   * @param triggerData The data object from the trigger
   */
  trigger(triggerElement: HTMLElement, triggerData: TriggerData): void {
    console.log(`[FIX Action:Click] Triggering click action`, { triggerData });

    if (this.element) {
      console.log(`[FIX Action:Click] Clicking element:`, this.element);
      this.element.click();
    } else {
      console.warn(`[FIX Action:Click] No element to click`);
    }
  }
}
