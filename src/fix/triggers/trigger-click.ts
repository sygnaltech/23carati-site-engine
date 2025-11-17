/**
 * FIX - Functional Interactions
 * Click Trigger Handler
 */

import { TriggerBase } from '../trigger-base';
import { trigger } from '../registry';

/**
 * Trigger handler for click events
 * Attribute: trigger:click="event-name"
 */
@trigger('click')
export class TriggerClick extends TriggerBase {
  /**
   * Initialize the click trigger - attach click event listener
   */
  init(): void {
    console.log(`[FIX Trigger:Click] Initializing click trigger for event: ${this.eventName}`);

    this.element.addEventListener('click', (e) => {
      e.preventDefault();
      this.invoke();
    });
  }
}
