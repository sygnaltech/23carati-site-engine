/**
 * Utility functions for managing loading states
 */

/**
 * Displays a message by clicking the element with ID 'trigger-loader'
 * This should be called at the beginning of form submissions to show a loading message
 */
export function displayMessage(): void {



    const loaderTrigger = document.getElementById('trigger-loader');

  if (loaderTrigger) {
    console.log('[displayMessage] Clicking trigger-loader element');
    loaderTrigger.click();
  } else {
    console.warn('[displayMessage] Element with ID "trigger-loader" not found');
  }
}
