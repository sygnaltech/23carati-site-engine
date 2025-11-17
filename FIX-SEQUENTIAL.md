# FIX Sequential Events

## Overview

FIX supports two event execution modes:

1. **Parallel (Default)** - All actions trigger simultaneously (fire-and-forget)
2. **Sequential** - Actions execute one at a time, waiting for each to complete

## EventDefault (Parallel Execution)

The default event handler executes all actions in parallel without waiting for them to complete.

**Characteristics:**
- Fast execution - all actions trigger immediately
- No guaranteed order
- Actions run independently
- Ideal for: UI changes, animations, sounds, tab switches

**Automatically used** when you reference an event name - it's created with EventDefault.

**Example:**
```html
<!-- All three actions happen simultaneously -->
<button trigger:click="show-panel">Open</button>
<div action:show="show-panel" class="panel"></div>
<div action:play-sound="show-panel" data-sound="swoosh.mp3"></div>
<div action:scroll-to="show-panel" data-target="#content"></div>
```

## EventSequential (Sequential Execution)

An async event handler that executes actions one at a time, waiting for each to complete before starting the next.

**Characteristics:**
- Sequential execution - actions run in order
- Waits for async operations (API calls, delays)
- Guaranteed order
- Error handling continues to next action
- Ideal for: playlists, coordinated sequences, API workflows

## Usage

### Registering Sequential Events

Sequential events must be registered programmatically during initialization:

```typescript
import { EventRegistry, EventSequential } from './fix';

// In your page's onLoad() or during initialization
EventRegistry.registerEvent('playlist', new EventSequential('playlist'));
EventRegistry.registerEvent('api-workflow', new EventSequential('api-workflow'));
```

### Example - Audio Playlist

```typescript
// In page initialization
import { EventRegistry, EventSequential } from './fix';

EventRegistry.registerEvent('audio-playlist', new EventSequential('audio-playlist'));
```

```html
<!-- Trigger the playlist -->
<button trigger:click="audio-playlist">Play Sequence</button>

<!-- Actions execute one at a time, each waiting for the previous -->
<audio action:play="audio-playlist" src="intro.mp3"></audio>
<audio action:play="audio-playlist" src="main.mp3"></audio>
<audio action:play="audio-playlist" src="outro.mp3"></audio>
```

**Execution flow:**
1. User clicks button
2. First audio plays completely
3. Second audio starts and plays completely
4. Third audio starts and plays completely

### Example - Multi-Step API Workflow

```typescript
// In page initialization
import { EventRegistry, EventSequential } from './fix';

EventRegistry.registerEvent('multi-step-submit', new EventSequential('multi-step-submit'));
```

```html
<!-- Trigger workflow -->
<button trigger:click="multi-step-submit"
        trigger:click:data:user-id="123">
  Submit All
</button>

<!-- Actions execute in order, waiting for each API call -->
<div action:api-validate="multi-step-submit"></div>
<div action:api-process="multi-step-submit"></div>
<div action:api-notify="multi-step-submit"></div>
```

**Execution flow:**
1. User clicks button with user-id data
2. Validation action runs (waits for API response)
3. Process action runs (waits for API response)
4. Notify action runs (waits for API response)

### Example - Coordinated Animation Sequence

```typescript
// In page initialization
import { EventRegistry, EventSequential } from './fix';

EventRegistry.registerEvent('reveal-sequence', new EventSequential('reveal-sequence'));
```

```html
<!-- Trigger sequence -->
<button trigger:click="reveal-sequence">Reveal</button>

<!-- Each animation waits for previous to complete -->
<div action:fade-in="reveal-sequence" class="step-1"></div>
<div action:fade-in="reveal-sequence" class="step-2"></div>
<div action:fade-in="reveal-sequence" class="step-3"></div>
```

## Error Handling

EventSequential includes built-in error handling that continues execution even if an action fails:

```typescript
// Inside EventSequential
for (let i = 0; i < this.actions.length; i++) {
  const action = this.actions[i];
  try {
    await action.trigger(triggerElement, triggerData);
    console.log(`Action ${i + 1} completed`);
  } catch (error) {
    console.error(`Action ${i + 1} failed:`, error);
    // Continues to next action even after error
  }
}
```

**Example with error:**
```
[FIX Event:Sequential] Running 3 action(s) sequentially
[FIX Event:Sequential] Triggering action 1/3
[FIX Event:Sequential] Action 1/3 completed
[FIX Event:Sequential] Triggering action 2/3
[FIX Event:Sequential] Action 2 failed: Network error
[FIX Event:Sequential] Triggering action 3/3
[FIX Event:Sequential] Action 3/3 completed
[FIX Event:Sequential] All actions completed
```

This ensures that one failing action doesn't block the entire sequence.

## When to Use Sequential vs Parallel

### Use Parallel (EventDefault) when:
- Actions are independent
- Order doesn't matter
- Speed is important
- Examples:
  - Multiple UI updates
  - Playing sounds
  - Triggering animations
  - Tab switches
  - Showing/hiding elements

### Use Sequential (EventSequential) when:
- Actions depend on previous actions completing
- Order is critical
- You need to wait for async operations
- Examples:
  - Audio/video playlists
  - Multi-step form submissions
  - Coordinated API workflows
  - Sequential animations with precise timing
  - Step-by-step guided tours

## Console Logging

EventSequential provides detailed logging:

```
[FIX Event:Sequential] Event "playlist" invoked with data: {...}
[FIX Event:Sequential] Running 3 action(s) sequentially
[FIX Event:Sequential] Triggering action 1/3
[FIX Event:Sequential] Action 1/3 completed
[FIX Event:Sequential] Triggering action 2/3
[FIX Event:Sequential] Action 2/3 completed
[FIX Event:Sequential] Triggering action 3/3
[FIX Event:Sequential] Action 3/3 completed
[FIX Event:Sequential] All actions completed
```

This makes it easy to debug sequential execution and identify which action is taking time or failing.

## Implementation Details

### Base Classes Support Async

Both `EventBase` and `ActionBase` support async execution:

```typescript
// EventBase.invoke() can be sync or async
abstract invoke(triggerElement: HTMLElement, triggerData: TriggerData): void | Promise<void>;

// ActionBase.trigger() can be sync or async
abstract trigger(triggerElement: HTMLElement, triggerData: TriggerData): void | Promise<void>;
```

This allows:
- Synchronous actions (like clicking elements) to execute immediately
- Asynchronous actions (like API calls) to return promises
- EventSequential to await async actions
- EventDefault to fire-and-forget both sync and async actions

### EventSequential Implementation

```typescript
export class EventSequential extends EventBase {
  async invoke(triggerElement: HTMLElement, triggerData: TriggerData): Promise<void> {
    console.log(`[FIX Event:Sequential] Event "${this.eventName}" invoked`);

    if (this.actions.length === 0) {
      console.warn(`[FIX Event:Sequential] Event "${this.eventName}" has no actions`);
      return;
    }

    console.log(`[FIX Event:Sequential] Running ${this.actions.length} action(s) sequentially`);

    // Invoke each action sequentially, waiting for each to complete
    for (let i = 0; i < this.actions.length; i++) {
      const action = this.actions[i];
      console.log(`[FIX Event:Sequential] Triggering action ${i + 1}/${this.actions.length}`);

      try {
        await action.trigger(triggerElement, triggerData);
        console.log(`[FIX Event:Sequential] Action ${i + 1} completed`);
      } catch (error) {
        console.error(`[FIX Event:Sequential] Action ${i + 1} failed:`, error);
        // Continue to next action even if one fails
      }
    }

    console.log(`[FIX Event:Sequential] All actions completed`);
  }
}
```

### EventDefault Implementation (for comparison)

```typescript
export class EventDefault extends EventBase {
  invoke(triggerElement: HTMLElement, triggerData: TriggerData): void {
    console.log(`[FIX Event] Event "${this.eventName}" invoked`);

    if (this.actions.length === 0) {
      console.warn(`[FIX Event] Event "${this.eventName}" has no actions`);
      return;
    }

    console.log(`[FIX Event] Triggering ${this.actions.length} action(s)`);

    // Invoke all actions without waiting (fire-and-forget)
    this.actions.forEach((action, index) => {
      console.log(`[FIX Event] Triggering action ${index + 1}/${this.actions.length}`);
      action.trigger(triggerElement, triggerData);
    });
  }
}
```

## Complete Example

Here's a complete example showing how to set up and use sequential events in a page:

```typescript
// src/pages/my-page.ts
import { PageBase, page } from '@sygnal/sse';
import { EventRegistry, EventSequential } from '../fix';

@page('my-page')
export class MyPage extends PageBase {
  protected onLoad(): void {
    console.log('[MyPage] Initializing page');

    // Register sequential events for this page
    EventRegistry.registerEvent('audio-playlist', new EventSequential('audio-playlist'));
    EventRegistry.registerEvent('api-workflow', new EventSequential('api-workflow'));

    console.log('[MyPage] Sequential events registered');
  }
}
```

```html
<!-- In the HTML -->
<div data-page="my-page">
  <!-- Audio Playlist -->
  <button trigger:click="audio-playlist">Play Music</button>
  <audio action:play="audio-playlist" src="track1.mp3"></audio>
  <audio action:play="audio-playlist" src="track2.mp3"></audio>
  <audio action:play="audio-playlist" src="track3.mp3"></audio>

  <!-- API Workflow -->
  <button trigger:click="api-workflow"
          trigger:click:data:user-id="123">
    Submit
  </button>
  <div action:validate="api-workflow"></div>
  <div action:process="api-workflow"></div>
  <div action:notify="api-workflow"></div>
</div>
```
