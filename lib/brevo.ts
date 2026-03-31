/**
 * Brevo (Sendinblue) Customer Contact Sync
 *
 * Syncs registered users to a dedicated Brevo contact list with a MEMBERSHIP
 * attribute so you can segment by free vs premium.
 *
 * Uses:
 *   - BREVO_API_KEY (system setting or env)
 *   - BREVO_CUSTOMER_LIST_ID (system setting, default "2")
 */

import { getSystemSettings } from './settings';
import { prisma } from './db';

const BREVO_API_BASE = 'https://api.brevo.com/v3';

interface BrevoConfig {
  apiKey: string;
  customerListId: number;
}

/**
 * Load Brevo config from system settings (DB → env fallback).
 */
async function getBrevoConfig(): Promise<BrevoConfig | null> {
  const settings = await getSystemSettings([
    'BREVO_API_KEY',
    'BREVO_CUSTOMER_LIST_ID',
  ]);

  const apiKey = settings['BREVO_API_KEY'];
  if (!apiKey) {
    console.warn('[Brevo] API key not configured — skipping sync');
    return null;
  }

  const listIdStr = settings['BREVO_CUSTOMER_LIST_ID'] || '2';
  const customerListId = parseInt(listIdStr, 10);

  if (isNaN(customerListId) || customerListId < 1) {
    console.warn('[Brevo] Invalid BREVO_CUSTOMER_LIST_ID — skipping sync');
    return null;
  }

  return { apiKey, customerListId };
}

/**
 * Create or update a single contact in the active-customer Brevo list.
 *
 * @param email   - User email
 * @param name    - User display name
 * @param membership - 'free' | 'premium'
 */
export async function syncContactToBrevo(
  email: string,
  name: string,
  membership: 'free' | 'premium',
): Promise<{ success: boolean; error?: string }> {
  try {
    const config = await getBrevoConfig();
    if (!config) return { success: false, error: 'Brevo not configured' };

    const nameParts = (name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const body: Record<string, any> = {
      email: email.trim().toLowerCase(),
      updateEnabled: true,
      listIds: [config.customerListId],
      attributes: {
        FIRSTNAME: firstName,
        LASTNAME: lastName,
        MEMBERSHIP: membership.toUpperCase(), // FREE or PREMIUM
      },
    };

    const response = await fetch(`${BREVO_API_BASE}/contacts`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': config.apiKey,
      },
      body: JSON.stringify(body),
    });

    // 201 = created, 204 = updated (duplicate)
    if (response.ok || response.status === 201 || response.status === 204) {
      console.log(`[Brevo] ✅ Synced ${email} → list ${config.customerListId} (${membership})`);
      return { success: true };
    }

    // "duplicate_parameter" means contact already exists — still ok
    const errorData = await response.json().catch(() => ({}));
    if (errorData.code === 'duplicate_parameter') {
      // Contact exists — update their attributes via PUT
      const updateRes = await fetch(
        `${BREVO_API_BASE}/contacts/${encodeURIComponent(email.trim().toLowerCase())}`,
        {
          method: 'PUT',
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'api-key': config.apiKey,
          },
          body: JSON.stringify({
            attributes: {
              FIRSTNAME: firstName,
              LASTNAME: lastName,
              MEMBERSHIP: membership.toUpperCase(),
            },
            listIds: [config.customerListId],
          }),
        },
      );

      if (updateRes.ok || updateRes.status === 204) {
        console.log(`[Brevo] ✅ Updated existing contact ${email} (${membership})`);
        return { success: true };
      }

      const updateError = await updateRes.json().catch(() => ({}));
      console.error('[Brevo] Failed to update contact:', updateRes.status, updateError);
      return { success: false, error: updateError.message || 'Failed to update contact' };
    }

    console.error('[Brevo] API error:', response.status, errorData);
    return { success: false, error: errorData.message || `HTTP ${response.status}` };
  } catch (error: any) {
    console.error('[Brevo] Exception in syncContactToBrevo:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Bulk-sync ALL registered users to the Brevo customer list.
 * Uses the Brevo import contacts API for efficiency.
 *
 * Returns counts of synced / failed contacts.
 */
export async function syncAllUsersToBrevo(): Promise<{
  success: boolean;
  total: number;
  synced: number;
  failed: number;
  error?: string;
}> {
  try {
    const config = await getBrevoConfig();
    if (!config) {
      return { success: false, total: 0, synced: 0, failed: 0, error: 'Brevo not configured' };
    }

    // Fetch all users
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
      },
    });

    if (users.length === 0) {
      return { success: true, total: 0, synced: 0, failed: 0 };
    }

    // Determine membership for each user
    const getMembership = (user: {
      subscriptionPlan: string | null;
      subscriptionStatus: string | null;
    }): 'FREE' | 'PREMIUM' => {
      if (user.subscriptionPlan === 'premium' && user.subscriptionStatus === 'active') {
        return 'PREMIUM';
      }
      return 'FREE';
    };

    // Brevo bulk import uses a CSV-like body format
    // https://developers.brevo.com/reference/importcontacts-1
    const jsonContacts = users.map((u) => {
      const nameParts = (u.name || '').trim().split(/\s+/);
      return {
        email: u.email.toLowerCase(),
        attributes: {
          FIRSTNAME: nameParts[0] || '',
          LASTNAME: nameParts.slice(1).join(' ') || '',
          MEMBERSHIP: getMembership(u),
        },
      };
    });

    // Brevo import endpoint
    const importBody = {
      listIds: [config.customerListId],
      updateExistingContacts: true,
      emptyContactsAttributes: false,
      jsonBody: jsonContacts,
    };

    const response = await fetch(`${BREVO_API_BASE}/contacts/import`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': config.apiKey,
      },
      body: JSON.stringify(importBody),
    });

    if (response.ok || response.status === 202) {
      const data = await response.json().catch(() => ({}));
      console.log(`[Brevo] ✅ Bulk import queued: ${users.length} contacts → list ${config.customerListId}`, data);
      return {
        success: true,
        total: users.length,
        synced: users.length,
        failed: 0,
      };
    }

    const errorData = await response.json().catch(() => ({}));
    console.error('[Brevo] Bulk import error:', response.status, errorData);
    return {
      success: false,
      total: users.length,
      synced: 0,
      failed: users.length,
      error: errorData.message || `HTTP ${response.status}`,
    };
  } catch (error: any) {
    console.error('[Brevo] Exception in syncAllUsersToBrevo:', error);
    return { success: false, total: 0, synced: 0, failed: 0, error: error.message };
  }
}
