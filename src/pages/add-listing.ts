/**
 * Page | Listing
 * Handles all /listings/* routes with wildcard matching
 */

import { page, PageBase } from "@sygnal/sse-core";
import { WebflowForm, FormState } from "../elements/webflow-form";
import { config, api } from "../config";

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


    
    console.log("Listings page exec complete"); 
  }

}


// <input type="text" name="memberstackId" value="mem-cmh36kq9w001e0svqbmggf3tf" />
// <input type="text" name="listingId" value="item-1" />
// <input type="text" name="photoIndex" value="0" />
