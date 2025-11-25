/**
 * Page | Listing
 * Handles all /listings/* routes with wildcard matching
 */

import { page, PageBase } from "@sygnal/sse-core";
import { WebflowForm } from "../elements/webflow-form";
import { api } from "../config";
// import { displayMessage } from "../utils/loader";
import { LoaderOverlayComponent } from "../components/loader-overlay";
import { getCurrentMemberId } from "../utils/memberstack";

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

  protected displayMessage(messageKey: string): void {
    // Get the loader-overlay component from the registry
    const [loaderOverlay] = window.componentManager?.getComponentsByType<LoaderOverlayComponent>('loader-overlay') ?? [];

    if (!loaderOverlay) {
      console.warn('Loader-overlay component not found in registry');
      return;
    }

    console.log('Loader-overlay component found');

    // Show the loader overlay with the specified message
    loaderOverlay.show(messageKey);
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

    // Initialize popup
    // Get the loader-overlay component from the registry
    const [loaderOverlay] = window.componentManager?.getComponentsByType<LoaderOverlayComponent>('loader-overlay') ?? [];

    if (!loaderOverlay) {
      console.warn('Loader-overlay component not found in registry');
      return;
    }

    console.log('Loader-overlay component found');

    // Get the current member ID from Memberstack SDK
    let memberstackId: string;
    try {
      const id = await getCurrentMemberId();
      if (!id) {
        console.error('[Listings] User is not logged in. Forms will not be initialized.');
        alert('You must be logged in to edit listings.');
        return;
      }
      memberstackId = id;
      console.log('[Listings] Retrieved member ID:', memberstackId);
    } catch (error) {
      console.error('[Listings] Failed to retrieve member ID:', error);
      alert('Failed to verify your login. Please refresh the page and try again.');
      return;
    }

    // Initialize field values from sse-field-value on inputs, options, and textareas
    try {
      const fieldNodes = document.querySelectorAll<HTMLElement>(
        'input[sse-field-value], textarea[sse-field-value], select[sse-field-value], option[sse-field-value]'
      );
      console.log(`[Listings] Initializing ${fieldNodes.length} field(s) from sse-field-value`);

      const toBool = (v: string): boolean => {
        const s = v.trim().toLowerCase();
        return s === 'true' || s === '1' || s === 'yes' || s === 'on';
      };

      fieldNodes.forEach((el) => {
        const valAttr = el.getAttribute('sse-field-value') ?? '';
        const tag = el.tagName;

        if (tag === 'INPUT') {
          const input = el as HTMLInputElement;
          const type = (input.type || '').toLowerCase();
          if (type === 'checkbox') {
            input.checked = toBool(valAttr);
            // Do not override existing value; checkbox value often meaningful
            console.log('[Listings] Set checkbox', { name: input.name, checked: input.checked });
          } else if (type === 'radio') {
            // Prefer matching by value; otherwise treat truthy as checked
            if (input.value === valAttr) {
              input.checked = true;
            } else if (toBool(valAttr)) {
              input.checked = true;
            }
            console.log('[Listings] Set radio', { name: input.name, value: input.value, checked: input.checked });
          } else {
            input.value = valAttr;
            console.log('[Listings] Set input', { name: input.name, type, value: input.value });
          }
        } else if (tag === 'TEXTAREA') {
          const ta = el as HTMLTextAreaElement;
          ta.value = valAttr;
          console.log('[Listings] Set textarea', { name: ta.name, value: ta.value });
        } else if (tag === 'SELECT') {
          const sel = el as HTMLSelectElement;
          const raw = el.getAttribute('sse-field-value') ?? '';
          if (sel.multiple) {
            const vals = raw
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
            Array.from(sel.options).forEach((opt) => {
              const byValue = vals.indexOf(opt.value) !== -1;
              const byText = vals.indexOf(opt.text) !== -1;
              opt.selected = byValue || byText;
            });
          } else {
            sel.value = raw;
            if (sel.value !== raw) {
              const byText = Array.from(sel.options).find((o) => o.text === raw);
              if (byText) sel.value = byText.value;
            }
          }
          sel.dispatchEvent(new Event('change', { bubbles: true }));
          console.log('[Listings] Set select', { name: sel.name, value: sel.value, multiple: sel.multiple });
        } else if (tag === 'OPTION') {
          const opt = el as HTMLOptionElement;
          const shouldSelect = toBool(valAttr) || opt.value === valAttr;
          if (shouldSelect) opt.selected = true;
          // Optionally set value if empty
          if (!opt.value) opt.value = valAttr;
          console.log('[Listings] Set option', { value: opt.value, selected: opt.selected });
        }
      });
    } catch (e) {
      console.error('[Listings] Error initializing sse-field-value fields:', e);
    }

    // Instantiate and handle form submission for #set-image
    const setImageForm = WebflowForm.tryCreateFromId("set-image");
    if (setImageForm) {
      console.log('[Listings] Found #set-image form. Mounting handler...');
      const setImageEndpoint = api.url('/forms/upload-image');
      console.log('[Listings] Set image endpoint:', setImageEndpoint);

      setImageForm
        .addHiddenFields({
          memberstackId: memberstackId,
          listingId: this.pageInfo.itemSlug || ""
        })
        .setEndpoint(setImageEndpoint)
        .onSubmit(setImageEndpoint, {
          useAuth: true,
          preSubmit: () => this.displayMessage("uploading-file"),
          onSuccess: () => {
            setTimeout(() => window.location.reload(), 1500);
          }
        });
    }

    // Instantiate and handle form submission for #set-certificate
    const setCertificateForm = WebflowForm.tryCreateFromId("set-certificate");
    if (setCertificateForm) {
      console.log('[Listings] Found #set-certificate form. Mounting handler...');
      const certificateEndpoint = api.url('/forms/upload-file');
      console.log('[Listings] Certificate upload endpoint:', certificateEndpoint);

      setCertificateForm
        .addHiddenFields({
          memberstackId: memberstackId,
          listingId: this.pageInfo.itemSlug || ""
        })
        .setEndpoint(certificateEndpoint)
        .onSubmit(certificateEndpoint, {
          useAuth: true,
          preSubmit: () => this.displayMessage("uploading-file"),
          onSuccess: () => {
            setTimeout(() => window.location.reload(), 1500);
          }
        });
    }

    // Instantiate and handle form submission for #update-data
    const updateDataForm = WebflowForm.tryCreateFromId("update-data");
    if (updateDataForm) {
      console.log('[Listings] Found #update-data form. Mounting handler...');
      const updateEndpoint = api.url('/forms/update-listing');
      console.log('[Listings] Update listing endpoint:', updateEndpoint);

      updateDataForm
        .addHiddenFields({
          memberstackId: memberstackId,
          listingId: this.pageInfo.itemSlug || ""
        })
        .onSubmit(updateEndpoint, {
          useAuth: true,
          preSubmit: () => this.displayMessage(""),
          onSuccess: () => {
            setTimeout(() => window.location.reload(), 1500);
          }
        });
    }

    // Instantiate and handle form submission for #add-multi-image
    const addMultiImageForm = WebflowForm.tryCreateFromId("add-multi-image");
    if (addMultiImageForm) {
      console.log('[Listings] Found #add-multi-image form. Mounting handler...');
      const addMultiImageEndpoint = api.url('/forms/upload-multi-image');
      console.log('[Listings] Add multi-image endpoint:', addMultiImageEndpoint);

      addMultiImageForm
        .addHiddenFields({
          memberstackId: memberstackId,
          listingId: this.pageInfo.itemSlug || ""
        })
        .setEndpoint(addMultiImageEndpoint)
        .onSubmit(addMultiImageEndpoint, {
          useAuth: true,
          preSubmit: () => this.displayMessage("uploading-file"),
          onSuccess: () => {
            setTimeout(() => window.location.reload(), 1500);
          }
        });
    }

    // Find all delete buttons and set up FIX trigger attributes
    const buttons = document.querySelectorAll("[sse-action='delete-multi-image']");
    console.log("[Listings] Found delete buttons:", buttons.length);

    buttons.forEach((button) => {
      const itemIndex = this.getCollectionListItemIndex(button);
      const listingId = this.pageInfo.itemSlug || "";

      if (itemIndex !== -1 && listingId) {
        // Set up FIX trigger attributes
        button.setAttribute("trigger:click", "delete-multi-image");
        button.setAttribute("trigger:click:data:listing-id", listingId);
        button.setAttribute("trigger:click:data:photo-index", itemIndex.toString());
        console.log("[Listings] Configured delete button:", { listingId, photoIndex: itemIndex });
      }
    });

    console.log("Listings page exec complete");
  }
}


// <input type="text" name="memberstackId" value="mem-cmh36kq9w001e0svqbmggf3tf" />
// <input type="text" name="listingId" value="item-1" />
// <input type="text" name="photoIndex" value="0" />
