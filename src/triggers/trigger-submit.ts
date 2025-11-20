/**
 * FIX - Functional Interactions
 * Submit Trigger Handler
 */

import { trigger, TriggerBase, type TriggerData } from '@sygnal/sse-core';

export type FormValue = string | string[];

// Note: TriggerData index signature is string -> string; we widen via assertion when returning.
export type SubmitTriggerData = TriggerData & {
  fields: Record<string, FormValue>;
};

/**
 * Trigger handler for form submit events
 * Attribute: trigger:submit="event-name"
 * Serializes form fields (excluding File inputs) into triggerData.fields for actions.
 */
@trigger('submit')
export class TriggerSubmit extends TriggerBase {
  /**
   * Initialize the submit trigger - attach submit event listener
   */
  init(): void {
    if (!(this.element instanceof HTMLFormElement)) {
      console.error(`[FIX Trigger:Submit] trigger:submit must be on a <form>. Found: ${this.element.tagName}`);
      return;
    }

    console.log(`[FIX Trigger:Submit] Initializing submit trigger for event: ${this.eventName}`);

    this.element.addEventListener('submit', (e) => {
      e.preventDefault();
      this.invoke();
    });
  }

  /**
   * Extend base data with serialized form fields.
   */
  protected composeTriggerData(): SubmitTriggerData {
    const base = super.composeTriggerData() as Record<string, string>;
    const fields: Record<string, FormValue> = {};

    if (this.element instanceof HTMLFormElement) {
      const formData = new FormData(this.element);
      for (const [key, value] of formData.entries()) {
        // Skip files for this trigger
        if (value instanceof File) {
          console.warn(`[FIX Trigger:Submit] Skipping File input "${key}" (not serialized)`);
          continue;
        }

        // Collect multiple values under the same key
        const existing = fields[key];
        if (existing === undefined) {
          fields[key] = value;
        } else if (Array.isArray(existing)) {
          existing.push(value);
        } else {
          fields[key] = [existing, value];
        }
      }
    }

    return {
      ...base,
      fields
    } as unknown as SubmitTriggerData;
  }
}
