/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CENTRAL PRICING / PLAN CONFIG  —  single source of truth
 * ─────────────────────────────────────────────────────────────────────────────
 *  All tiers, prices, billing intervals, feature lists, limits and Paystack
 *  plan codes live HERE. The pricing page, upgrade/checkout, invoice-limit
 *  enforcement and every feature gate read from this module. Do NOT hard-code
 *  prices, limits or feature lists anywhere else.
 *
 *  Tune the numbers freely — components never contain a literal price/limit.
 */

export type BillingInterval = 'monthly' | 'annual';
export type PlanTier = 'free' | 'pro' | 'business';
export type PriceCurrency = 'NGN' | 'USD';

/**
 * Feature flags used for gating throughout the app. Add a key here, list it in
 * the relevant tiers below, then gate on it with `planHasFeature()`.
 */
export type FeatureKey =
  | 'emailToClient'          // email invoices to clients
  | 'estimatesAndCreditNotes'
  | 'extraCurrencies'        // full 50+ currency list (vs the small Free set)
  | 'extraThemes'            // all 6 colour themes (vs 2 on Free)
  | 'whatsappDelivery'
  | 'paymentLinks'           // Paystack payment-link generation
  | 'recurringInvoices'
  | 'smartReports'
  | 'aiReceiptScanning'
  | 'teamSeats'              // multi-user (see BUSINESS.comingSoon)
  | 'firsEInvoicing'         // PLACEHOLDER — see below
  | 'prioritySupport';

/* ─── Grandfathering ──────────────────────────────────────────────────────────
 * Users who registered BEFORE this timestamp keep the LEGACY Free benefits
 * (15 invoices/mo + email-to-client + estimates/credit notes). New signups get
 * the leaner Free plan. Existing PREMIUM users (mapped to Pro) also retain the
 * features that used to be bundled in premium — see LEGACY_PREMIUM_FEATURES.
 *
 * TODO(you): set this to the actual moment you deploy the new pricing.
 */
export const NEW_PLANS_LAUNCH_DATE = new Date('2026-07-06T00:00:00.000Z');

/** Free-tier invoice cap that legacy (grandfathered) free users keep. */
export const LEGACY_FREE_INVOICE_LIMIT = 15;

/**
 * Features that were included in the OLD single "premium" tier. Pre-launch
 * premium users (now mapped to Pro) keep these even though some now sit in
 * Business, so we never silently downgrade a paying user.
 */
export const LEGACY_PREMIUM_FEATURES: FeatureKey[] = [
  'emailToClient',
  'estimatesAndCreditNotes',
  'extraCurrencies',
  'extraThemes',
  'whatsappDelivery',
  'paymentLinks',
  'recurringInvoices',
  'smartReports',
  'aiReceiptScanning',
];

/* ─── Paystack plan codes ─────────────────────────────────────────────────────
 * TODO(you): In your Paystack dashboard → Subscriptions → Plans, create four
 * recurring plans (Pro Monthly, Pro Annual, Business Monthly, Business Annual)
 * with the amounts below, then paste each plan code (looks like "PLN_xxxxxxxx")
 * here — or set them via the NEXT_PUBLIC_ env vars so they differ per env.
 *
 * These are passed to Paystack checkout so the customer is subscribed to the
 * correct recurring plan for the tier + interval they picked.
 */
// Live Paystack plan codes (created in the Paystack dashboard). Env vars can
// override per-environment (e.g. test-mode codes in staging).
export const PAYSTACK_PRO_MONTHLY =
  process.env.NEXT_PUBLIC_PAYSTACK_PRO_MONTHLY || 'PLN_n49rm5v6pdhto28'; // Pro Plan — NGN 5,000 / month
export const PAYSTACK_PRO_ANNUAL =
  process.env.NEXT_PUBLIC_PAYSTACK_PRO_ANNUAL || 'PLN_m4hv63qna8ujp98'; // Pro Plan Annual — NGN 45,000 / year
export const PAYSTACK_BUSINESS_MONTHLY =
  process.env.NEXT_PUBLIC_PAYSTACK_BUSINESS_MONTHLY || 'PLN_nrja7m4gcu00tk8'; // Business — NGN 12,000 / month
export const PAYSTACK_BUSINESS_ANNUAL =
  process.env.NEXT_PUBLIC_PAYSTACK_BUSINESS_ANNUAL || 'PLN_zxq37hg3opxbjt9'; // Business Plan — NGN 110,000 / year

/** Convenience lookup: paystackPlanCode[tier][interval]. Free has none. */
export const PAYSTACK_PLAN_CODES: Record<
  Exclude<PlanTier, 'free'>,
  Record<BillingInterval, string>
> = {
  pro: { monthly: PAYSTACK_PRO_MONTHLY, annual: PAYSTACK_PRO_ANNUAL },
  business: { monthly: PAYSTACK_BUSINESS_MONTHLY, annual: PAYSTACK_BUSINESS_ANNUAL },
};

/* ─── Types ───────────────────────────────────────────────────────────────── */

export interface IntervalPrice {
  NGN: number;
  USD: number;
}

export interface PlanLimits {
  /** Invoices per calendar month. null = unlimited. */
  invoicesPerMonth: number | null;
  /** Distinct currencies selectable. null = unlimited (50+). */
  currencies: number | null;
  /** Colour themes selectable. null = unlimited. */
  themes: number | null;
}

export interface PlanFeatureLine {
  key?: FeatureKey;   // present when this line maps to a gated feature
  label: string;      // display text
  included: boolean;  // shown with ✓ vs ✗/muted
  comingSoon?: boolean;
}

export interface PlanDefinition {
  tier: PlanTier;
  name: string;
  tagline: string;
  /** Prices per interval + currency. Free is 0. Read prices from here only. */
  price: Record<BillingInterval, IntervalPrice>;
  limits: PlanLimits;
  /** Feature flags this tier grants (used by planHasFeature). */
  features: FeatureKey[];
  /** Ordered feature lines rendered on the pricing card. */
  featureLines: PlanFeatureLine[];
  mostPopular?: boolean;
  /** CTA for the pricing card when the plan is free/paid. */
  ctaLabel: string;
}

/* ─── The plans ───────────────────────────────────────────────────────────── */

export const FREE_PLAN: PlanDefinition = {
  tier: 'free',
  name: 'Free',
  tagline: 'For freelancers getting started',
  price: { monthly: { NGN: 0, USD: 0 }, annual: { NGN: 0, USD: 0 } },
  limits: { invoicesPerMonth: 5, currencies: 5, themes: 2 },
  features: [],
  featureLines: [
    { label: '5 invoices / month', included: true },
    { label: 'Unlimited clients', included: true },
    { label: 'Company branding & logo', included: true },
    { label: '5 currencies incl. NGN', included: true },
    { label: '2 colour themes', included: true },
    { label: 'Professional PDF export', included: true },
    { key: 'emailToClient', label: 'Email invoices to clients', included: false },
    { key: 'estimatesAndCreditNotes', label: 'Estimates & credit notes', included: false },
  ],
  ctaLabel: 'Get Started Free',
};

export const PRO_PLAN: PlanDefinition = {
  tier: 'pro',
  name: 'Pro',
  tagline: 'For growing businesses & agencies',
  price: {
    monthly: { NGN: 5000, USD: 9.99 },
    annual: { NGN: 45000, USD: 99 }, // ~3 months free vs monthly×12
  },
  limits: { invoicesPerMonth: null, currencies: null, themes: null },
  features: [
    'emailToClient',
    'estimatesAndCreditNotes',
    'extraCurrencies',
    'extraThemes',
    'whatsappDelivery',
    'paymentLinks',
    'recurringInvoices',
  ],
  featureLines: [
    { label: 'Everything in Free, plus:', included: true },
    { label: 'Unlimited invoices', included: true },
    { key: 'emailToClient', label: 'Email invoices to clients', included: true },
    { key: 'estimatesAndCreditNotes', label: 'Estimates & credit notes', included: true },
    { key: 'extraCurrencies', label: '50+ currencies', included: true },
    { key: 'extraThemes', label: '6 colour themes', included: true },
    { key: 'whatsappDelivery', label: 'WhatsApp invoice delivery', included: true },
    { key: 'paymentLinks', label: 'Payment links (Paystack)', included: true },
    { key: 'recurringInvoices', label: 'Recurring invoices', included: true },
  ],
  mostPopular: true,
  ctaLabel: 'Choose Pro',
};

export const BUSINESS_PLAN: PlanDefinition = {
  tier: 'business',
  name: 'Business',
  tagline: 'For established teams that need more',
  price: {
    monthly: { NGN: 12000, USD: 24.99 },
    annual: { NGN: 110000, USD: 249 }, // ~2–3 months free vs monthly×12
  },
  limits: { invoicesPerMonth: null, currencies: null, themes: null },
  features: [
    'emailToClient',
    'estimatesAndCreditNotes',
    'extraCurrencies',
    'extraThemes',
    'whatsappDelivery',
    'paymentLinks',
    'recurringInvoices',
    'smartReports',
    'aiReceiptScanning',
    'teamSeats',
    'prioritySupport',
    // NOTE: 'firsEInvoicing' is intentionally NOT granted — it's a placeholder
    // (coming soon), so planHasFeature('firsEInvoicing') stays false everywhere.
  ],
  featureLines: [
    { label: 'Everything in Pro, plus:', included: true },
    { key: 'smartReports', label: 'Smart reports dashboard', included: true },
    { key: 'aiReceiptScanning', label: 'AI receipt scanning', included: true },
    { key: 'teamSeats', label: 'Multi-user / team seats', included: true, comingSoon: true },
    // ── FIRS e-invoicing: PLACEHOLDER ONLY. Do NOT build/enable yet. ──────────
    // TODO(FIRS): implement FIRS-compliant e-invoicing, then set included:true,
    // remove comingSoon, and add 'firsEInvoicing' to BUSINESS_PLAN.features.
    { key: 'firsEInvoicing', label: 'FIRS-compliant e-invoicing', included: true, comingSoon: true },
    { key: 'prioritySupport', label: 'Priority support', included: true },
  ],
  ctaLabel: 'Choose Business',
};

/** Ordered list of plans for rendering the pricing table. */
export const PLANS: PlanDefinition[] = [FREE_PLAN, PRO_PLAN, BUSINESS_PLAN];

export const PLAN_BY_TIER: Record<PlanTier, PlanDefinition> = {
  free: FREE_PLAN,
  pro: PRO_PLAN,
  business: BUSINESS_PLAN,
};

/** Billing-toggle config. Annual is the default selection (per spec). */
export const DEFAULT_BILLING_INTERVAL: BillingInterval = 'annual';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

/**
 * Normalise a raw `subscriptionPlan` DB value to a PlanTier. Legacy 'premium'
 * maps to 'pro'. Unknown/empty → 'free'.
 */
export function normaliseTier(subscriptionPlan?: string | null): PlanTier {
  switch (subscriptionPlan) {
    case 'business':
      return 'business';
    case 'pro':
    case 'premium': // legacy value → Pro
      return 'pro';
    default:
      return 'free';
  }
}

/** True if the tier is a paid tier (Pro or Business). */
export function isPaidTier(tier: PlanTier): boolean {
  return tier === 'pro' || tier === 'business';
}

/** Was this account created before the new pricing launched? */
export function isGrandfathered(registeredAt?: Date | string | null): boolean {
  if (!registeredAt) return false;
  const created = typeof registeredAt === 'string' ? new Date(registeredAt) : registeredAt;
  return created.getTime() < NEW_PLANS_LAUNCH_DATE.getTime();
}

/**
 * Monthly invoice cap for a user. Returns null for unlimited.
 * Grandfathered free users keep the legacy 15/mo cap.
 */
export function getInvoiceLimit(
  subscriptionPlan?: string | null,
  registeredAt?: Date | string | null
): number | null {
  const tier = normaliseTier(subscriptionPlan);
  if (tier !== 'free') return PLAN_BY_TIER[tier].limits.invoicesPerMonth; // null (unlimited)
  return isGrandfathered(registeredAt)
    ? LEGACY_FREE_INVOICE_LIMIT
    : FREE_PLAN.limits.invoicesPerMonth;
}

/**
 * Does a user's plan include a feature? Applies grandfathering:
 *  - pre-launch FREE users keep legacy Free features (email + estimates);
 *  - pre-launch PAID (premium→Pro) users keep everything premium used to bundle
 *    (incl. smart reports & AI scanning that now sit in Business).
 */
export function planHasFeature(
  feature: FeatureKey,
  subscriptionPlan?: string | null,
  registeredAt?: Date | string | null
): boolean {
  const tier = normaliseTier(subscriptionPlan);

  // Current tier grant.
  if (PLAN_BY_TIER[tier].features.includes(feature)) return true;

  // Grandfathering.
  if (isGrandfathered(registeredAt)) {
    if (tier === 'free') {
      // Legacy Free bundled email-to-client + estimates/credit notes.
      if (feature === 'emailToClient' || feature === 'estimatesAndCreditNotes') return true;
    } else {
      // Legacy premium users keep all previously-bundled premium features.
      if (LEGACY_PREMIUM_FEATURES.includes(feature)) return true;
    }
  }

  return false;
}

/** Annual savings vs paying monthly×12, in the given currency. */
export function annualSavings(tier: PlanTier, currency: PriceCurrency): number {
  const plan = PLAN_BY_TIER[tier];
  const monthlyYearly = plan.price.monthly[currency] * 12;
  const annual = plan.price.annual[currency];
  return Math.max(0, monthlyYearly - annual);
}

/** Price for a tier at an interval in a currency. */
export function getPlanPrice(
  tier: PlanTier,
  interval: BillingInterval,
  currency: PriceCurrency
): number {
  return PLAN_BY_TIER[tier].price[interval][currency];
}

/** Paystack plan code for a paid tier + interval (empty for free). */
export function getPaystackPlanCode(tier: PlanTier, interval: BillingInterval): string {
  if (tier === 'free') return '';
  return PAYSTACK_PLAN_CODES[tier][interval];
}

/** Currency symbol helper (kept here so components stay config-driven). */
export function currencySymbol(currency: PriceCurrency): string {
  return currency === 'NGN' ? '₦' : '$';
}

/** Format a plan price with its symbol (NGN uses thousands separators). */
export function formatPlanPrice(amount: number, currency: PriceCurrency): string {
  const symbol = currencySymbol(currency);
  if (currency === 'NGN') return `${symbol}${amount.toLocaleString('en-NG')}`;
  return `${symbol}${amount % 1 === 0 ? amount : amount.toFixed(2)}`;
}

/* ─── Free-tier allowlists (for the 'extraCurrencies' / 'extraThemes' gates) ── */

/** Currencies a (non-grandfathered) Free user may use — NGN + a small set. */
export const FREE_CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR', 'GHS'];

/** Colour themes a (non-grandfathered) Free user may use (2 of the 5). */
export const FREE_THEMES = ['slate', 'blue'];

/** May this user use this invoice currency? Pro+/grandfathered → any. */
export function currencyAllowed(
  currency: string,
  subscriptionPlan?: string | null,
  registeredAt?: Date | string | null
): boolean {
  if (planHasFeature('extraCurrencies', subscriptionPlan, registeredAt)) return true;
  return FREE_CURRENCIES.includes((currency || 'NGN').toUpperCase());
}

/** May this user use this invoice theme? Pro+/grandfathered → any. */
export function themeAllowed(
  theme: string,
  subscriptionPlan?: string | null,
  registeredAt?: Date | string | null
): boolean {
  if (planHasFeature('extraThemes', subscriptionPlan, registeredAt)) return true;
  return FREE_THEMES.includes(theme || 'slate');
}
