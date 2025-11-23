/**
 * WebflowElementBase - Abstract base class for all Webflow element wrappers
 *
 * Provides common functionality for finding, validating, and managing Webflow elements.
 * Subclasses should implement the validate() method to perform element-specific validation.
 */

export abstract class WebflowElementBase {
  protected element: HTMLElement;

  /**
   * Constructor that accepts an HTMLElement
   * Subclasses should call super(element) and then perform their own initialization
   */
  constructor(element: HTMLElement) {
    this.element = element;
    this.validate(element);
  }

  /**
   * Abstract validation method that subclasses must implement
   * Should throw an error if the element is not valid for this element type
   * @param element The element to validate
   */
  protected abstract validate(element: HTMLElement): void;

  /**
   * Static factory method to create an instance from an element ID (without # prefix)
   * Returns null if element not found, throws if construction fails
   *
   * @param id The element ID (e.g., "my-form", not "#my-form")
   * @returns Instance of the subclass or null if not found
   */
  static tryCreateFromId<T extends WebflowElementBase>(
    this: new (element: HTMLElement) => T,
    id: string
  ): T | null {
    const element = document.getElementById(id);

    if (!element) {
      console.warn(`[${this.name}] Element with ID "${id}" not found`);
      return null;
    }

    // Construction errors will throw and bubble up
    // This is intentional - they indicate real problems that should surface
    return new this(element as HTMLElement);
  }

  /**
   * Static factory method to create an instance from any CSS selector
   * Returns null if element not found, throws if construction fails
   *
   * @param selector The CSS selector (e.g., "#my-form", ".my-class", "[data-form]")
   * @returns Instance of the subclass or null if not found
   */
  static tryCreateFromSelector<T extends WebflowElementBase>(
    this: new (element: HTMLElement) => T,
    selector: string
  ): T | null {
    const element = document.querySelector(selector);

    if (!element) {
      console.warn(`[${this.name}] Element matching selector "${selector}" not found`);
      return null;
    }

    // Construction errors will throw and bubble up
    // This is intentional - they indicate real problems that should surface
    return new this(element as HTMLElement);
  }

  /**
   * Get the root element
   */
  getElement(): HTMLElement {
    return this.element;
  }
}
