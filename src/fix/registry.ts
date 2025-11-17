/**
 * FIX - Functional Interactions
 * Registry and Decorators for Triggers and Actions
 */

import type { TriggerBase } from './trigger-base';
import type { ActionBase } from './action-base';

type TriggerConstructor = new (element: HTMLElement, eventName: string, attributeName: string) => TriggerBase;
type ActionConstructor = new (element: HTMLElement | null, attributeName: string) => ActionBase;

/**
 * Registry for trigger and action handlers
 */
export class FIXRegistry {
  private static triggers: Map<string, TriggerConstructor> = new Map();
  private static actions: Map<string, ActionConstructor> = new Map();

  /**
   * Register a trigger handler
   * @param name The trigger name (e.g., "click", "scroll")
   * @param constructor The trigger class constructor
   */
  static registerTrigger(name: string, constructor: TriggerConstructor): void {
    this.triggers.set(name, constructor);
    console.log(`[FIX Registry] Trigger registered: ${name}`);
  }

  /**
   * Register an action handler
   * @param name The action name (e.g., "click", "api-call")
   * @param constructor The action class constructor
   */
  static registerAction(name: string, constructor: ActionConstructor): void {
    this.actions.set(name, constructor);
    console.log(`[FIX Registry] Action registered: ${name}`);
  }

  /**
   * Get a trigger constructor by name
   * @param name The trigger name
   * @returns The trigger constructor, or undefined if not found
   */
  static getTrigger(name: string): TriggerConstructor | undefined {
    return this.triggers.get(name);
  }

  /**
   * Get an action constructor by name
   * @param name The action name
   * @returns The action constructor, or undefined if not found
   */
  static getAction(name: string): ActionConstructor | undefined {
    return this.actions.get(name);
  }

  /**
   * Get all registered trigger names
   */
  static getTriggerNames(): string[] {
    return Array.from(this.triggers.keys());
  }

  /**
   * Get all registered action names
   */
  static getActionNames(): string[] {
    return Array.from(this.actions.keys());
  }
}

/**
 * Decorator for registering trigger handlers
 * @param name The trigger name (e.g., "click")
 *
 * @example
 * @trigger('click')
 * export class TriggerClick extends TriggerBase { }
 */
export function trigger(name: string) {
  return function <T extends TriggerConstructor>(constructor: T): T {
    FIXRegistry.registerTrigger(name, constructor);
    return constructor;
  };
}

/**
 * Decorator for registering action handlers
 * @param name The action name (e.g., "click")
 *
 * @example
 * @action('click')
 * export class ActionClick extends ActionBase { }
 */
export function action(name: string) {
  return function <T extends ActionConstructor>(constructor: T): T {
    FIXRegistry.registerAction(name, constructor);
    return constructor;
  };
}
