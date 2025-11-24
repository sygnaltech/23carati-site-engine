import { WebflowElementBase } from "./webflow-element-base";
import { apiRequest } from "../utils/api-client";

/**
 * WebflowForm - General purpose class for managing Webflow form states
 *
 * Manages the display states of a Webflow form:
 * - Default: Only the form is visible
 * - Success: Only the success message (w-form-done) is visible
 * - Error: Both the form and error message (w-form-fail) are visible
 *
 * Supports initialization from either:
 * - The .w-form wrapper div (finds the form within)
 * - The <form> element directly (finds the wrapper parent)
 */

export enum FormState {
  Default = "default",
  Success = "success",
  Error = "error",
}

export class WebflowForm extends WebflowElementBase {
  private wrapperElement: HTMLElement;
  private formElement: HTMLFormElement;
  private successElement: HTMLElement | null;
  private errorElement: HTMLElement | null;
  public autoMode: boolean;

  constructor(element: HTMLElement) {
    super(element);

    // Determine if the element is the wrapper or the form itself
    if (element.classList.contains("w-form")) {
      this.wrapperElement = element;
      const form = element.querySelector("form");
      if (!form) {
        throw new Error("No form element found within w-form wrapper");
      }
      this.formElement = form;
    } else if (element.tagName === "FORM") {
      this.formElement = element as HTMLFormElement;
      const wrapper = element.closest(".w-form");
      if (!wrapper) {
        throw new Error("Form element is not within a w-form wrapper");
      }
      this.wrapperElement = wrapper as HTMLElement;
    } else {
      throw new Error(
        "Element must be either a w-form wrapper or a form element"
      );
    }

    // Find the success and error elements
    this.successElement = this.wrapperElement.querySelector(".w-form-done");
    this.errorElement = this.wrapperElement.querySelector(".w-form-fail");

    // Check sse-form-mode-auto attribute (defaults to true)
    const autoModeAttr = this.formElement.getAttribute("sse-form-mode-auto");
    this.autoMode = autoModeAttr !== "false";

    // Initialize to default state
    this.setState(FormState.Default);
  }

  /**
   * Validates that the element is a form or w-form wrapper
   */
  protected validate(element: HTMLElement): void {
    const isWrapper = element.classList.contains("w-form");
    const isForm = element.tagName === "FORM";

    if (!isWrapper && !isForm) {
      throw new Error(
        `Element must be either a .w-form wrapper or a <form> element. Received: ${element.tagName} with classes: ${element.className}`
      );
    }

    // Additional validation: if it's a wrapper, must contain a form
    if (isWrapper) {
      const form = element.querySelector("form");
      if (!form) {
        throw new Error("w-form wrapper must contain a <form> element");
      }
    }

    // Additional validation: if it's a form, must be within a wrapper
    if (isForm) {
      const wrapper = element.closest(".w-form");
      if (!wrapper) {
        throw new Error("<form> element must be within a .w-form wrapper");
      }
    }
  }

  /**
   * Set the form state
   * @param state The desired form state (Default, Success, or Error)
   */
  setState(state: FormState): void {
    switch (state) {
      case FormState.Default:
        this.showDefault();
        break;
      case FormState.Success:
        this.showSuccess();
        break;
      case FormState.Error:
        this.showError();
        break;
    }
  }

  /**
   * Show only the form (default state)
   */
  private showDefault(): void {
    this.formElement.style.display = "block";
    if (this.successElement) {
      this.successElement.style.display = "none";
    }
    if (this.errorElement) {
      this.errorElement.style.display = "none";
    }
  }

  /**
   * Show only the success message
   */
  private showSuccess(): void {
    this.formElement.style.display = "none";
    if (this.successElement) {
      this.successElement.style.display = "block";
    }
    if (this.errorElement) {
      this.errorElement.style.display = "none";
    }
  }

  /**
   * Show both the form and error message
   */
  private showError(): void {
    this.formElement.style.display = "block";
    if (this.successElement) {
      this.successElement.style.display = "none";
    }
    if (this.errorElement) {
      this.errorElement.style.display = "block";
    }
  }

  /**
   * Get the wrapper element
   */
  getWrapper(): HTMLElement {
    return this.wrapperElement;
  }

  /**
   * Get the form element
   */
  getForm(): HTMLFormElement {
    return this.formElement;
  }

  /**
   * Get the success message element
   */
  getSuccessElement(): HTMLElement | null {
    return this.successElement;
  }

  /**
   * Get the error message element
   */
  getErrorElement(): HTMLElement | null {
    return this.errorElement;
  }

  /**
   * Check if auto mode is enabled
   */
  isAutoMode(): boolean {
    return this.autoMode;
  }

  /**
   * Reset the form to its default state and clear all inputs
   */
  reset(): void {
    this.formElement.reset();
    this.setState(FormState.Default);
  }

  /**
   * Add a single hidden field to the form
   * @param name The name attribute for the hidden input
   * @param value The value for the hidden input
   * @returns The created input element
   */
  addHiddenField(name: string, value: string): HTMLInputElement {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    this.formElement.appendChild(input);
    return input;
  }

  /**
   * Add multiple hidden fields to the form
   * @param fields An object with key-value pairs for hidden fields
   * @returns this (for chaining)
   */
  addHiddenFields(fields: Record<string, string>): this {
    for (const name in fields) {
      if (fields.hasOwnProperty(name)) {
        this.addHiddenField(name, fields[name]);
      }
    }
    return this;
  }

  /**
   * Set the form action endpoint
   * @param endpoint The URL to submit the form to
   * @returns this (for chaining)
   */
  setEndpoint(endpoint: string): this {
    this.formElement.action = endpoint;
    return this;
  }

  /**
   * Set up form submission handler with automatic success/error handling
   * @param endpoint The URL to submit the form to
   * @param options Configuration options for the submission
   * @returns this (for chaining)
   */
  onSubmit(
    endpoint: string,
    options?: {
      preSubmit?: () => void;
      onSuccess?: (response: Response) => void | Promise<void>;
      onError?: (error: string) => void;
      method?: string;
      useAuth?: boolean;
      bearerToken?: string;
    }
  ): this {
    this.formElement.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Call pre-submit hook
      options?.preSubmit?.();

      const formData = new FormData(this.formElement);

      try {
        const response = await apiRequest(endpoint, {
          method: options?.method || "POST",
          body: formData,
          useAuth: options?.useAuth,
          bearerToken: options?.bearerToken,
        });

        if (response.ok) {
          console.log("Form submission successful");
          if (this.autoMode) {
            this.setState(FormState.Success);
          }
          await options?.onSuccess?.(response);
        } else {
          const errorText = await response.text();
          console.error("Form submission failed:", response.status, errorText);
          if (this.autoMode) {
            this.setState(FormState.Error);
          }
          options?.onError?.(errorText);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        if (this.autoMode) {
          this.setState(FormState.Error);
        }
        options?.onError?.(error instanceof Error ? error.message : String(error));
      }
    });

    return this;
  }
}
