/**
 * Memberstack Helper Utility
 *
 * Provides type-safe access to the Memberstack SDK for retrieving
 * the currently logged-in member's information.
 */

/**
 * TypeScript definitions for Memberstack SDK
 */
interface MemberstackMember {
  id: string;
  auth: {
    id: string;
    email: string;
    verified: boolean;
  };
  customFields?: Record<string, any>;
  metaData?: Record<string, any>;
}

interface MemberstackSDK {
  getCurrentMember(): Promise<MemberstackMember | null>;
  getMemberCookie(): string | null;
  logout(): Promise<void>;
  // Add other SDK methods as needed
}

declare global {
  interface Window {
    $memberstackDom?: MemberstackSDK;
  }
}

/**
 * Wait for Memberstack SDK to be loaded and ready
 * @param timeout Maximum time to wait in milliseconds (default: 5000)
 * @returns Promise that resolves when SDK is ready
 */
async function waitForMemberstackSDK(timeout: number = 5000): Promise<MemberstackSDK> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const checkSDK = () => {
      if (window.$memberstackDom) {
        resolve(window.$memberstackDom);
        return;
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error('Memberstack SDK failed to load within timeout'));
        return;
      }

      setTimeout(checkSDK, 100);
    };

    checkSDK();
  });
}

/**
 * Get the current logged-in member's ID
 * @returns Promise<string | null> - Member ID or null if not logged in
 * @throws Error if SDK fails to load
 */
export async function getCurrentMemberId(): Promise<string | null> {
  try {
    const sdk = await waitForMemberstackSDK();
    const member = await sdk.getCurrentMember();

    if (!member) {
      console.warn('[Memberstack] No member is currently logged in');
      return null;
    }

    // Debug: Log the full member object to find the correct property
    console.log('[Memberstack] Full member object:', member);
    console.log('[Memberstack] member.id:', member.id);
    console.log('[Memberstack] member.data?.id:', (member as any).data?.id);
    console.log('[Memberstack] member.auth?.id:', (member as any).auth?.id);

    // Try different possible property paths
    const memberId = member.id || (member as any).data?.id || (member as any).auth?.id;

    if (!memberId) {
      console.error('[Memberstack] Member object exists but no ID found');
      return null;
    }

    console.log('[Memberstack] Retrieved member ID:', memberId);
    return memberId;
  } catch (error) {
    console.error('[Memberstack] Failed to get current member:', error);
    throw error;
  }
}

/**
 * Get the current logged-in member's JWT token
 * @returns Promise<string | null> - JWT token or null if not logged in
 * @throws Error if SDK fails to load
 */
export async function getCurrentMemberToken(): Promise<string | null> {
  try {
    const sdk = await waitForMemberstackSDK();

    // Get the JWT token from the cookie
    const token = sdk.getMemberCookie();

    if (!token) {
      console.warn('[Memberstack] No token available (user may not be logged in)');
      return null;
    }

    console.log('[Memberstack] Retrieved member token from cookie');
    return token;
  } catch (error) {
    console.error('[Memberstack] Failed to get member token:', error);
    throw error;
  }
}

/**
 * Get the complete current member object
 * @returns Promise<MemberstackMember | null> - Full member object or null
 */
export async function getCurrentMember(): Promise<MemberstackMember | null> {
  try {
    const sdk = await waitForMemberstackSDK();
    const member = await sdk.getCurrentMember();
    return member;
  } catch (error) {
    console.error('[Memberstack] Failed to get current member:', error);
    throw error;
  }
}

/**
 * Check if a user is currently logged in
 * @returns Promise<boolean>
 */
export async function isLoggedIn(): Promise<boolean> {
  try {
    const memberId = await getCurrentMemberId();
    return memberId !== null;
  } catch (error) {
    console.error('[Memberstack] Failed to check login status:', error);
    return false;
  }
}
