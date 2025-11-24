/**
 * FIX - Functional Interactions
 * Submit Trigger Handler
 */

import { trigger, TriggerBase, type TriggerData } from '@sygnal/sse-core';

export type FormValue = string | string[];

// Note: TriggerData index signature is string -> string; we widen via assertion when returning.
export type SubmitTriggerData = TriggerData & {
  fields: Record<string, FormValue>;
  headers?: Record<string, string>;
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
   * Extend base data with serialized form fields and headers.
   */
  protected composeTriggerData(): SubmitTriggerData {
    const base = super.composeTriggerData() as Record<string, string>;
    const fields: Record<string, FormValue> = {};
    const headers: Record<string, string> = {};

    if (this.element instanceof HTMLFormElement) {
      // Collect form fields
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

      // Collect headers from trigger:submit:header:* attributes
      const attrs = this.element.attributes;
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        if (attr.name.startsWith('trigger:submit:header:')) {
          const headerName = attr.name.replace('trigger:submit:header:', '');
          headers[headerName] = attr.value;
          console.log(`[FIX Trigger:Submit] Collected header: ${headerName}`);
        }
      }
    }

    return {
      ...base,
      fields,
      headers: Object.keys(headers).length > 0 ? headers : undefined
    } as unknown as SubmitTriggerData;
  }
}
