/**
 * FIX - Functional Interactions
 * Set Status Action Handler
 */

import { LoaderOverlayComponent } from '../../components/loader-overlay';
import { ActionBase } from '../action-base';
import { action } from '../registry';
import type { TriggerData } from '../trigger-base';
import { config, api } from "../../config";

/**
 * Action handler that sets the status of a listing via API call
 * Attribute: action:set-status="event-name"
 */
@action('set-status')
export class ActionSetStatus extends ActionBase {
  /**
   * Initialize the action
   */
  init(): void {
    console.log(`[FIX Action:Set-Status] Initializing action`);
  }

  /**
   * Trigger the action - perform a click on the element
   * @param triggerElement The element that triggered the event
   * @param triggerData The data object from the trigger
   */
  async trigger(triggerElement: HTMLElement, triggerData: TriggerData): Promise<void> {
    console.log(`[FIX Action:Set-Status] Triggering action`, { triggerData });


      const listingSlug = triggerData["slug"];
      const statusId = triggerData["status-id"];

      if (listingSlug && statusId) {

          await this.handleSetListingStatus(listingSlug, statusId);
      } else {
        console.warn('[Overview] Set Status action missing required data:', {
          slug: listingSlug,
          status: statusId,
          element: triggerElement
        });
      }



  }


  /**
   * Handles setting the status of a listing
   * @param listingSlug The slug of the listing
   * @param statusId The status option ID to set
   */
  private async handleSetListingStatus(listingSlug: string, statusId: string): Promise<void> {
    console.log('[Overview] Setting listing status:', { listingSlug, statusId });

    // Get the loader overlay component and show default message
    const [loaderOverlay] = window.componentManager?.getComponentsByType<LoaderOverlayComponent>('loader-overlay') ?? [];
    if (loaderOverlay) {
      loaderOverlay.show('');
    }

    try {
      const statusEndpoint = api.url('/forms/listing-set-status');
      console.log('[Overview] Status endpoint:', statusEndpoint);

      const response = await fetch(statusEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: listingSlug,
          status: statusId
        })
      });

      if (response.ok) {
        console.log('[Overview] Listing status updated successfully');
        // Refresh the page to show updated listing table
        window.location.reload();
      } else {
        const errorText = await response.text();
        console.error('[Overview] Status update failed:', response.status, errorText);

        // Hide loader on error
        if (loaderOverlay) {
          loaderOverlay.hide();
        }

        alert(`Failed to update listing status: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('[Overview] Error updating listing status:', error);

      // Hide loader on error
      if (loaderOverlay) {
        loaderOverlay.hide();
      }

      alert(`Error updating listing status: ${error}`);
    }
  }


}
