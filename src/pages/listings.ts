/**
 * Page | Listing
 * Handles all /listings/* routes with wildcard matching
 */

import { IModule, page } from "@sygnal/sse";

@page("/listings/*")
export class ListingPage implements IModule {
  domain: string | null = null;
  pageId: string | null = null;
  siteId: string | null = null;
  lang: string | null = null;
  collectionId: string | null = null;
  itemSlug: string | null = null;

  constructor() {}

  setup(): void {
    // Extract key information from <html> node
    const htmlElement = document.documentElement;

    this.domain = htmlElement.getAttribute("data-wf-domain");
    this.pageId = htmlElement.getAttribute("data-wf-page");
    this.siteId = htmlElement.getAttribute("data-wf-site");
    this.lang = htmlElement.getAttribute("lang");
    this.collectionId = htmlElement.getAttribute("data-wf-collection");
    this.itemSlug = htmlElement.getAttribute("data-wf-item-slug");

    console.log("ListingPage setup:");
    console.log(" Domain:", this.domain);
    console.log(" Page ID:", this.pageId);
    console.log(" Site ID:", this.siteId);
    console.log(" Language:", this.lang);
    console.log(" Collection ID:", this.collectionId);
    console.log(" Item Slug:", this.itemSlug);
  }

  getCollectionListItemIndex(element: Element): number {
    // Find the nearest parent with w-dyn-item class
    const dynItem = element.closest(".w-dyn-item");

    if (dynItem && dynItem.parentElement) {
      // Get all w-dyn-item siblings within the same parent
      const siblings = Array.from(
        dynItem.parentElement.querySelectorAll(".w-dyn-item")
      );

      // Find the zero-based index of this item
      const index = siblings.indexOf(dynItem as Element);
      console.log("Found collection item index:", index, "for element:", element);
      return index;
    }

    console.log("No collection item found for element:", element);
    return -1;
  }

  async exec(): Promise<void> {
    console.log("Listings page exec");

    // Find all buttons with class w-button
    const buttons = document.querySelectorAll(".w-button");
    console.log("Found buttons:", buttons.length);

    buttons.forEach((button) => {
      const itemIndex = this.getCollectionListItemIndex(button);

button.setAttribute("item-slug", this.itemSlug || "");

      if (itemIndex !== -1) {
        // Set the itemIndex attribute on the button
        button.setAttribute("item-index", itemIndex.toString());
        console.log("Set itemIndex attribute:", itemIndex, "on button:", button);
      }
    });

    console.log("Listings page exec complete");
  }
}

// <input type="text" name="memberstackId" value="mem-cmh36kq9w001e0svqbmggf3tf" />
// <input type="text" name="listingId" value="item-1" />
// <input type="text" name="photoIndex" value="0" />
