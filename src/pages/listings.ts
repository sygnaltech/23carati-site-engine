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

@page("/wholesale/pietre/*")
export class ListingPage extends PageBase {
  mode: PageMode = PageMode.View;

  protected onPrepare(): void {
    console.log('Page ID:', this.pageInfo.pageId);

    // Get mode from query string, default to 'view'
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode')?.toLowerCase();
    this.mode = modeParam === 'edit' ? PageMode.Edit : PageMode.View;
    console.log('[Listings] Mode detection:', { queryParam: modeParam, resolvedMode: this.mode });
    console.log('Page mode:', this.mode);
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

  protected async onLoad(): Promise<void> {
    console.log("Listings page exec");
    console.log('Page mode:', this.mode);

    // Only run the following code in Edit mode
    if (this.mode !== PageMode.Edit) {
      console.log("Not in edit mode, skipping edit-specific logic"); 
      return;
    }

    // Handle mode-based visibility
    console.log("Setting visibility for mode:", this.mode);
    const allModeElements = document.querySelectorAll('[sse-mode]');
    allModeElements.forEach((element) => {
      const modeAttr = element.getAttribute('sse-mode');
      if (modeAttr === this.mode) {
        console.log("Showing element for mode", this.mode, ":", element);
        (element as HTMLElement).style.display = 'block';
      } else {
        console.log("Hiding element for mode", this.mode, ":", element);
        (element as HTMLElement).style.display = 'none'; 
      }
    });

    // Instantiate and handle form submission for #set-image
    const setImageForm = document.querySelector("#set-image");
    if (setImageForm) {
      console.log('[Listings] Found #set-image form. Mounting handler...');
      const webflowForm = new WebflowForm(setImageForm as HTMLElement);
      const form = webflowForm.getForm();

      // Add hidden inputs for memberstackId and listingId
      const memberstackIdInput = document.createElement("input");
      memberstackIdInput.type = "hidden";
      memberstackIdInput.name = "memberstackId";
      memberstackIdInput.value = config.memberstackId;
      form.appendChild(memberstackIdInput);

      const listingIdInput = document.createElement("input");
      listingIdInput.type = "hidden";
      listingIdInput.name = "listingId";
      listingIdInput.value = this.pageInfo.itemSlug || "";
      form.appendChild(listingIdInput);

      console.log("Added hidden inputs to form:");
      console.log(" memberstackId:", memberstackIdInput.value);
      console.log(" listingId:", listingIdInput.value);

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("Set image form submitted");

        const formData = new FormData(form);

        try {
          const response = await fetch(form.action, {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            console.log("Form submission successful");
            if (webflowForm.isAutoMode()) {
              webflowForm.setState(FormState.Success);
              // Refresh page after a short delay to show success message
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            } else {
              // In manual mode, refresh immediately without delay
              window.location.reload();
            }
          } else {
            const errorText = await response.text();
            console.error("Form submission failed:", response.status, errorText);
            if (webflowForm.isAutoMode()) {
              webflowForm.setState(FormState.Error);
            }
          }
        } catch (error) {
          console.error("Error submitting form:", error);
          if (webflowForm.isAutoMode()) {
            webflowForm.setState(FormState.Error);
          }
        }
      });
    }
    if (!setImageForm) {
      console.log('[Listings] #set-image form not found.');
    }

    // Instantiate and handle form submission for #set-certificate
    const setCertificateForm = document.querySelector("#set-certificate");
    if (setCertificateForm) {
      console.log('[Listings] Found #set-certificate form. Mounting handler...');
      const webflowForm = new WebflowForm(setCertificateForm as HTMLElement);
      const form = webflowForm.getForm();

      // Add hidden inputs for memberstackId and listingId
      const memberstackIdInput = document.createElement("input");
      memberstackIdInput.type = "hidden";
      memberstackIdInput.name = "memberstackId";
      memberstackIdInput.value = config.memberstackId;
      form.appendChild(memberstackIdInput);

      const listingIdInput = document.createElement("input");
      listingIdInput.type = "hidden";
      listingIdInput.name = "listingId";
      listingIdInput.value = this.pageInfo.itemSlug || "";
      form.appendChild(listingIdInput);

      console.log("Added hidden inputs to certificate form:");
      console.log(" memberstackId:", memberstackIdInput.value);
      console.log(" listingId:", listingIdInput.value);

      // Resolve endpoint and log for visibility
      const certificateEndpoint = api.url('/forms/upload-file');
      console.log('[Listings] Certificate upload endpoint:', certificateEndpoint);

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("Set certificate form submitted");

        const formData = new FormData(form);

        try {
          const response = await fetch(certificateEndpoint, {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            console.log("Certificate upload successful");
            if (webflowForm.isAutoMode()) {
              webflowForm.setState(FormState.Success);
              // Refresh page after a short delay to show success message
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            } else {
              // In manual mode, refresh immediately without delay
              window.location.reload();
            }
          } else {
            const errorText = await response.text();
            console.error("Certificate upload failed:", response.status, errorText);
            if (webflowForm.isAutoMode()) {
              webflowForm.setState(FormState.Error);
            }
          }
        } catch (error) {
          console.error("Error uploading certificate:", error);
          if (webflowForm.isAutoMode()) {
            webflowForm.setState(FormState.Error);
          }
        }
      });
    }
    if (!setCertificateForm) {
      console.log('[Listings] #set-certificate form not found.');
    }

    // Instantiate and handle form submission for #add-multi-image
    const addMultiImageForm = document.querySelector("#add-multi-image");
    if (addMultiImageForm) {
      console.log('[Listings] Found #add-multi-image form. Mounting handler...');
      const webflowForm = new WebflowForm(addMultiImageForm as HTMLElement);
      const form = webflowForm.getForm();

      // Add hidden inputs for memberstackId and listingId
      const memberstackIdInput = document.createElement("input");
      memberstackIdInput.type = "hidden";
      memberstackIdInput.name = "memberstackId";
      memberstackIdInput.value = config.memberstackId;
      form.appendChild(memberstackIdInput);

      const listingIdInput = document.createElement("input");
      listingIdInput.type = "hidden";
      listingIdInput.name = "listingId";
      listingIdInput.value = this.pageInfo.itemSlug || "";
      form.appendChild(listingIdInput);

      console.log("Added hidden inputs to add-multi-image form:");
      console.log(" memberstackId:", memberstackIdInput.value);
      console.log(" listingId:", listingIdInput.value);

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("Add multi-image form submitted");

        const formData = new FormData(form);

        try {
          const response = await fetch(form.action, {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            console.log("Form submission successful");
            if (webflowForm.isAutoMode()) {
              webflowForm.setState(FormState.Success);
              // Refresh page after a short delay to show success message
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            } else {
              // In manual mode, refresh immediately without delay
              window.location.reload();
            }
          } else {
            const errorText = await response.text();
            console.error("Form submission failed:", response.status, errorText);
            if (webflowForm.isAutoMode()) {
              webflowForm.setState(FormState.Error);
            }
          }
        } catch (error) {
          console.error("Error submitting form:", error);
          if (webflowForm.isAutoMode()) {
            webflowForm.setState(FormState.Error);
          }
        }
      });
    }
    if (!addMultiImageForm) {
      console.log('[Listings] #add-multi-image form not found.');
    }

    // Find all buttons with class w-button
    const buttons = document.querySelectorAll("[sse-action='delete-multi-image']");
    console.log("Found buttons:", buttons.length);

    buttons.forEach((button) => {
      const itemIndex = this.getCollectionListItemIndex(button);

button.setAttribute("item-slug", this.pageInfo.itemSlug || "");

      if (itemIndex !== -1) {
        // Set the itemIndex attribute on the button
        button.setAttribute("item-index", itemIndex.toString());
        console.log("Set itemIndex attribute:", itemIndex, "on button:", button);
      }
    });

    // Handle delete button clicks
    buttons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleDeleteButtonClick(button);
      });
    });

    console.log("Listings page exec complete");
  }

  async handleDeleteButtonClick(button: Element): Promise<void> {
    const memberstackId = config.memberstackId;
    const listingId = button.getAttribute("item-slug") || "";
    const photoIndex = button.getAttribute("item-index") || "";

    console.log("Delete button clicked:");
    console.log(" memberstackId:", memberstackId);
    console.log(" listingId:", listingId);
    console.log(" photoIndex:", photoIndex);

    try {
      const response = await fetch(
        api.endpoints.deleteMultiImage,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            memberstackId: memberstackId,
            listingId: listingId,
            photoIndex: photoIndex,
          }),
        }
      );

      if (response.ok) {
        console.log("Delete successful, refreshing page");
        window.location.reload();
      } else {
        const errorText = await response.text();
        console.error("Delete failed:", response.status, errorText);
        alert(`Failed to delete image: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      alert(`Error deleting image: ${error}`);
    }
  }
}


// <input type="text" name="memberstackId" value="mem-cmh36kq9w001e0svqbmggf3tf" />
// <input type="text" name="listingId" value="item-1" />
// <input type="text" name="photoIndex" value="0" />
