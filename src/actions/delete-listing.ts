/**
 * FIX - Functional Interactions
 * Delete Listing Action Handler
 */

import { LoaderOverlayComponent } from '../components/loader-overlay';
import { ActionBase, action, type TriggerData } from '@sygnal/sse-core';
import { api } from "../config";
import { apiRequest } from '../utils/api-client';

/**
 * Action handler that deletes a listing via API call
 * Attribute: action:delete-listing="event-name"
 */
@action('delete-listing')
export class ActionDeleteListing extends ActionBase {
  /**
   * Initialize the action
   */
  init(): void {
    console.log(`[FIX Action:Delete-Listing] Initializing action`);
  }

  /**
   * Trigger the action - perform a click on the element
   * @param triggerElement The element that triggered the event
   * @param triggerData The data object from the trigger
   */
  async trigger(triggerElement: HTMLElement, triggerData: TriggerData): Promise<void> {
    console.log(`[FIX Action:Delete-Listing] Triggering action`, { triggerData });


      const listingSlug = triggerData["slug"];
//      const statusId = triggerData["status-id"];

      if (listingSlug) {

          await this.handleDeleteListing(listingSlug);

      } else {
        console.warn('[Overview] Delete Listing action missing required data:', {
          slug: listingSlug,
          element: triggerElement
        });
      }



  }


  /**
   * Handles deletion of a listing
   * @param listingSlug The slug of the listing to delete
   */
  private async handleDeleteListing(listingSlug: string): Promise<void> {
    console.log('[Overview] Deleting listing:', listingSlug);

    // Confirm deletion
    const confirmed = confirm(`Are you sure you want to delete listing "${listingSlug}"? This action cannot be undone.`);
    if (!confirmed) {
      console.log('[Overview] Deletion cancelled by user');
      return;
    }

    // Get the loader overlay component and show "deleting-listing" message
    const [loaderOverlay] = window.componentManager?.getComponentsByType<LoaderOverlayComponent>('loader-overlay') ?? [];
    if (loaderOverlay) {
      loaderOverlay.show('deleting-listing');
    }

    try {
      const deleteEndpoint = api.url('/forms/delete-listing');
      console.log('[Overview] Delete endpoint:', deleteEndpoint);

      const response = await apiRequest(deleteEndpoint, {
        method: 'POST',
        useAuth: true,
        body: {
          listingId: listingSlug
        }
      });

      if (response.ok) {
        console.log('[Overview] Listing deleted successfully');
        // Refresh the page to show updated listing table
        window.location.reload();
      } else {
        const errorText = await response.text();
        console.error('[Overview] Delete failed:', response.status, errorText);

        // Hide loader on error
        if (loaderOverlay) {
          loaderOverlay.hide();
        }

        alert(`Failed to delete listing: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('[Overview] Error deleting listing:', error);

      // Hide loader on error
      if (loaderOverlay) {
        loaderOverlay.hide();
      }

      alert(`Error deleting listing: ${error}`);
    }
  }


}
