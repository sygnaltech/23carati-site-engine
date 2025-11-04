# Webflow Forms

## WebflowForm Class

The `WebflowForm` class provides a general-purpose utility for managing Webflow form states programmatically.

### Location

```
src/elements/webflow-form.ts
```

### Overview

Manages the display states of a Webflow form structure:
- **Default**: Only the form is visible
- **Success**: Only the success message (`.w-form-done`) is visible
- **Error**: Both the form and error message (`.w-form-fail`) are visible

### Basic Usage

```typescript
import { WebflowForm, FormState } from "../elements/webflow-form";

// Initialize with either the .w-form wrapper or the form element
const formElement = document.querySelector("#my-form");
const webflowForm = new WebflowForm(formElement as HTMLElement);

// Change states
webflowForm.setState(FormState.Success);
webflowForm.setState(FormState.Error);
webflowForm.setState(FormState.Default);

// Reset form
webflowForm.reset(); // Clears inputs and returns to default state
```

### Constructor

The constructor accepts either:
- A `.w-form` wrapper element
- A `<form>` element (must be inside a `.w-form` wrapper)

### Methods

#### `setState(state: FormState): void`
Changes the form display state.

**Parameters:**
- `state` - One of `FormState.Default`, `FormState.Success`, or `FormState.Error`

#### `getWrapper(): HTMLElement`
Returns the `.w-form` wrapper element.

#### `getForm(): HTMLFormElement`
Returns the `<form>` element.

#### `getSuccessElement(): HTMLElement | null`
Returns the `.w-form-done` success message element.

#### `getErrorElement(): HTMLElement | null`
Returns the `.w-form-fail` error message element.

#### `isAutoMode(): boolean`
Returns whether automatic state management is enabled.

#### `reset(): void`
Resets the form inputs and returns to the default state.

## Automatic State Management

### `sse-form-mode-auto` Attribute

The `sse-form-mode-auto` attribute controls whether form state changes are managed automatically.

**Default behavior:** `true` (automatic mode enabled)

#### Auto Mode = `true` (default)

When enabled, form submission handlers should:
- Automatically call `setState(FormState.Success)` on successful submission
- Automatically call `setState(FormState.Error)` on failed submission
- Include delays (e.g., 1.5 seconds) before page refresh to show success/error messages

```html
<form id="my-form" sse-form-mode-auto="true">
  <!-- or omit the attribute entirely for default behavior -->
</form>
```

#### Auto Mode = `false` (manual mode)

When disabled, form submission handlers should:
- NOT automatically change form states
- NOT include delays before page refresh
- Allow manual control of form state display

```html
<form id="my-form" sse-form-mode-auto="false">
  <!-- Form will not automatically show success/error states -->
</form>
```

### Example: Form Submission with Auto Mode Check

```typescript
const webflowForm = new WebflowForm(formElement);
const form = webflowForm.getForm();

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      if (webflowForm.isAutoMode()) {
        // Auto mode: Show success and wait before refresh
        webflowForm.setState(FormState.Success);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        // Manual mode: Refresh immediately
        window.location.reload();
      }
    } else {
      if (webflowForm.isAutoMode()) {
        // Auto mode: Show error state
        webflowForm.setState(FormState.Error);
      }
    }
  } catch (error) {
    if (webflowForm.isAutoMode()) {
      webflowForm.setState(FormState.Error);
    }
  }
});
```

## Webflow Form Structure

The expected HTML structure:

```html
<div class="w-form">
  <form id="my-form" method="post" action="/api/endpoint">
    <!-- Form inputs -->
    <input type="submit" value="Submit" class="w-button">
  </form>

  <div class="w-form-done" tabindex="-1" role="region">
    <div>Thank you! Your submission has been received!</div>
  </div>

  <div class="w-form-fail" tabindex="-1" role="region">
    <div>Oops! Something went wrong while submitting the form.</div>
  </div>
</div>
```
