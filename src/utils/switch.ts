/**
 * Switch utility class
 * Works like a JavaScript switch statement, showing/hiding elements based on a value
 */

export class Switch {
  private wrapper: HTMLElement;
  private caseElements: Map<string, HTMLElement>;
  private defaultElement: HTMLElement | null;

  /**
   * Creates a new Switch instance
   * @param element The wrapper element containing the switch cases
   */
  constructor(element: HTMLElement) {
    this.wrapper = element;
    this.caseElements = new Map();
    this.defaultElement = null;

    this.initialize();
  }

  /**
   * Initializes the switch by finding all case and default elements
   */
  private initialize(): void {
    // Find all immediate children with sse-switch-case attribute
    Array.from(this.wrapper.children).forEach((child) => {
      const htmlChild = child as HTMLElement;

      if (htmlChild.hasAttribute('sse-switch-case')) {
        const caseValue = htmlChild.getAttribute('sse-switch-case');
        if (caseValue !== null) {
          this.caseElements.set(caseValue, htmlChild);
          console.log('[Switch] Registered case:', caseValue);
        }
      } else if (htmlChild.hasAttribute('sse-switch-default')) {
        this.defaultElement = htmlChild;
        console.log('[Switch] Registered default element');
      }
    });

    // Hide all elements first, then show default on initialization
    this.hideAll();
    this.showDefault();
  }

  /**
   * Sets the switch to a specific case value
   * @param value The case value to match
   */
  public set(value: string): void {
    console.log('[Switch] Setting value:', value);

    // Hide all elements first
    this.hideAll();

    // Check if we have a matching case
    if (this.caseElements.has(value)) {
      const matchingElement = this.caseElements.get(value)!;
      matchingElement.style.display = '';
      console.log('[Switch] Showing case:', value);
    } else {
      // No match found, show default
      this.showDefault();
    }
  }

  /**
   * Hides all case and default elements
   */
  private hideAll(): void {
    this.caseElements.forEach((element) => {
      element.style.display = 'none';
    });

    if (this.defaultElement) {
      this.defaultElement.style.display = 'none';
    }
  }

  /**
   * Shows the default element (if it exists)
   * If no default element exists, nothing is shown (like a JS switch with no matching case)
   */
  private showDefault(): void {
    if (this.defaultElement) {
      this.defaultElement.style.display = '';
      console.log('[Switch] Showing default');
    } else {
      console.log('[Switch] No default element - nothing will be displayed');
    }
  }
}
