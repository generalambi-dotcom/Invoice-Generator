import type { Invoice } from '@/types/invoice';

const KEY = 'invoice-generator-pending-draft';

export function saveGuestDraft(invoice: Partial<Invoice>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify({ invoice, savedAt: new Date().toISOString() }));
}

export function loadGuestDraft(): Partial<Invoice> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const savedAt = new Date(parsed.savedAt).getTime();
    if (!savedAt || Date.now() - savedAt > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(KEY);
      return null;
    }
    return parsed.invoice || null;
  } catch {
    localStorage.removeItem(KEY);
    return null;
  }
}

export function clearGuestDraft() {
  if (typeof window !== 'undefined') localStorage.removeItem(KEY);
}
