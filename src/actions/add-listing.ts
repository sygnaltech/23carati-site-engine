/**
 * FIX - Functional Interactions
 * Add Listing Action Handler
 */

import { ActionBase, action, type TriggerData } from '@sygnal/sse-core';
import { WebflowForm, FormState } from '../elements/webflow-form';
import { config, api } from '../config';
import type { SubmitTriggerData } from '../triggers/trigger-submit';

/**
 * Action handler that submits listing data and redirects to edit page
 * Attribute: action:add-listing="event-name"
 */
@action('add-listing')
export class ActionAddListing extends ActionBase {
  init(): void {
    console.log('[FIX Action:Add-Listing] Initializing action');
  }

  async trigger(triggerElement: HTMLElement, triggerData: TriggerData): Promise<void> {
    console.log('[FIX Action:Add-Listing] Triggering action', { triggerData });

    if (!(triggerElement instanceof HTMLFormElement)) {
      console.error('[FIX Action:Add-Listing] Expected triggerElement to be a form');
      return;
    }

    const data = triggerData as SubmitTriggerData;
    const fields = data.fields ?? {};

    // Build FormData from serialized fields (ignoring files by design)
    const formData = new FormData();
    for (const key of Object.keys(fields)) {
      const value = fields[key];
      if (Array.isArray(value)) {
        value.forEach(v => formData.append(key, v));
      } else {
        formData.append(key, value as string);
      }
    }

    // Ensure memberstackId is present
    if (!formData.has('memberstackId')) {
      formData.append('memberstackId', config.memberstackId);
    }

    const endpoint = api.url('/forms/create-listing');
    console.log('[FIX Action:Add-Listing] Submitting to endpoint:', endpoint);

    const webflowForm = new WebflowForm(triggerElement);
    webflowForm.autoMode = false; // Disable auto mode for action-driven forms

    try {
      const response = await fetch(endpoint, { method: 'POST', body: formData });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[FIX Action:Add-Listing] Submission failed:', response.status, errorText);
        if (webflowForm.isAutoMode()) webflowForm.setState(FormState.Error);
        return;
      }

      const json = await response.json();
      const slug = json?.slug as string | undefined;

      if (webflowForm.isAutoMode()) {
        webflowForm.setState(FormState.Success);
      }

      if (slug) {
        console.log('[FIX Action:Add-Listing] Redirecting with slug:', slug);
        const redirectUrl = `/wholesale/pietre/${slug}?mode=edit`;
        setTimeout(() => { window.location.href = redirectUrl; }, webflowForm.isAutoMode() ? 1500 : 0);
      } else {
        console.warn('[FIX Action:Add-Listing] No slug returned; reloading page');
        setTimeout(() => { window.location.reload(); }, webflowForm.isAutoMode() ? 1500 : 0);
      }
    } catch (error) {
      console.error('[FIX Action:Add-Listing] Error submitting listing:', error);
      if (webflowForm.isAutoMode()) {
        webflowForm.setState(FormState.Error);
      }
    }
  }
}
