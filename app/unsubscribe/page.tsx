import Link from 'next/link';

export default function UnsubscribePage({
  searchParams,
}: {
  searchParams: { status?: string; category?: string };
}) {
  const success = searchParams.status === 'success';
  const label = searchParams.category === 'weekly'
    ? 'weekly summaries'
    : searchParams.category === 'product'
      ? 'product updates and offers'
      : 'product guidance emails';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${success ? 'bg-emerald-100' : 'bg-amber-100'}`}>
          {success ? '✓' : '!'}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {success ? 'Email preferences updated' : 'This unsubscribe link is no longer valid'}
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          {success
            ? `You will no longer receive ${label}. Essential account, security, invoice and payment emails are unaffected.`
            : 'Sign in to manage your email preferences securely.'}
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/settings/notifications" className="rounded-xl bg-[#1F4D45] px-5 py-3 text-sm font-semibold text-white hover:bg-[#163832]">
            Manage preferences
          </Link>
          <Link href="/" className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
