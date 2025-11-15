/**
 * Page | Dashboard Overview
 * For dashboard overview page at /wholesale/dashboard/overview
 * Handles image uploads and deletions for listings
 */

import { IModule, page, PageBase } from "@sygnal/sse-core";
import { WebflowForm, FormState } from "../elements/webflow-form";
import { config, api } from "../config";
import { LoaderOverlayComponent } from "../components/loader-overlay";

@page("/wholesale/dashboard/overview")
export class ListingPage extends PageBase {

  protected onPrepare(): void {
  } 

  protected async onLoad(): Promise<void> {
    console.log("Listings page exec");

    // Scan for all <a> elements with sse-listing-edit attribute
    const editLinks = document.querySelectorAll<HTMLAnchorElement>('a[sse-listing-edit]');

    editLinks.forEach((link) => {
      const slug = link.getAttribute('sse-listing-edit');

      if (slug) {
        // Set up click handler to navigate to edit path
        link.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = `/wholesale/pietre/${slug}?mode=edit`;
        });
      }
    });

    // Scan for all delete listing buttons
    const deleteButtons = document.querySelectorAll<HTMLAnchorElement>('a[sse-action-delete-listing]');
    console.log(`[Overview] Found ${deleteButtons.length} delete listing button(s)`);

    deleteButtons.forEach((button) => {
      const listingSlug = button.getAttribute('sse-listing-slug');

      if (listingSlug) {
        console.log(`[Overview] Registered delete button for listing: ${listingSlug}`);

        button.addEventListener('click', async (e) => {
          e.preventDefault();
          await this.handleDeleteListing(listingSlug);
        });
      } else {
        console.warn('[Overview] Delete button found without sse-listing-slug attribute:', button);
      }
    });

    // Scan for all status change buttons
    const statusButtons = document.querySelectorAll<HTMLAnchorElement>('a[sse-action-set-listing-status]');
    console.log(`[Overview] Found ${statusButtons.length} status change button(s)`);

    statusButtons.forEach((button) => {
      const listingSlug = button.getAttribute('sse-listing-slug');
      const statusId = button.getAttribute('sse-action-set-listing-status');

      if (listingSlug && statusId) {
        console.log(`[Overview] Registered status button for listing: ${listingSlug}, status: ${statusId}`);

        button.addEventListener('click', async (e) => {
          e.preventDefault();
          await this.handleSetListingStatus(listingSlug, statusId);
        });
      } else {
        console.warn('[Overview] Status button missing required attributes:', {
          slug: listingSlug,
          status: statusId,
          element: button
        });
      }
    });
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

      const response = await fetch(deleteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: listingSlug
        })
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

// <input type="text" name="memberstackId" value="mem-cmh36kq9w001e0svqbmggf3tf" />
// <input type="text" name="listingId" value="item-1" />
// <input type="text" name="photoIndex" value="0" />
