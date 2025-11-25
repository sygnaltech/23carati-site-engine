import { WebflowElementBase } from "./webflow-element-base";

/**
 * WebflowTabs - Manages Webflow tabs component
 *
 * Handles tab navigation and content switching for Webflow .w-tabs elements.
 * Provides a programmatic interface to control tab activation.
 *
 * Example usage:
 * const tabs = WebflowTabs.tryCreateFromId("#product-tabs");
 * if (tabs) {
 *   tabs.activateTab(1);
 *   tabs.onTabChange((index) => console.log(`Tab ${index} activated`));
 * }
 */

export class WebflowTabs extends WebflowElementBase {
  private tabMenu: HTMLElement | null;
  private tabLinks: HTMLElement[];
  private tabPanes: HTMLElement[];
  private currentTab: number = 0;
  private changeCallbacks: Array<(index: number) => void> = [];

  constructor(element: HTMLElement) {
    super(element);

    // Find tab menu (w-tab-menu)
    this.tabMenu = element.querySelector(".w-tab-menu");

    // Find all tab links (w-tab-link or w-inline-block within w-tab-menu)
    this.tabLinks = Array.from(
      element.querySelectorAll(".w-tab-link, .w-tab-menu .w-inline-block")
    );

    // Find all tab panes (w-tab-pane)
    this.tabPanes = Array.from(element.querySelectorAll(".w-tab-pane"));

    if (this.tabLinks.length === 0) {
      console.warn("[WebflowTabs] No tab links found");
    }

    if (this.tabPanes.length === 0) {
      console.warn("[WebflowTabs] No tab panes found");
    }

    // Find initial active tab
    const activeIndex = this.tabLinks.findIndex((link) =>
      link.classList.contains("w--current")
    );
    this.currentTab = activeIndex >= 0 ? activeIndex : 0;

    // Bind click events
    this.bindEvents();
  }

  /**
   * Validates that the element is a Webflow tabs component
   */
  protected validate(element: HTMLElement): void {
    if (!element.classList.contains("w-tabs")) {
      throw new Error(
        `Element must have .w-tabs class. Received: ${element.tagName} with classes: ${element.className}`
      );
    }

    // Check for tab menu
    const tabMenu = element.querySelector(".w-tab-menu");
    if (!tabMenu) {
      throw new Error(".w-tabs element must contain a .w-tab-menu");
    }
  }

  /**
   * Bind click events to tab links
   */
  private bindEvents(): void {
    this.tabLinks.forEach((link, index) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        this.activateTab(index);
      });
    });
  }

  /**
   * Activate a specific tab by index
   * @param index The zero-based index of the tab to activate
   * @returns this (for chaining)
   */
  activateTab(index: number): this {
    if (index < 0 || index >= this.tabLinks.length) {
      console.error(
        `[WebflowTabs] Invalid tab index: ${index}. Valid range: 0-${this.tabLinks.length - 1}`
      );
      return this;
    }

    // Update current tab
    const previousTab = this.currentTab;
    this.currentTab = index;

    // Update tab links - remove active class from all, add to selected
    this.tabLinks.forEach((link, i) => {
      if (i === index) {
        link.classList.add("w--current");
        link.setAttribute("aria-selected", "true");
        link.setAttribute("tabindex", "0");
      } else {
        link.classList.remove("w--current");
        link.setAttribute("aria-selected", "false");
        link.setAttribute("tabindex", "-1");
      }
    });

    // Update tab panes - hide all, show selected
    this.tabPanes.forEach((pane, i) => {
      if (i === index) {
        pane.classList.add("w--tab-active");
        (pane as HTMLElement).style.display = "block";
        pane.setAttribute("aria-hidden", "false");
      } else {
        pane.classList.remove("w--tab-active");
        (pane as HTMLElement).style.display = "none";
        pane.setAttribute("aria-hidden", "true");
      }
    });

    // Trigger callbacks
    if (previousTab !== index) {
      this.changeCallbacks.forEach((callback) => callback(index));
    }

    return this;
  }

  /**
   * Register a callback to be called when tab changes
   * @param callback Function to call with the new tab index
   * @returns this (for chaining)
   */
  onTabChange(callback: (index: number) => void): this {
    this.changeCallbacks.push(callback);
    return this;
  }

  /**
   * Get the currently active tab index
   */
  getCurrentTab(): number {
    return this.currentTab;
  }

  /**
   * Get the total number of tabs
   */
  getTabCount(): number {
    return this.tabLinks.length;
  }

  /**
   * Go to the next tab (wraps around to first)
   * @returns this (for chaining)
   */
  nextTab(): this {
    const nextIndex = (this.currentTab + 1) % this.tabLinks.length;
    return this.activateTab(nextIndex);
  }

  /**
   * Go to the previous tab (wraps around to last)
   * @returns this (for chaining)
   */
  prevTab(): this {
    const prevIndex =
      this.currentTab === 0 ? this.tabLinks.length - 1 : this.currentTab - 1;
    return this.activateTab(prevIndex);
  }
}
