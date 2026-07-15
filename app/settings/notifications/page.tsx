'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/ProtectedRoute';

type Preferences = {
  lifecycleEmails: boolean;
  weeklySummary: boolean;
  productUpdates: boolean;
};

const rows: Array<{ key: keyof Preferences; title: string; description: string }> = [
  { key: 'lifecycleEmails', title: 'Product guidance', description: 'Helpful next steps based on how you use InvoiceGenerator.ng.' },
  { key: 'weeklySummary', title: 'Weekly business summary', description: 'A concise recap of invoices sent, payments received and overdue balances.' },
  { key: 'productUpdates', title: 'Product updates and offers', description: 'Occasional news, new-feature announcements and relevant offers.' },
];

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/email-preferences')
      .then(async (res) => {
        if (!res.ok) throw new Error('Unable to load preferences');
        return res.json();
      })
      .then((data) => setPreferences(data.preferences))
      .catch(() => toast.error('Unable to load email preferences.'));
  }, []);

  const save = async () => {
    if (!preferences) return;
    setSaving(true);
    try {
      const res = await fetch('/api/email-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      if (!res.ok) throw new Error();
      toast.success('Email preferences saved.');
    } catch {
      toast.error('Could not save your preferences.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
    <div className="mx-auto max-w-3xl">
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Communication settings</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Choose the emails that help you</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Security, account, invoice and payment emails are always delivered when needed. Everything below is optional.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {!preferences ? (
          <div className="p-8 text-sm text-gray-500">Loading preferences…</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rows.map((row) => (
              <label key={row.key} className="flex cursor-pointer items-start justify-between gap-5 p-5 hover:bg-gray-50/70">
                <span>
                  <span className="block text-sm font-semibold text-gray-900">{row.title}</span>
                  <span className="mt-1 block text-sm leading-5 text-gray-500">{row.description}</span>
                </span>
                <input
                  type="checkbox"
                  checked={preferences[row.key]}
                  onChange={(event) => setPreferences({ ...preferences, [row.key]: event.target.checked })}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={save}
        disabled={!preferences || saving}
        className="mt-5 rounded-xl bg-[#1F4D45] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#163832] disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save preferences'}
      </button>
    </div>
    </div>
    </ProtectedRoute>
  );
}
