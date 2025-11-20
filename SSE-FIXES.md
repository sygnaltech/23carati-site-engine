# SSE Framework Fixes

This document tracks issues discovered with the SSE framework initialization order and their solutions.

## Issue #1: Components Not Available in Page onLoad()

### Problem

When page classes try to access component instances in their `onLoad()` method, the components are not yet available in `window.componentManager`, causing lookups to fail.

**Example Error:**
```typescript
// In test-loader.ts
protected async onLoad(): Promise<void> {
    const [loaderOverlay] = window.componentManager?.getComponentsByType<LoaderOverlayComponent>('loader-overlay') ?? [];

    if (!loaderOverlay) {
        console.warn('[TestLoaderPage] loader-overlay component not found in registry');
        // ← THIS WARNING APPEARS because components aren't initialized yet
        return;
    }
}
```

### Root Cause

**File:** [src/index.ts](src/index.ts) (Lines 69-75)

The initialization order is incorrect:

```typescript
const exec = () => {
    dispatcher.execRoute();      // ← 1st: Executes page onLoad()
    initializeComponents();      // ← 2nd: Initializes components
}
```

**Current Sequence:**
1. `dispatcher.execRoute()` runs → calls `pageInstance.exec()` → triggers page's `onLoad()` method
2. Page's `onLoad()` tries to access components from `window.componentManager`
3. **Components don't exist yet** because `initializeComponents()` hasn't run
4. `initializeComponents()` runs → finds `[sse-component]` elements, instantiates, and registers them

### Solution

**Swap the order** in [src/index.ts:69-75](src/index.ts#L69-L75):

```typescript
const exec = () => {
    // Initialize all components FIRST
    initializeComponents();

    // THEN execute route (calls page.exec() which triggers onLoad())
    dispatcher.execRoute();
}
```

**Corrected Sequence:**
1. `initializeComponents()` runs → finds, instantiates, and registers all components in `window.componentManager`
2. Components are now available in the registry
3. `dispatcher.execRoute()` runs → calls page's `onLoad()` method
4. Page code can successfully query and use components

### Technical Details

#### Entry Point: src/index.ts

**Phase 1: Module Loading (Synchronous)**
- Line 14: `initSSE()` initializes the SSE core
- Line 44: `window.componentManager = new ComponentManager()` creates the registry
- Line 50: `routeDispatcher()` imports all pages and components (decorators register them)

**Phase 2: Setup (Synchronous)**
- Lines 55-64: `setup()` function executes
- `dispatcher.setupRoute()` calls page's `setup()` method (which calls `onPrepare()`)

**Phase 3: Exec (Asynchronous, after DOMContentLoaded)**
- Lines 69-75: `exec()` function executes
- **CURRENT (WRONG):** page `exec()` → component initialization
- **CORRECT (RIGHT):** component initialization → page `exec()`

#### What initializeComponents() Does

From `@sygnal/sse-core/dist/component-init.js`:
1. Line 30: Finds all `[sse-component]` elements in the DOM
2. Line 51: Instantiates each component class
3. Line 54: **Registers component instance in `window.componentManager`**
4. Line 57: Calls `componentInstance.exec()` (triggers component's `onLoad()`)

#### What dispatcher.execRoute() Does

From `@sygnal/sse-core/dist/routeDispatcher.js`:
1. Line 42: Calls site's `exec()` method
2. Line 46: **Calls page's `exec()` method (triggers page's `onLoad()`)**

### Impact

**Before Fix:**
- Pages cannot reliably access component instances in `onLoad()`
- Workarounds required (setTimeout, lazy initialization, etc.)
- Race conditions and timing issues

**After Fix:**
- Components guaranteed to be available when page `onLoad()` runs
- Clean, predictable initialization order
- No workarounds needed

### Testing

After applying the fix, verify:

1. Components are registered before page code runs:
```typescript
protected async onLoad(): Promise<void> {
    const [component] = window.componentManager?.getComponentsByType<MyComponent>('my-component') ?? [];
    console.log('Component found:', component !== undefined); // Should always be true
}
```

2. No timing-related warnings in console
3. Component methods can be called immediately in page `onLoad()`

### Files to Update

- **[src/index.ts](src/index.ts)** - Swap lines 71 and 74 in the `exec()` function

### Alternative Workarounds (if core can't be changed)

If you cannot modify the SSE initialization order, use these workarounds:

#### 1. Lazy Component Lookup (Recommended)

Get component when needed, not at page load:

```typescript
protected async onLoad(): Promise<void> {
    const links = document.querySelectorAll('a[test]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            // Get component at click time, not page load time
            const [loaderOverlay] = window.componentManager?.getComponentsByType<LoaderOverlayComponent>('loader-overlay') ?? [];

            if (loaderOverlay) {
                const mode = link.textContent?.trim() || 'default';
                loaderOverlay.show(mode);
            }
        });
    });
}
```

#### 2. Async Delay

Wait for components to initialize:

```typescript
protected async onLoad(): Promise<void> {
    // Wait a tick for components to register
    await new Promise(resolve => setTimeout(resolve, 100));

    const [loaderOverlay] = window.componentManager?.getComponentsByType<LoaderOverlayComponent>('loader-overlay') ?? [];
    // Component should now be available
}
```

#### 3. Polling/Retry

Keep checking until component is available:

```typescript
protected async onLoad(): Promise<void> {
    const component = await this.waitForComponent<LoaderOverlayComponent>('loader-overlay', 5000);
    if (component) {
        // Use component
    }
}

private async waitForComponent<T>(type: string, timeout: number = 5000): Promise<T | null> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        const [component] = window.componentManager?.getComponentsByType<T>(type) ?? [];
        if (component) return component;
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    return null;
}
```

## Recommended Action

**Fix the root cause** by updating [src/index.ts](src/index.ts) to initialize components before executing page routes. This is the cleanest solution and benefits the entire application.
