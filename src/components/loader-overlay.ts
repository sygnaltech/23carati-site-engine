/**
 * Component | Loader Overlay
 * Displays a modal overlay with loading messages using a switch mechanism
 */

import { ComponentBase, component } from '@sygnal/sse-core';
import { Switch } from '../utils/switch';

@component('loader-overlay')
export class LoaderOverlayComponent extends ComponentBase {
  private messageSwitch: Switch | null = null;

  protected onPrepare(): void {
  }

  show(mode: string): void {
    console.log('[LoaderOverlay] show() called with mode:', mode);

    // Set the switch to the appropriate message based on mode
    if (this.messageSwitch) {
      this.messageSwitch.set(mode);
    }

    // Trigger the Webflow IX animation to show the overlay
    const ixTrigger = this.element.querySelector<HTMLElement>('[trigger="show"]');

    if (ixTrigger) {
      console.log('[LoaderOverlay] Clicking trigger=show element');
      ixTrigger.click(); 
    } else {
      console.warn('[LoaderOverlay] Element with trigger="show" not found');
    }
  }

  hide(): void {
    console.log('[LoaderOverlay] hide() called');

    // Trigger the Webflow IX animation to hide the overlay
    const ixTrigger = this.element.querySelector<HTMLElement>('[trigger="hide"]');

    if (ixTrigger) {
      console.log('[LoaderOverlay] Clicking trigger=hide element');
      ixTrigger.click();
    } else {
      console.warn('[LoaderOverlay] Element with trigger="hide" not found');
    }
  }

  protected async onLoad(): Promise<void> {
    // Initialize the switch for loader messages
    const switchElement = this.element.querySelector<HTMLElement>('[sse-switch]');

    if (switchElement) {
      this.messageSwitch = new Switch(switchElement);
      console.log('[LoaderOverlay] Message switch initialized');
    } else {
      console.warn('[LoaderOverlay] Switch element not found');
    }

    console.log('[LoaderOverlay] Component loaded');
  }
}
