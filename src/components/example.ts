/**
 * Component | Example
 * A more detailed example showing component capabilities
 */

import { ComponentBase, PageBase, component } from '@sygnal/sse-core';

@component('example')
export class ExampleComponent extends ComponentBase {
  private isActive: boolean = false;

  protected onPrepare(): void {
    // Read data attributes
    const initialState = this.element.dataset.initialState;
    if (initialState === 'active') {
      this.isActive = true;
    }
  }

  protected async onLoad(): Promise<void> {
    // Apply initial state
    if (this.isActive) {
      this.element.classList.add('active');
    }

    // Bind events
    this.bindEvents();

    // Example: Fetch data from API
    // const data = await this.fetchData();
  }

  private bindEvents(): void {
    this.element.addEventListener('click', this.handleClick.bind(this));
  }

  private handleClick(event: MouseEvent): void {
    this.isActive = !this.isActive;
    this.element.classList.toggle('active', this.isActive);

    // Emit custom event
    this.element.dispatchEvent(new CustomEvent('exampleToggle', {
      detail: { isActive: this.isActive },
      bubbles: true
    }));
  }

  // Example async method
  private async fetchData(): Promise<unknown> {
    try {
      const response = await fetch('/api/data');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch data:', error);
      return null;
    }
  }
}
