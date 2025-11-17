/**
 * FIX - Functional Interactions
 * Main initialization and processing system
 */

import { FIXRegistry } from './registry';
import { EventRegistry } from './event-registry';
import { EventDefault } from './events/event-default';

// Import all trigger and action handlers to register them via decorators
import './triggers/trigger-click';
import './actions/action-click';

/**
 * Initialize the FIX system by scanning the DOM for trigger and action attributes
 */
export function initializeFIX(): void {
  console.log('[FIX] Initializing Functional Interactions system');

  // Find all elements with trigger: or action: attributes
  const allElements = document.querySelectorAll('*');
  const triggerElements: Array<{ element: HTMLElement; attribute: string; eventName: string }> = [];
  const actionElements: Array<{ element: HTMLElement; attribute: string; eventName: string }> = [];

  // Scan all elements for trigger: and action: attributes
  allElements.forEach((el) => {
    const element = el as HTMLElement;

    Array.from(element.attributes).forEach((attr) => {
      // Check for trigger: attributes
      if (attr.name.startsWith('trigger:')) {
        const parts = attr.name.split(':');
        if (parts.length >= 2 && parts[2] !== 'data') {
          // This is a trigger attribute (not a data attribute)
          const triggerType = parts[1];
          const eventName = attr.value;

          triggerElements.push({
            element,
            attribute: `trigger:${triggerType}`,
            eventName
          });
        }
      }

      // Check for action: attributes
      if (attr.name.startsWith('action:')) {
        const parts = attr.name.split(':');
        if (parts.length >= 2) {
          // This is an action attribute
          const actionType = parts[1];
          const eventName = attr.value;

          actionElements.push({
            element,
            attribute: `action:${actionType}`,
            eventName
          });
        }
      }
    });
  });

  console.log(`[FIX] Found ${triggerElements.length} trigger(s) and ${actionElements.length} action(s)`);

  // Process triggers
  triggerElements.forEach(({ element, attribute, eventName }) => {
    const triggerType = attribute.split(':')[1];
    const TriggerConstructor = FIXRegistry.getTrigger(triggerType);

    if (TriggerConstructor) {
      // Ensure event exists in registry
      ensureEvent(eventName);

      // Instantiate and initialize the trigger
      const triggerInstance = new TriggerConstructor(element, eventName, attribute);
      triggerInstance.init();

      console.log(`[FIX] Initialized trigger: ${attribute} -> event: ${eventName}`);
    } else {
      console.warn(`[FIX] Unknown trigger type: ${triggerType}`);
    }
  });

  // Process actions
  actionElements.forEach(({ element, attribute, eventName }) => {
    const actionType = attribute.split(':')[1];
    const ActionConstructor = FIXRegistry.getAction(actionType);

    if (ActionConstructor) {
      // Ensure event exists in registry
      ensureEvent(eventName);

      // Instantiate and initialize the action
      const actionInstance = new ActionConstructor(element, attribute);
      actionInstance.init();

      // Register the action with the event
      const event = EventRegistry.getEvent(eventName);
      if (event) {
        event.registerAction(actionInstance);
      }

      console.log(`[FIX] Initialized action: ${attribute} -> event: ${eventName}`);
    } else {
      console.warn(`[FIX] Unknown action type: ${actionType}`);
    }
  });

  console.log(`[FIX] Initialization complete. Events: ${EventRegistry.getEventNames().join(', ')}`);
}

/**
 * Ensure an event exists in the registry, creating it with default handler if needed
 * @param eventName The name of the event
 */
function ensureEvent(eventName: string): void {
  if (!EventRegistry.hasEvent(eventName)) {
    const event = new EventDefault(eventName);
    EventRegistry.registerEvent(eventName, event);
  }
}

// Export all types and classes for external use
export { FIXRegistry, trigger, action } from './registry';
export { EventRegistry } from './event-registry';
export { TriggerBase } from './trigger-base';
export { EventBase } from './event-base';
export { ActionBase } from './action-base';
export type { TriggerData } from './trigger-base';
