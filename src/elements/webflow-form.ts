/**
 * WebflowForm - General purpose class for managing Webflow form states
 *
 * Manages the display states of a Webflow form:
 * - Default: Only the form is visible
 * - Success: Only the success message (w-form-done) is visible
 * - Error: Both the form and error message (w-form-fail) are visible
 */

export enum FormState {
  Default = "default",
  Success = "success",
  Error = "error",
}

export class WebflowForm {
  private wrapperElement: HTMLElement;
  private formElement: HTMLFormElement;
  private successElement: HTMLElement | null;
  private errorElement: HTMLElement | null;
  private autoMode: boolean;

  constructor(element: HTMLElement) {
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
}
