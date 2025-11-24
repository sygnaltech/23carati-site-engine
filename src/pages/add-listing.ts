/**
 * Page | Listing
 * Handles all /listings/* routes with wildcard matching
 */

import { page, PageBase } from "@sygnal/sse-core";
import { config } from "../config";
import { getCurrentMemberToken } from "../utils/memberstack";

export enum PageMode {
  View = 'view',
  Edit = 'edit'
}

@page("/wholesale/dashboard/add-product")
export class AddListingPage extends PageBase {
  mode: PageMode = PageMode.View;

  protected onPrepare(): void {
    console.log('Page ID:', this.pageInfo.pageId);

  }

  protected async onLoad(): Promise<void> {
    console.log("Add Listing page exec");

    // Find all forms with trigger:submit attribute
    const forms = document.querySelectorAll('[trigger\\:submit]');
    console.log(`[AddListing] Found ${forms.length} form(s) with trigger:submit`);

    // Get JWT token from Memberstack
    const token = await getCurrentMemberToken();

    if (token && config.apiRequiresAuth) {
      console.log('[AddListing] Injecting authentication header into forms');
      forms.forEach(form => {
        // Add header attribute: trigger:submit:header:authorization
        form.setAttribute('trigger:submit:header:authorization', `Bearer ${token}`);
        console.log('[AddListing] Added auth header to form:', form.getAttribute('trigger:submit'));
      });
    } else if (!token && config.apiRequiresAuth) {
      console.warn('[AddListing] API requires auth but no token available');
    } else {
      console.log('[AddListing] API does not require auth, skipping header injection');
    }

    console.log("Add Listing page exec complete");
  }

}


// <input type="text" name="memberstackId" value="mem-cmh36kq9w001e0svqbmggf3tf" />
// <input type="text" name="listingId" value="item-1" />
// <input type="text" name="photoIndex" value="0" />
