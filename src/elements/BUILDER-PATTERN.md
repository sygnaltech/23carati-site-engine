# WebflowForm Builder Pattern

## Overview

The `WebflowForm` class uses the **builder pattern** to provide a fluent, chainable API for configuring and handling Webflow forms. This pattern allows you to set up complex form configurations in a clean, readable way.

## What is the Builder Pattern?

The builder pattern is a design pattern that allows you to construct complex objects step-by-step. Each method returns `this` (the instance itself), enabling **method chaining**:

```typescript
new WebflowForm(element)
  .addHiddenFields({ ... })
  .setEndpoint("...")
  .onSubmit("...", { ... });
```

## Core Methods

### Constructor

```typescript
new WebflowForm(element: HTMLElement)
```

Creates a new WebflowForm instance. Accepts either:
- A `.w-form` wrapper element
- A `<form>` element within a `.w-form` wrapper

### State Management

```typescript
setState(state: FormState): void
```

Set the form's visual state:
- `FormState.Default` - Show the form
- `FormState.Success` - Show success message
- `FormState.Error` - Show error message

```typescript
reset(): void
```

Reset the form to default state and clear all inputs.

### Form Manipulation (Builder Methods)

#### `addHiddenField(name: string, value: string): HTMLInputElement`

Add a single hidden field to the form:

```typescript
const input = webflowForm.addHiddenField("userId", "123");
```

#### `addHiddenFields(fields: Record<string, string>): this`

Add multiple hidden fields at once (returns `this` for chaining):

```typescript
webflowForm.addHiddenFields({
  memberstackId: config.memberstackId,
  listingId: "abc-123",
  action: "update"
});
```

#### `setEndpoint(endpoint: string): this`

Set the form's action URL (returns `this` for chaining):

```typescript
webflowForm.setEndpoint(api.url('/forms/submit'));
```

#### `onSubmit(endpoint: string, options?: {...}): this`

Set up the form submission handler with automatic success/error handling (returns `this` for chaining):

```typescript
webflowForm.onSubmit(endpoint, {
  preSubmit: () => void,           // Called before submission
  onSuccess: (response) => void,    // Called on successful response
  onError: (error) => void,         // Called on error
  method: "POST"                    // HTTP method (default: "POST")
});
```

### Getters

```typescript
getWrapper(): HTMLElement          // Get the .w-form wrapper
getForm(): HTMLFormElement         // Get the <form> element
getSuccessElement(): HTMLElement | null  // Get .w-form-done element
getErrorElement(): HTMLElement | null    // Get .w-form-fail element
isAutoMode(): boolean              // Check if auto mode is enabled
```

## Usage Examples

### Basic Form Setup

```typescript
const form = document.querySelector("#my-form");
new WebflowForm(form as HTMLElement)
  .addHiddenFields({
    userId: "123",
    action: "submit"
  })
  .onSubmit(api.url('/forms/contact'), {
    preSubmit: () => console.log("Submitting..."),
    onSuccess: () => alert("Success!"),
    onError: (error) => console.error(error)
  });
```

### Upload Form with Loader

```typescript
const uploadForm = document.querySelector("#upload-form");
new WebflowForm(uploadForm as HTMLElement)
  .addHiddenFields({
    memberstackId: config.memberstackId,
    listingId: pageInfo.itemSlug
  })
  .setEndpoint(api.url('/forms/upload-image'))
  .onSubmit(api.url('/forms/upload-image'), {
    preSubmit: () => showLoader("Uploading..."),
    onSuccess: () => {
      setTimeout(() => window.location.reload(), 1500);
    }
  });
```

### Update Form (No Page Reload)

```typescript
const updateForm = document.querySelector("#update-form");
new WebflowForm(updateForm as HTMLElement)
  .addHiddenFields({
    recordId: getCurrentRecordId()
  })
  .onSubmit(api.url('/forms/update'), {
    onSuccess: async (response) => {
      const data = await response.json();
      updateUI(data);
    },
    onError: (error) => {
      alert(`Update failed: ${error}`);
    }
  });
```

### Multiple Forms Setup

```typescript
// Set up multiple forms efficiently
const forms = [
  { selector: "#form-1", endpoint: "/api/form1" },
  { selector: "#form-2", endpoint: "/api/form2" },
  { selector: "#form-3", endpoint: "/api/form3" }
];

forms.forEach(({ selector, endpoint }) => {
  const formEl = document.querySelector(selector);
  if (formEl) {
    new WebflowForm(formEl as HTMLElement)
      .addHiddenFields({
        memberstackId: config.memberstackId,
        timestamp: Date.now().toString()
      })
      .onSubmit(api.url(endpoint), {
        preSubmit: () => showLoader(),
        onSuccess: () => window.location.reload()
      });
  }
});
```

## Auto Mode vs Manual Mode

The WebflowForm automatically detects the form mode via the `sse-form-mode-auto` attribute:

- **Auto mode** (default): Automatically shows success/error states
- **Manual mode**: You control the state transitions

```html
<!-- Auto mode (default) -->
<form id="my-form">...</form>

<!-- Manual mode -->
<form id="my-form" sse-form-mode-auto="false">...</form>
```

In manual mode, you can control state programmatically:

```typescript
const webflowForm = new WebflowForm(formEl as HTMLElement);

webflowForm.onSubmit(endpoint, {
  onSuccess: () => {
    // Manually control state
    webflowForm.setState(FormState.Success);
    setTimeout(() => {
      webflowForm.setState(FormState.Default);
    }, 3000);
  }
});
```

## Benefits of This Pattern

### 1. **Readability**
Clear, self-documenting code that reads like natural language:

```typescript
// Before (imperative)
const form = webflowForm.getForm();
const input1 = document.createElement("input");
input1.type = "hidden";
input1.name = "userId";
input1.value = "123";
form.appendChild(input1);
// ... repeat for each field ...

// After (declarative)
webflowForm.addHiddenFields({
  userId: "123",
  listingId: "abc"
});
```

### 2. **Consistency**
All forms follow the same setup pattern, making the codebase predictable.

### 3. **Maintainability**
Form logic is centralized in one class. Bug fixes benefit all forms.

### 4. **Flexibility**
Chain only the methods you need:

```typescript
// Simple form
new WebflowForm(el).onSubmit(endpoint);

// Complex form
new WebflowForm(el)
  .addHiddenFields({...})
  .setEndpoint(endpoint)
  .onSubmit(endpoint, {...});
```

### 5. **DRY Principle**
Eliminates repetitive form setup code throughout your application.

## Migration Guide

### Before (Old Pattern)

```typescript
const formEl = document.querySelector("#my-form");
const webflowForm = new WebflowForm(formEl as HTMLElement);
const form = webflowForm.getForm();

// Manually create hidden inputs
const input1 = document.createElement("input");
input1.type = "hidden";
input1.name = "userId";
input1.value = "123";
form.appendChild(input1);

const input2 = document.createElement("input");
input2.type = "hidden";
input2.name = "action";
input2.value = "submit";
form.appendChild(input2);

// Set endpoint
form.action = endpoint;

// Manual event listener
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  showLoader();

  const formData = new FormData(form);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData
    });

    if (response.ok) {
      if (webflowForm.isAutoMode()) {
        webflowForm.setState(FormState.Success);
      }
      window.location.reload();
    } else {
      if (webflowForm.isAutoMode()) {
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

### After (Builder Pattern)

```typescript
const formEl = document.querySelector("#my-form");
new WebflowForm(formEl as HTMLElement)
  .addHiddenFields({
    userId: "123",
    action: "submit"
  })
  .setEndpoint(endpoint)
  .onSubmit(endpoint, {
    preSubmit: () => showLoader(),
    onSuccess: () => window.location.reload()
  });
```

**Result:** ~35 lines reduced to ~10 lines, with the same functionality!

## Best Practices

1. **Keep chains readable** - Break long chains into multiple lines
2. **Use descriptive endpoint names** - Store in constants or config
3. **Handle errors gracefully** - Always provide `onError` callback
4. **Test both auto and manual modes** - Ensure state transitions work correctly
5. **Reuse hidden field objects** - Define common fields once:

```typescript
const commonFields = {
  memberstackId: config.memberstackId,
  timestamp: Date.now().toString()
};

new WebflowForm(form1).addHiddenFields(commonFields).onSubmit(...);
new WebflowForm(form2).addHiddenFields(commonFields).onSubmit(...);
```

## Related Patterns

- **Fluent Interface**: The chaining mechanism used in this pattern
- **Method Chaining**: Each builder method returns `this`
- **Facade Pattern**: Simplifies the complex form setup process

## See Also

- [webflow-form.ts](./webflow-form.ts) - Full implementation
- [listings.ts](../pages/listings.ts) - Real-world usage examples
