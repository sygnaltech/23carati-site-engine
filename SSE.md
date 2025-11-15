# SSE Framework Guide

This document explains how to use the SSE (Sygnal Site Engine) framework's registry system for pages and components.

## Component Registry

### How Components Register

When a component is decorated with `@component('component-name')`, it is automatically registered in the SSE registry system. During page initialization, the framework:

1. Scans the DOM for elements with the `[sse-component]` attribute
2. Reads the component name from the attribute value
3. Looks up the component constructor in the registry
4. Instantiates the component with the element
5. Calls `setup()` synchronously
6. Calls `exec()` asynchronously after DOM ready
7. **Registers the instance in `window.componentManager`**

### Accessing Component Instances

The `window.componentManager` is a global singleton that stores all instantiated components. You can access component instances using:

#### Get All Instances of a Component Type

```typescript
// Get all instances of a specific component type
const loaderOverlays = window.componentManager?.getComponentsByType<LoaderOverlay>('loader-overlay');

if (loaderOverlays && loaderOverlays.length > 0) {
  const firstOverlay = loaderOverlays[0];
  firstOverlay.alert('loading');
}
```

#### Get Single Instance (assuming only one exists)

```typescript
// Get the first (and typically only) instance of a component
const [loaderOverlay] = window.componentManager?.getComponentsByType<LoaderOverlay>('loader-overlay') ?? [];

if (loaderOverlay) {
  loaderOverlay.alert('success');
}
```

#### Get All Component Types

```typescript
// See what component types are registered
const types = window.componentManager?.getComponentTypes();
console.log('Registered components:', types);
// Example output: ['loader-overlay', 'navigation', 'modal', ...]
```

### Component Manager API

The `ComponentManager` class provides these methods:

- **`registerComponent(type: string, component: IModule)`** - Register a component instance (done automatically by framework)
- **`getComponentsByType<T>(type: string): T[]`** - Get all instances of a specific component type
- **`getComponentTypes(): string[]`** - Get array of all registered component type names
- **`getTotalCount(): number`** - Get total number of component instances
- **`clear()`** - Clear all registered components

## Page Registry

### How Pages Register

Pages are registered using the `@page('/route')` decorator and are managed differently than components:

1. Only ONE page instance is active at a time
2. The current page is stored in `PageBase.getCurrentPage()`
3. Pages automatically detect Webflow context (collection ID, item slug, etc.)

### Accessing the Current Page

```typescript
import { PageBase } from '@sygnal/sse-core';

// Get generic page reference
const currentPage = PageBase.getCurrentPage();
if (currentPage) {
  console.log('Page ID:', currentPage.pageInfo.pageId);
  console.log('Collection ID:', currentPage.pageInfo.collectionId);
}

// Get specific page type
const listingPage = PageBase.getCurrentPage<ListingPage>();
if (listingPage) {
  listingPage.handleCustomAction();
}
```

### Page Context Information

Every page has access to `this.pageInfo` which includes:

```typescript
interface WebflowPageInfo {
  path: string;              // Current page path
  domain: string | null;     // Webflow domain
  pageId: string | null;     // Webflow page ID
  siteId: string | null;     // Webflow site ID
  lang: string | null;       // Page language
  collectionId: string | null;  // Collection ID (if collection page)
  itemId: string | null;     // Item ID (if collection item page)
  itemSlug: string | null;   // Collection item slug
  queryParams: URLSearchParams; // URL query parameters
  hash: string;              // URL hash fragment
  url: string;               // Full URL
}
```

## Lifecycle Methods

### Component Lifecycle

```typescript
@component('my-component')
export class MyComponent extends ComponentBase {
  // Called synchronously during page load (in <head>)
  protected onPrepare(): void {
    console.log('Component element:', this.element);
    console.log('Component name:', this.context.name);
  }

  // Called asynchronously after DOM is ready
  protected async onLoad(): Promise<void> {
    // Access current page
    const page = PageBase.getCurrentPage();

    // Your component logic here
    this.element.addEventListener('click', this.handleClick);
  }
}
```

### Page Lifecycle

```typescript
@page('/my-route')
export class MyPage extends PageBase {
  // Called synchronously during page load (in <head>)
  protected onPrepare(): void {
    console.log('Page ID:', this.pageInfo.pageId);
  }

  // Called asynchronously after DOM is ready
  protected async onLoad(): Promise<void> {
    // Your page logic here
  }
}
```

## Common Patterns

### Accessing Components from a Page

```typescript
@page('/dashboard')
export class DashboardPage extends PageBase {
  protected async onLoad(): Promise<void> {
    // Get modal component instance
    const [modal] = window.componentManager?.getComponentsByType<Modal>('modal') ?? [];

    if (modal) {
      modal.show('Welcome to Dashboard');
    }
  }
}
```

### Accessing Page Info from a Component

```typescript
@component('listing-card')
export class ListingCard extends ComponentBase {
  protected async onLoad(): Promise<void> {
    // Get current page to access page context
    const page = PageBase.getCurrentPage();

    if (page?.pageInfo.itemSlug) {
      console.log('Current item:', page.pageInfo.itemSlug);
    }
  }
}
```

### Cross-Component Communication

```typescript
@component('submit-button')
export class SubmitButton extends ComponentBase {
  protected async onLoad(): Promise<void> {
    this.element.addEventListener('click', async () => {
      // Get loader overlay to show loading state
      const [loader] = window.componentManager?.getComponentsByType<LoaderOverlay>('loader-overlay') ?? [];

      if (loader) {
        loader.show();
      }

      // Perform operation
      await this.submitData();

      // Hide loader
      if (loader) {
        loader.hide();
      }
    });
  }
}
```

## Example: Finding and Calling a Component Method

```typescript
// In a page or component
protected async onLoad(): Promise<void> {
  // Find all link elements
  const links = document.querySelectorAll('a[href="#"]');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      // Get the link text
      const mode = link.textContent?.trim() || 'default';

      // Find the loader-overlay component
      const [loaderOverlay] = window.componentManager?.getComponentsByType<LoaderOverlay>('loader-overlay') ?? [];

      // Call its alert method
      if (loaderOverlay) {
        loaderOverlay.alert(mode);
      }
    });
  });
}
```

## Type Safety

For better TypeScript support, ensure your component classes are properly typed:

```typescript
import { ComponentBase } from '@sygnal/sse-core';

@component('loader-overlay')
export class LoaderOverlay extends ComponentBase {
  public alert(mode: string): void {
    // Implementation
  }
}

// Usage with type safety
const [overlay] = window.componentManager?.getComponentsByType<LoaderOverlay>('loader-overlay') ?? [];
if (overlay) {
  overlay.alert('loading'); // TypeScript knows about this method
}
```

## Debugging

### Check What's Registered

```typescript
// Log all registered component types
console.log('Component types:', window.componentManager?.getComponentTypes());

// Log total component count
console.log('Total components:', window.componentManager?.getTotalCount());

// Get registry statistics
import { getRegistryStats } from '@sygnal/sse-core';
console.log('Registry stats:', getRegistryStats());
```
