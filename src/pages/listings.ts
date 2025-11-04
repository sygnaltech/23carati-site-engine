/**
 * Page | Listing
 * Handles all /listings/* routes with wildcard matching
 */

import { IModule, page } from "@sygnal/sse";
import { WebflowForm, FormState } from "../elements/webflow-form";

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

    console.log("Item Slug:", this.itemSlug);

    // Instantiate and handle form submission for #set-image
    const setImageForm = document.querySelector("#set-image");
    if (setImageForm) {
      const webflowForm = new WebflowForm(setImageForm as HTMLElement);
      const form = webflowForm.getForm();

      // Add hidden inputs for memberstackId and listingId
      const memberstackIdInput = document.createElement("input");
      memberstackIdInput.type = "hidden";
      memberstackIdInput.name = "memberstackId";
      memberstackIdInput.value = "mem-cmh36kq9w001e0svqbmggf3tf";
      form.appendChild(memberstackIdInput);

      const listingIdInput = document.createElement("input");
      listingIdInput.type = "hidden";
      listingIdInput.name = "listingId";
      listingIdInput.value = this.itemSlug || "";
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

    // Instantiate and handle form submission for #add-multi-image
    // TODO: 


    // Find all buttons with class w-button
    const buttons = document.querySelectorAll("[sse-action='delete-multi-image']");
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
    const memberstackId = "mem-cmh36kq9w001e0svqbmggf3tf";
    const listingId = button.getAttribute("item-slug") || "";
    const photoIndex = button.getAttribute("item-index") || "";

    console.log("Delete button clicked:");
    console.log(" memberstackId:", memberstackId);
    console.log(" listingId:", listingId);
    console.log(" photoIndex:", photoIndex);

    try {
      const response = await fetch(
        "http://127.0.0.1:8787/api/v1/forms/delete-multi-image",
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
