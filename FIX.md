# FIX - Functional Interactions System

FIX (Functional Interactions) is a declarative event-driven interaction system that connects user actions to behaviors through HTML attributes.

## Core Concepts

The FIX system involves three concepts:

1. **Event** - A label and dispatch mechanism (must conform to HTML ID formatting, e.g., no spaces)
2. **Trigger** - Something that invokes an event (e.g., a mouse click)
3. **Action** - Something that occurs when performed by an event

## How It Works

```
User Action → Trigger → Event → Action(s)
```

When a user performs an action (like clicking), the trigger captures it, fires the event, which then invokes all registered actions.

## Usage

### Basic Example

```html
<!-- Trigger: When this div is clicked, fire "show-modal" event -->
<div trigger:click="show-modal">Click me</div>

<!-- Action: When "show-modal" event fires, click this button -->
<button action:click="show-modal" id="modal-trigger">Hidden trigger</button>
```

### With Data Attributes

You can pass data from the trigger to actions using data attributes:

```html
<!-- Trigger with data -->
<a href="#"
   trigger:click="delete-item"
   trigger:click:data:item-id="abc123"
   trigger:click:data:item-name="Product Name">
   Delete
</a>

<!-- The action receives triggerData object: -->
<!-- { "item-id": "abc123", "item-name": "Product Name" } -->
```

## Available Triggers

### `trigger:click`

Fires an event when the element is clicked.

**Syntax:**
```html
<element trigger:click="event-name">Click me</element>
```

**Example:**
```html
<button trigger:click="submit-form">Submit</button>
```

## Available Actions

### `action:click`

Performs a click on the tagged element when the event fires.

**Syntax:**
```html
<element action:click="event-name">I will be clicked</element>
```

**Example:**
```html
<!-- When "submit-form" fires, this hidden button will be clicked -->
<button action:click="submit-form" style="display:none;">Hidden Submit</button>
```

## Architecture

### Directory Structure

```
src/fix/
├── index.ts                    # Main initialization
├── registry.ts                 # Decorators and registration
├── event-registry.ts           # Event management
├── trigger-base.ts            # Base trigger class
├── event-base.ts              # Base event class
├── action-base.ts             # Base action class
├── triggers/
│   └── trigger-click.ts       # Click trigger handler
├── actions/
│   └── action-click.ts        # Click action handler
└── events/
    └── event-default.ts       # Default event handler
```

### Trigger Flow

1. **Initialization** - `initializeFIX()` scans the DOM
2. **Registration** - Finds all `trigger:*` and `action:*` attributes
3. **Setup** - Instantiates handlers and binds event listeners
4. **Invocation** - User triggers event
5. **Data Collection** - Trigger composes data object
6. **Event Dispatch** - Event handler is invoked
7. **Action Execution** - All registered actions are triggered

### Data Flow

```typescript
// Trigger composes data from attributes
{
  "item-id": "abc123",
  "status": "active"
}

// Event receives trigger element + data
event.invoke(triggerElement, triggerData)

// Each action receives both
action.trigger(triggerElement, triggerData)
```

## Creating Custom Triggers

```typescript
import { TriggerBase } from '../trigger-base';
import { trigger } from '../registry';

@trigger('hover')
export class TriggerHover extends TriggerBase {
  init(): void {
    this.element.addEventListener('mouseenter', () => {
      this.invoke();
    });
  }
}
```

**Usage:**
```html
<div trigger:hover="show-tooltip">Hover me</div>
```

## Creating Custom Actions

```typescript
import { ActionBase } from '../action-base';
import { action } from '../registry';
import type { TriggerData } from '../trigger-base';

@action('show-alert')
export class ActionShowAlert extends ActionBase {
  init(): void {
    console.log('Alert action initialized');
  }

  trigger(triggerElement: HTMLElement, triggerData: TriggerData): void {
    const message = triggerData['message'] || 'Alert!';
    alert(message);
  }
}
```

**Usage:**
```html
<button trigger:click="alert-user"
        trigger:click:data:message="Hello World!">
  Click me
</button>

<!-- This action doesn't need an element -->
<script>
  // Register programmatically for non-element actions
</script>
```

## Creating Custom Events

Most cases work fine with the default event handler. For custom event logic:

```typescript
import { EventBase } from '../event-base';
import type { TriggerData } from '../trigger-base';

export class EventThrottled extends EventBase {
  private lastInvoke: number = 0;
  private throttleMs: number = 1000;

  invoke(triggerElement: HTMLElement, triggerData: TriggerData): void {
    const now = Date.now();
    if (now - this.lastInvoke < this.throttleMs) {
      console.log('Event throttled');
      return;
    }

    this.lastInvoke = now;
    this.actions.forEach(action => action.trigger(triggerElement, triggerData));
  }
}
```

## Advanced Patterns

### Multiple Actions for One Event

```html
<!-- One trigger -->
<button trigger:click="checkout">Checkout</button>

<!-- Multiple actions -->
<div action:click="checkout" id="loader">Loading...</div>
<form action:submit="checkout" id="payment-form"></form>
<button action:click="checkout" id="analytics-track"></button>
```

### Chaining Events

```html
<!-- Trigger first event -->
<button trigger:click="validate">Validate</button>

<!-- Action that triggers another event -->
<div action:click="validate" trigger:click="submit">Validation trigger</div>

<!-- Final action -->
<button action:click="submit">Submit Form</button>
```

### Data Transformation

```html
<a href="#"
   trigger:click="api-call"
   trigger:click:data:endpoint="/api/delete"
   trigger:click:data:method="DELETE"
   trigger:click:data:id="item-123">
   Delete
</a>
```

## Real-World Example

### Delete Listing with Loader

```html
<!-- Delete button with data -->
<button
  trigger:click="delete-listing-abc123"
  trigger:click:data:listing-id="abc123">
  Delete Listing
</button>

<!-- Show loader overlay -->
<div action:click="delete-listing-abc123" id="loader-trigger"></div>

<!-- Make API call (custom action) -->
<div action:api-delete="delete-listing-abc123"
     data-endpoint="/api/listings"></div>
```

## Debugging

Enable detailed logging by checking the browser console:

```
[FIX] Initializing Functional Interactions system
[FIX] Found 5 trigger(s) and 3 action(s)
[FIX] Initialized trigger: trigger:click -> event: my-event
[FIX] Initialized action: action:click -> event: my-event
[FIX Trigger] Invoking trigger trigger:click for event: my-event
[FIX Event] Event "my-event" invoked with data: {item-id: "123"}
```

## Performance Notes

- FIX scans the entire DOM on initialization
- Triggers use native event listeners (efficient)
- Events use in-memory registry (fast lookups)
- Actions execute synchronously (consider async for API calls)

## Future Trigger Types

- `trigger:scroll-into-view`
- `trigger:exit-intent`
- `trigger:mouse-enter`
- `trigger:mouse-exit`
- `trigger:timer`
- `trigger:form-submit`

## Future Action Types

- `action:api-call`
- `action:show-element`
- `action:hide-element`
- `action:toggle-class`
- `action:set-attribute`
- `action:dispatch-event`
