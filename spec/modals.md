# Modal/Popup System Specification

## Overview

The application uses a single `LoaderOverlayComponent` instance that displays different messages based on a **mode key**. The component uses a Switch utility to toggle between different message variants defined in the HTML.

## Architecture

### Components

1. **LoaderOverlayComponent** ([src/components/loader-overlay.ts](src/components/loader-overlay.ts))
   - Single modal instance managed globally
   - Accessed via `window.componentManager`
   - Uses Webflow IX animations for show/hide

2. **Switch Utility** ([src/utils/switch.ts](src/utils/switch.ts))
   - Handles conditional display of message variants
   - Maps mode keys to HTML elements with `sse-switch-case` attributes

3. **ComponentManager** (Global Registry)
   - Provides access to component instances
   - Initialized in [index.ts:48](index.ts#L48)

## How It Works

### Display Flow

```
Action/Page calls show(mode)
    ↓
Switch utility finds element with sse-switch-case="mode"
    ↓
Hides all other switch cases, shows matching one
    ↓
Webflow IX animation displays the overlay
```

### HTML Structure

The HTML must define switch cases for each mode:

```html
<div sse-component="loader-overlay">
  <div sse-switch>
    <div sse-switch-case="uploading-file">
      <p>Uploading file...</p>
    </div>
    <div sse-switch-case="deleting-listing">
      <p>Deleting listing...</p>
    </div>
    <div sse-switch-case="deleting-image">
      <p>Deleting image...</p>
    </div>
    <div sse-switch-default>
      <p>Processing...</p>
    </div>
  </div>
  <div trigger="show"></div>
  <div trigger="hide"></div>
</div>
```

## Usage Pattern

### Standard Implementation

```typescript
// 1. Get the loader overlay instance
const [loaderOverlay] = window.componentManager
  ?.getComponentsByType<LoaderOverlayComponent>('loader-overlay') ?? [];

if (!loaderOverlay) {
  console.error('LoaderOverlay component not found');
  return;
}

// 2. Show with a specific mode KEY (not the display text!)
loaderOverlay.show('deleting-image');  // ✅ CORRECT - uses mode key

// 3. Perform async operation
try {
  await someAsyncOperation();
} finally {
  // 4. Always hide when done
  loaderOverlay.hide();
}
```

### CRITICAL: Mode Parameter

**The mode parameter MUST be a switch case key, NOT the display text.**

```typescript
// ❌ WRONG - Do NOT use display text
loaderOverlay.show('Deleting image...');

// ✅ CORRECT - Use the switch case key
loaderOverlay.show('deleting-image');
```

**Why this matters:**
- The mode parameter matches against `sse-switch-case="mode"` attributes in HTML
- If no match is found, the default message shows (or nothing shows)
- Display text belongs in the HTML element, not in the code

### Naming Convention

Mode keys should be:
- **Lowercase with hyphens**: `deleting-image`, `uploading-file`
- **Descriptive action names**: `creating-listing`, `updating-profile`
- **Consistent pattern**: `{verb}-{noun}`

## Available Modes

Current switch cases defined in the HTML:

| Mode Key | Display Message | Used In |
|----------|----------------|---------|
| `uploading-file` | "Uploading file..." | Listings page file uploads |
| `deleting-listing` | "Deleting listing..." | Delete listing action |
| `deleting-image` | "Deleting image..." | Delete image actions |
| (default) | "Processing..." | Fallback for unmatched modes |

**Note:** Check the Webflow HTML to verify current switch cases before using.

## Adding New Modal Messages

### Step 1: Add HTML Switch Case

In Webflow, add a new element with the appropriate `sse-switch-case` attribute:

```html
<div sse-switch-case="your-mode-key">
  <p>Your message text here...</p>
</div>
```

### Step 2: Use the Mode Key in Code

```typescript
loaderOverlay.show('your-mode-key');
```

### Step 3: Document It

Add the new mode to the "Available Modes" table in this document.

## Common Mistakes

### ❌ Using Display Text as Mode

```typescript
// WRONG - This will not match any switch case
loaderOverlay.show('Deleting image...');
```

### ❌ Forgetting to Hide

```typescript
// WRONG - Modal will stay visible forever
loaderOverlay.show('deleting-image');
await deleteImage();
// Missing: loaderOverlay.hide();
```

### ❌ Not Checking for Component

```typescript
// WRONG - Will crash if component not found
const [loaderOverlay] = window.componentManager.getComponentsByType('loader-overlay');
loaderOverlay.show('mode'); // Potential null reference error
```

## Best Practices

### 1. Always Use Try-Finally

```typescript
const [loaderOverlay] = window.componentManager
  ?.getComponentsByType<LoaderOverlayComponent>('loader-overlay') ?? [];

if (loaderOverlay) {
  loaderOverlay.show('deleting-image');
}

try {
  await deleteImage();
} catch (error) {
  console.error('Delete failed:', error);
  // Handle error
} finally {
  // Always hide, even on error
  if (loaderOverlay) {
    loaderOverlay.hide();
  }
}
```

### 2. Verify Mode Exists

Before using a mode key in code, verify it exists in the Webflow HTML:
1. Check the HTML for `sse-switch-case="your-mode"`
2. Test in browser to confirm correct message shows
3. Document in "Available Modes" table

### 3. Consistent Error Handling

```typescript
const [loaderOverlay] = window.componentManager
  ?.getComponentsByType<LoaderOverlayComponent>('loader-overlay') ?? [];

if (!loaderOverlay) {
  console.error('[YourComponent] LoaderOverlay not found');
  // Decide: continue without modal or abort operation
  return;
}
```

## TypeScript Types

```typescript
interface LoaderOverlayComponent {
  show(mode: string): void;
  hide(): void;
}
```

## Examples from Codebase

### Delete Listing Action ([src/actions/delete-listing.ts](src/actions/delete-listing.ts))

```typescript
const [loaderOverlay] = window.componentManager
  ?.getComponentsByType<LoaderOverlayComponent>('loader-overlay') ?? [];

if (loaderOverlay) {
  loaderOverlay.show('deleting-listing');
}

try {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) throw new Error('Delete failed');
} catch (error) {
  console.error('Error:', error);
} finally {
  if (loaderOverlay) {
    loaderOverlay.hide();
  }
}
```

### Listings Page Upload ([src/pages/listings.ts](src/pages/listings.ts))

```typescript
protected displayMessage(messageKey: string): void {
  const [loaderOverlay] = window.componentManager
    ?.getComponentsByType<LoaderOverlayComponent>('loader-overlay') ?? [];

  if (!loaderOverlay) return;
  loaderOverlay.show(messageKey);
}

// Called before file upload
preSubmit: () => this.displayMessage("uploading-file")
```

## Troubleshooting

### Modal Shows Wrong Message

**Problem:** Modal displays default or wrong message.

**Cause:** Mode key doesn't match any `sse-switch-case` attribute.

**Solution:**
1. Check Webflow HTML for exact `sse-switch-case` value
2. Ensure mode parameter matches exactly (case-sensitive)
3. Verify switch case HTML is inside the `[sse-switch]` element

### Modal Doesn't Show

**Problem:** `show()` is called but nothing appears.

**Possible causes:**
1. LoaderOverlay component not initialized
2. Webflow IX animation not configured
3. `trigger="show"` element missing in HTML

**Debug steps:**
```typescript
const components = window.componentManager
  ?.getComponentsByType<LoaderOverlayComponent>('loader-overlay');
console.log('Found components:', components);
```

### Modal Stuck Visible

**Problem:** Modal remains visible after operation completes.

**Cause:** `hide()` was not called or errored before reaching it.

**Solution:** Always use try-finally pattern to ensure `hide()` executes.

## References

- LoaderOverlayComponent: [src/components/loader-overlay.ts](src/components/loader-overlay.ts)
- Switch Utility: [src/utils/switch.ts](src/utils/switch.ts)
- ComponentManager Init: [src/index.ts:48](src/index.ts#L48)
