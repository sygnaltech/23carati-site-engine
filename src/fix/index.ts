/**
 * FIX - Functional Interactions
 * Main initialization and processing system
 */

import { FIXRegistry } from './registry';
import { EventRegistry } from './event-registry';
import { EventDefault } from './events/event-default';
import { EventSequential } from './events/event-sequential';

// Import all trigger and action handlers to register them via decorators
import './triggers/trigger-click';
import './actions/action-click';
import { ActionDeleteListing } from './actions/delete-listing';
import { ActionSetStatus } from './actions/set-status';

import type { TriggerBase } from './trigger-base';
import type { ActionBase } from './action-base';

/**
 * Storage for active trigger and action instances
 */
const activeTriggers: Array<{ instance: TriggerBase; element: HTMLElement; attribute: string; eventName: string }> = [];
const activeActions: Array<{ instance: ActionBase; element: HTMLElement | null; attribute: string; eventName: string }> = [];

/**
 * Debug helpers for inspecting the FIX system from console
 */
export const FIXDebug = {
  /**
   * List all registered trigger handler TYPES
   */
  triggerTypes: () => {
    const triggers = FIXRegistry.getTriggerNames();
    console.log('Registered Trigger Types:', triggers);
    return triggers;
  },

  /**
   * List all registered action handler TYPES
   */
  actionTypes: () => {
    const actions = FIXRegistry.getActionNames();
    console.log('Registered Action Types:', actions);
    return actions;
  },

  /**
   * List all active trigger INSTANCES on the page
   */
  triggers: () => {
    console.log(`Active Triggers (${activeTriggers.length}):`, activeTriggers);
    console.table(activeTriggers.map(t => ({
      attribute: t.attribute,
      eventName: t.eventName,
      element: t.element.tagName + (t.element.id ? `#${t.element.id}` : '')
    })));
    return activeTriggers;
  },

  /**
   * List all active action INSTANCES on the page
   */
  actions: () => {
    console.log(`Active Actions (${activeActions.length}):`, activeActions);
    console.table(activeActions.map(a => ({
      attribute: a.attribute,
      eventName: a.eventName,
      element: a.element ? a.element.tagName + (a.element.id ? `#${a.element.id}` : '') : 'null'
    })));
    return activeActions;
  },

  /**
   * List all registered events
   */
  events: () => {
    const events = EventRegistry.getEventNames();
    console.log('Registered Events:', events);
    return events;
  },

  /**
   * Get complete FIX stats
   */
  stats: () => {
    const stats = {
      triggerTypes: FIXRegistry.getTriggerNames(),
      actionTypes: FIXRegistry.getActionNames(),
      events: EventRegistry.getEventNames(),
      activeTriggers: activeTriggers.length,
      activeActions: activeActions.length
    };
    console.log('FIX Statistics:', stats);
    return stats;
  }
};

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

      // Store the active trigger instance
      activeTriggers.push({ instance: triggerInstance, element, attribute, eventName });

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

      // Store the active action instance
      activeActions.push({ instance: actionInstance, element, attribute, eventName });

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

  // Register programmatic actions (non-element actions)
  registerProgrammaticAction('delete-listing', 'delete-listing', ActionDeleteListing);
  registerProgrammaticAction('set-status', 'set-status', ActionSetStatus);

  console.log(`[FIX] Initialization complete. Events: ${EventRegistry.getEventNames().join(', ')}`);
}

/**
 * Register a programmatic action that doesn't need an HTML element
 * @param actionType The action type (e.g., "set-status")
 * @param eventName The event name to listen to
 * @param ActionConstructor The action class constructor
 */
function registerProgrammaticAction(
  actionType: string,
  eventName: string,
  ActionConstructor: new (element: HTMLElement | null, attributeName: string) => ActionBase
): void {
  console.log(`[FIX] Registering programmatic action: ${actionType} -> event: ${eventName}`);

  // Ensure event exists in registry
  ensureEvent(eventName);

  // Instantiate the action with null element
  const actionInstance = new ActionConstructor(null, `action:${actionType}`);
  actionInstance.init();

  // Store the active action instance
  activeActions.push({ instance: actionInstance, element: null, attribute: `action:${actionType}`, eventName });

  // Register the action with the event
  const event = EventRegistry.getEvent(eventName);
  if (event) {
    event.registerAction(actionInstance);
  }

  console.log(`[FIX] Registered programmatic action: action:${actionType} -> event: ${eventName}`);
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
export { EventDefault } from './events/event-default';
export { EventSequential } from './events/event-sequential';
export type { TriggerData } from './trigger-base';
