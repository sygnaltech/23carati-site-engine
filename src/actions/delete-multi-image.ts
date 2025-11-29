/**
 * FIX - Functional Interactions
 * Delete Multi-Image Action Handler
 */

import { LoaderOverlayComponent } from '../components/loader-overlay';
import { ActionBase, action, type TriggerData } from '@sygnal/sse-core';
import { api } from "../config";
import { apiRequest } from '../utils/api-client';

/**
 * Action handler that deletes a multi-image from a listing
 */
@action('delete-multi-image')
export class ActionDeleteMultiImage extends ActionBase {
  /**
   * Initialize the action
   */
  init(): void {
    console.log(`[FIX Action:DeleteMultiImage] Initializing action`);
  }

  /**
   * Trigger the action - delete the multi-image
   * @param triggerElement The element that triggered the event
   * @param triggerData The data object from the trigger
   */
  async trigger(triggerElement: HTMLElement, triggerData: TriggerData): Promise<void> {
    console.log(`[FIX Action:DeleteMultiImage] Triggering action`, { triggerData });

    const listingId = triggerData["listing-id"];
    const photoIndex = triggerData["photo-index"];

    if (listingId && photoIndex) {
      await this.handleDeleteMultiImage(listingId, photoIndex);
    } else {
      console.warn('[FIX Action:DeleteMultiImage] Missing required data:', {
        listingId,
        photoIndex,
        element: triggerElement
      });
    }
  }

  /**
   * Handles deleting a multi-image from a listing
   * @param listingId The listing ID
   * @param photoIndex The photo index to delete
   */
  private async handleDeleteMultiImage(listingId: string, photoIndex: string): Promise<void> {
    console.log('[FIX Action:DeleteMultiImage] Deleting image:', { listingId, photoIndex });

    // Get the loader overlay component and show it
    const [loaderOverlay] = window.componentManager?.getComponentsByType<LoaderOverlayComponent>('loader-overlay') ?? [];
    if (loaderOverlay) {
      loaderOverlay.show('deleting-image');
    }

    try {
      const deleteEndpoint = api.endpoints.deleteMultiImage;
      console.log('[FIX Action:DeleteMultiImage] Endpoint:', deleteEndpoint);

      const response = await apiRequest(deleteEndpoint, {
        method: 'POST',
        useAuth: true,
        body: {
          listingId: listingId,
          photoIndex: parseInt(photoIndex)
        }
      });

      if (response.ok) {
        console.log('[FIX Action:DeleteMultiImage] Image deleted successfully');
        // Refresh the page to show updated images
        window.location.reload();
      } else {
        const errorText = await response.text();
        console.error('[FIX Action:DeleteMultiImage] Deletion failed:', response.status, errorText);

        // Hide loader on error
        if (loaderOverlay) {
          loaderOverlay.hide();
        }

        alert(`Failed to delete image: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('[FIX Action:DeleteMultiImage] Error deleting image:', error);

      // Hide loader on error
      if (loaderOverlay) {
        loaderOverlay.hide();
      }

      alert(`Error deleting image: ${error}`);
    }
  }
}
