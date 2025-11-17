# FIX Debugging Guide

This guide shows you how to inspect and debug the FIX (Functional Interactions) system from the browser console.

## Overview

The FIX system exposes a global `FIXDebug` object on `window` that provides various methods to inspect triggers, actions, and events.

## Available Debug Methods

### `FIXDebug.triggerTypes()`

Lists all registered **trigger handler types** (the types of triggers available to use).

**Returns:** Array of trigger type names

**Example:**
```javascript
FIXDebug.triggerTypes()
// Console output: Registered Trigger Types: ["click"]
// Returns: ["click"]
```

This shows which trigger types you can use in HTML attributes (e.g., `trigger:click`).

---

### `FIXDebug.actionTypes()`

Lists all registered **action handler types** (the types of actions available to use).

**Returns:** Array of action type names

**Example:**
```javascript
FIXDebug.actionTypes()
// Console output: Registered Action Types: ["click"]
// Returns: ["click"]
```

This shows which action types you can use in HTML attributes (e.g., `action:click`).

---

### `FIXDebug.triggers()`

Lists all **active trigger instances** currently on the page.

**Returns:** Array of trigger instance objects

**Example:**
```javascript
FIXDebug.triggers()
// Console output:
// Active Triggers (3):
// ┌─────────┬─────────────────┬─────────────────┬─────────────────┐
// │ (index) │   attribute     │   eventName     │    element      │
// ├─────────┼─────────────────┼─────────────────┼─────────────────┤
// │    0    │ 'trigger:click' │ 'delete-item'   │ 'BUTTON#del-1'  │
// │    1    │ 'trigger:click' │ 'show-modal'    │ 'DIV'           │
// │    2    │ 'trigger:click' │ 'delete-item'   │ 'A#delete-link' │
// └─────────┴─────────────────┴─────────────────┴─────────────────┘
```

**Each trigger object contains:**
- `instance` - The trigger handler instance
- `element` - The HTMLElement the trigger is attached to
- `attribute` - The trigger attribute (e.g., "trigger:click")
- `eventName` - The event this trigger fires

---

### `FIXDebug.actions()`

Lists all **active action instances** currently on the page.

**Returns:** Array of action instance objects

**Example:**
```javascript
FIXDebug.actions()
// Console output:
// Active Actions (2):
// ┌─────────┬────────────────┬───────────────┬──────────────────┐
// │ (index) │   attribute    │  eventName    │    element       │
// ├─────────┼────────────────┼───────────────┼──────────────────┤
// │    0    │ 'action:click' │ 'delete-item' │ 'DIV#loader'     │
// │    1    │ 'action:click' │ 'show-modal'  │ 'BUTTON#modal'   │
// └─────────┴────────────────┴───────────────┴──────────────────┘
```

**Each action object contains:**
- `instance` - The action handler instance
- `element` - The HTMLElement the action is attached to (or null)
- `attribute` - The action attribute (e.g., "action:click")
- `eventName` - The event this action is registered to

---

### `FIXDebug.events()`

Lists all **registered events** in the system.

**Returns:** Array of event names

**Example:**
```javascript
FIXDebug.events()
// Console output: Registered Events: ["delete-item", "show-modal", "submit-form"]
// Returns: ["delete-item", "show-modal", "submit-form"]
```

Events are created automatically when triggers or actions reference them.

---

### `FIXDebug.stats()`

Returns comprehensive statistics about the FIX system.

**Returns:** Object with complete FIX statistics

**Example:**
```javascript
FIXDebug.stats()
// Console output:
// FIX Statistics: {
//   triggerTypes: ["click"],
//   actionTypes: ["click"],
//   events: ["delete-item", "show-modal"],
//   activeTriggers: 3,
//   activeActions: 2
// }
```

**Statistics object contains:**
- `triggerTypes` - Array of available trigger handler types
- `actionTypes` - Array of available action handler types
- `events` - Array of registered event names
- `activeTriggers` - Number of active trigger instances on page
- `activeActions` - Number of active action instances on page

---

## Common Debugging Workflows

### Check if FIX is Initialized

```javascript
FIXDebug.stats()
// Should show counts > 0 if FIX found elements
```

### Find All Triggers for a Specific Event

```javascript
FIXDebug.triggers()
  .filter(t => t.eventName === 'delete-item')
// Returns only triggers that fire 'delete-item' event
```

### Find All Actions for a Specific Event

```javascript
FIXDebug.actions()
  .filter(a => a.eventName === 'show-modal')
// Returns only actions listening to 'show-modal' event
```

### See Which Elements Have Triggers

```javascript
FIXDebug.triggers()
  .map(t => t.element)
// Returns array of all elements with triggers
```

### Inspect a Specific Trigger Instance

```javascript
const triggers = FIXDebug.triggers()
const firstTrigger = triggers[0]

console.log('Element:', firstTrigger.element)
console.log('Event Name:', firstTrigger.eventName)
console.log('Attribute:', firstTrigger.attribute)
console.log('Instance:', firstTrigger.instance)
```

### Check Event Flow

```javascript
// 1. Find what triggers fire an event
FIXDebug.triggers()
  .filter(t => t.eventName === 'delete-item')

// 2. Find what actions listen to that event
FIXDebug.actions()
  .filter(a => a.eventName === 'delete-item')

// This shows the complete flow from trigger to actions
```

### Verify Event Connections

```javascript
const eventName = 'delete-item'

const hasTrigger = FIXDebug.triggers()
  .some(t => t.eventName === eventName)

const hasAction = FIXDebug.actions()
  .some(a => a.eventName === eventName)

console.log(`Event "${eventName}" is ${hasTrigger ? 'triggered' : 'NOT triggered'}`)
console.log(`Event "${eventName}" has ${hasAction ? 'actions' : 'NO actions'}`)
```

## Troubleshooting

### No Triggers/Actions Found

If `FIXDebug.triggers()` or `FIXDebug.actions()` return empty arrays:

1. **Check HTML attributes:**
   ```javascript
   // Search for elements with trigger attributes
   document.querySelectorAll('[trigger\\:click]')
   ```

2. **Verify FIX initialized:**
   ```javascript
   FIXDebug.stats()
   // Check if triggerTypes/actionTypes are registered
   ```

3. **Check console for errors:**
   - Look for `[FIX]` log messages during page load
   - Check for warnings about unknown trigger/action types

### Event Not Firing

If a trigger doesn't fire an event:

1. **Verify trigger is registered:**
   ```javascript
   FIXDebug.triggers().find(t => t.element === yourElement)
   ```

2. **Check event name:**
   ```javascript
   FIXDebug.events()
   // Verify your event name is listed
   ```

3. **Verify actions are registered:**
   ```javascript
   FIXDebug.actions().filter(a => a.eventName === 'your-event')
   ```

### Action Not Executing

If an action doesn't execute when event fires:

1. **Check action is registered to the correct event:**
   ```javascript
   FIXDebug.actions()
     .filter(a => a.eventName === 'your-event')
   ```

2. **Verify element exists:**
   ```javascript
   const action = FIXDebug.actions()[0]
   console.log('Action element:', action.element)
   console.log('Element in DOM:', document.contains(action.element))
   ```

## Console Logging

The FIX system includes comprehensive logging. Look for these console messages:

**Initialization:**
```
[FIX] Initializing Functional Interactions system
[FIX] Found 5 trigger(s) and 3 action(s)
[FIX Registry] Trigger registered: click
[FIX Registry] Action registered: click
```

**Trigger Setup:**
```
[FIX Trigger:Click] Initializing click trigger for event: delete-item
[FIX] Initialized trigger: trigger:click -> event: delete-item
```

**Action Setup:**
```
[FIX Action:Click] Initializing click action on element: <button>
[FIX Event] Registered action with event: delete-item
[FIX] Initialized action: action:click -> event: delete-item
```

**Runtime:**
```
[FIX Trigger] Invoking trigger trigger:click for event: delete-item
[FIX Trigger] Composed data: {item-id: "123", status: "active"}
[FIX Event] Event "delete-item" invoked with data: {item-id: "123"}
[FIX Event] Triggering action 1/2
[FIX Action:Click] Triggering click action
[FIX Action:Click] Clicking element: <button>
```

## Advanced Inspection

### Access Trigger Data Collection

```javascript
// Triggers compose data from attributes
// You can see this in the console when a trigger fires
// Look for: [FIX Trigger] Composed data: {...}
```

### Inspect Event Registry Directly

```javascript
// Access the underlying event registry
const events = FIXDebug.events()
console.log('All registered events:', events)
```

### Check Handler Types

```javascript
console.log('Available Triggers:', FIXDebug.triggerTypes())
console.log('Available Actions:', FIXDebug.actionTypes())
```

## Best Practices

1. **Use stats() first** - Get an overview before diving into details
2. **Use table output** - triggers() and actions() show nice tables
3. **Filter results** - Use .filter() to find specific instances
4. **Check event flow** - Verify triggers → event → actions chain
5. **Watch console logs** - Enable verbose logging to see execution flow

## Example Debugging Session

```javascript
// 1. Get overview
FIXDebug.stats()
// Output: 3 triggers, 2 actions, 2 events

// 2. List all events
FIXDebug.events()
// Output: ["delete-item", "show-modal"]

// 3. Check delete-item flow
FIXDebug.triggers().filter(t => t.eventName === 'delete-item')
// Output: Shows which elements trigger this event

FIXDebug.actions().filter(a => a.eventName === 'delete-item')
// Output: Shows which actions respond to this event

// 4. Inspect specific trigger
const deleteTrigger = FIXDebug.triggers()
  .find(t => t.eventName === 'delete-item')
console.log('Delete trigger element:', deleteTrigger.element)
console.log('Delete trigger data attrs:',
  Array.from(deleteTrigger.element.attributes)
    .filter(a => a.name.includes('data'))
)
```
