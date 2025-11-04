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
  }

  async exec(): Promise<void> {
    console.log("Listings page exec");
  }
}

// <input type="text" name="memberstackId" value="mem-cmh36kq9w001e0svqbmggf3tf" />
// <input type="text" name="listingId" value="item-1" />
// <input type="text" name="photoIndex" value="0" />
