# Builder Pattern (Future Implementation)

## Status: Not Yet Implemented

This document is a placeholder for a future implementation of the **Builder Pattern** for Webflow elements.

## What Would the Builder Pattern Look Like?

The Builder Pattern would involve creating a separate builder class that constructs complex objects step-by-step, with a final `build()` method to create the instance.

### Hypothetical Example

```typescript
// Future implementation concept
const form = new WebflowFormBuilder()
  .withId("#my-form")
  .addHiddenFields({
    userId: "123",
    action: "submit"
  })
  .setEndpoint(api.url('/forms/contact'))
  .onSubmit({
    preSubmit: () => console.log("Submitting..."),
    onSuccess: () => alert("Success!")
  })
  .build();  // ← Separate construction step

// The builder would validate and construct the WebflowForm instance
```

## Current Implementation

We currently use **method chaining** (fluent interface), not the Builder Pattern:

```typescript
// What we have now (method chaining / fluent interface)
const form = WebflowForm.tryCreateFromId("#my-form");
if (form) {
  form
    .addHiddenFields({...})
    .setEndpoint(...)
    .onSubmit(...);
}
```

## Differences

| Feature | Current (Method Chaining) | Builder Pattern |
|---------|--------------------------|-----------------|
| Separate builder class | ❌ No | ✅ Yes |
| `build()` method | ❌ No | ✅ Yes |
| Validation timing | During each method | At `build()` time |
| Instance creation | Constructor | Builder's `build()` |
| Use case | Simple configuration | Complex multi-step construction |

## Why Might We Want This?

The Builder Pattern would be useful if:
- We need to validate the entire configuration before creating the instance
- We want to separate construction logic from the class itself
- We need to support multiple construction strategies
- We want to build complex objects with many optional parameters

## Current Documentation

See [ARCHITECTURE.md](./ARCHITECTURE.md) for documentation on the current implementation:
- Inheritance pattern with `WebflowElementBase`
- Static factory method `tryCreateFromId()`
- Method chaining (fluent interface)
- TypeScript generic typing
