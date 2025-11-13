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

    // Instantiate and handle form submission for #add-listing 
    const updateDataForm = document.querySelector("#add-listing");
    if (updateDataForm) {
      console.log('[Listings] Found #add-listing form. Mounting handler...');
      const webflowForm = new WebflowForm(updateDataForm as HTMLElement);
      const form = webflowForm.getForm();

      // Add hidden inputs for memberstackId and listingId
      const memberstackIdInput = document.createElement("input");
      memberstackIdInput.type = "hidden";
      memberstackIdInput.name = "memberstackId";
      memberstackIdInput.value = config.memberstackId;
      form.appendChild(memberstackIdInput);

      console.log("Added hidden inputs to update-data form:");
      console.log(" memberstackId:", memberstackIdInput.value);

      // Resolve endpoint and log
      const updateEndpoint = api.url('/forms/create-listing');
      console.log('[Listings] Create listing endpoint:', updateEndpoint);

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("Update data form submitted");

        const formData = new FormData(form);

        try {
          const response = await fetch(updateEndpoint, {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            console.log("Add listing successful");

            // Parse response to get the slug
            const data = await response.json();
            const slug = data.slug;

            if (slug) {
              console.log("Redirecting to edit page with slug:", slug);
              if (webflowForm.isAutoMode()) {
                webflowForm.setState(FormState.Success);
                // Redirect after a short delay to show success message
                setTimeout(() => {
                  window.location.href = `/wholesale/pietre/${slug}?mode=edit`;
                }, 1500);
              } else {
                // In manual mode, redirect immediately without delay
                window.location.href = `/wholesale/pietre/${slug}?mode=edit`;
              }
            } else {
              console.warn("No slug returned in response, reloading page instead");
              if (webflowForm.isAutoMode()) {
                webflowForm.setState(FormState.Success);
                setTimeout(() => {
                  window.location.reload();
                }, 1500);
              } else {
                window.location.reload();
              }
            }
          } else {
            const errorText = await response.text();
            console.error("Add listing failed:", response.status, errorText);
            if (webflowForm.isAutoMode()) {
              webflowForm.setState(FormState.Error);
            }
          }
        } catch (error) {
          console.error("Error updating listing:", error);
          if (webflowForm.isAutoMode()) {
            webflowForm.setState(FormState.Error);
          }
        }
      });
    } else {
      console.log('[Listings] #add-listing form not found.');
    }

    console.log("Listings page exec complete");
  }

}


// <input type="text" name="memberstackId" value="mem-cmh36kq9w001e0svqbmggf3tf" />
// <input type="text" name="listingId" value="item-1" />
// <input type="text" name="photoIndex" value="0" />
