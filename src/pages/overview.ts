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

  }

}

// <input type="text" name="memberstackId" value="mem-cmh36kq9w001e0svqbmggf3tf" />
// <input type="text" name="listingId" value="item-1" />
// <input type="text" name="photoIndex" value="0" />
