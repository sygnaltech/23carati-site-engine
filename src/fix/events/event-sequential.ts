/**
 * FIX - Functional Interactions
 * Sequential Event Handler - invokes actions one at a time, waiting for each to complete
 */

import { EventBase } from '../event-base';
import type { TriggerData } from '../trigger-base';

/**
 * Sequential event handler that invokes actions one by one
 * Waits for each action to complete before starting the next
 * Useful for playlists, animations, or coordinated sequences
 */
export class EventSequential extends EventBase {
  /**
   * Invoke the event - triggers all registered actions sequentially
   * @param triggerElement The element that triggered this event
   * @param triggerData The data object from the trigger
   */
  async invoke(triggerElement: HTMLElement, triggerData: TriggerData): Promise<void> {
    console.log(`[FIX Event:Sequential] Event "${this.eventName}" invoked with data:`, triggerData);

    if (this.actions.length === 0) {
      console.warn(`[FIX Event:Sequential] Event "${this.eventName}" has no registered actions`);
      return;
    }

    console.log(`[FIX Event:Sequential] Running ${this.actions.length} action(s) sequentially`);

    // Invoke each registered action sequentially, waiting for each to complete
    for (let i = 0; i < this.actions.length; i++) {
      const action = this.actions[i];
      console.log(`[FIX Event:Sequential] Triggering action ${i + 1}/${this.actions.length}`);

      try {
        await action.trigger(triggerElement, triggerData);
        console.log(`[FIX Event:Sequential] Action ${i + 1}/${this.actions.length} completed`);
      } catch (error) {
        console.error(`[FIX Event:Sequential] Action ${i + 1} failed:`, error);
        // Continue to next action even if one fails
      }
    }

    console.log(`[FIX Event:Sequential] All actions completed`);
  }
}
