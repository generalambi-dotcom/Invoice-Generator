# InvoiceGenerator.ng — End-to-End Test Plan

**Purpose:** Verify the new pricing, subscriptions, login/session changes, and feature limits all work correctly before/after go-live.
**Who runs this:** QA / staff tester (no coding needed).
**How to use:** Work top to bottom. For each test, follow the steps, compare to "Expected result," and mark **Pass / Fail** with a note. Log every failure using the Bug Report template at the end.

---

## 0. Before you start (READ THIS FIRST)

### Use TEST mode for payments — do NOT use real cards
So you can test paying for plans without moving real money:
- **Paystack:** the account should be toggled to **Test mode**, and the site should be configured with the **test** Paystack keys.
- **Stripe:** use the **test** Stripe keys.
- If you are testing on the **live** site with live keys, use the **smallest plan** and tell the admin so they can refund — but test mode is strongly preferred.

**Confirm with the admin which mode you are testing in before starting:** ☐ Test mode  ☐ Live mode

### Test card numbers (TEST MODE ONLY)
| Provider | Card number | Expiry | CVV | Extra |
|---|---|---|---|---|
| **Paystack** | `4084 0840 8408 4081` | any future date | `408` | PIN `0000`, OTP `123456` |
| **Stripe** | `4242 4242 4242 4242` | any future date | any 3 digits | any ZIP |

### Test accounts you need to create
Create these before starting and write down the emails/passwords:

1. **NEW FREE user** — a brand-new account you sign up **today** (after the new pricing went live). Used to test the *new* Free limits. → `________________`
2. **EXISTING (grandfathered) user** — an account that already existed **before** the new pricing launched. Ask the admin for one, or use an old test account. Used to test grandfathering. → `________________`
3. **A second throwaway email** for extra signup tests. → `________________`

> **Why this matters:** users who registered *before* launch keep the old, more generous Free plan (15 invoices/month, can email invoices, can make estimates). Users who sign up *after* launch get the new leaner Free plan (5 invoices/month, no emailing, no estimates). You must test both.

### Devices
Test on **at least one Android phone** (most of our users are on mobile) and one desktop browser.

### How to check a user's plan (admin)
The admin can open **Admin → User Management**, search the test email, and confirm the plan (free / pro / business) and subscription status. Ask them to help verify after each payment test.

---

## 1. Authentication & Sessions
*(We recently changed how login works — this is the highest-priority regression area. If login breaks, stop and report immediately.)*

| # | Steps | Expected result | Pass/Fail | Notes |
|---|---|---|---|---|
| 1.1 | Sign up a brand-new account (email + password) | Account is created; you're guided to verify email (or logged in if verification is off) | ☐ | |
| 1.2 | Verify email via the link in the inbox, then sign in | You land on the Dashboard, **not** bounced back to the sign-in page | ☐ | |
| 1.3 | Sign in with correct email + password | Lands on Dashboard and **stays** logged in | ☐ | |
| 1.4 | Refresh the Dashboard page (hard refresh) | Still logged in, no redirect to sign-in | ☐ | |
| 1.5 | Close the tab, reopen the site | Still logged in (session persists) | ☐ | |
| 1.6 | Sign in with **wrong** password 5–6 times | Clear error; after several tries the account is temporarily locked / rate-limited | ☐ | |
| 1.7 | "Sign in with Google" | Logs in and lands on Dashboard | ☐ | If Google login is enabled |
| 1.8 | If the account has 2FA on: sign in → enter the 6-digit code | Logs in only after correct code | ☐ | If 2FA enabled |
| 1.9 | Click Logout | Returns to signed-out state; visiting /dashboard now redirects to sign-in | ☐ | |
| 1.10 | While logged OUT, open `/dashboard` directly | Redirected to sign-in | ☐ | |
| 1.11 | "Forgot password" → reset via email link → sign in with new password | Reset works; can log in with new password | ☐ | |

---

## 2. Pricing Page (3 tiers + billing toggle)
*(Open the homepage pricing section and/or the pricing page.)*

| # | Steps | Expected result | Pass/Fail | Notes |
|---|---|---|---|---|
| 2.1 | Look at the pricing section | **Three** plans show: **Free, Pro, Business** | ☐ | |
| 2.2 | Check the billing toggle at the top | Toggle shows **Monthly / Annual**, and **Annual is selected by default** | ☐ | |
| 2.3 | With Annual selected, read Pro & Business prices | Pro shows **₦45,000/year**, Business **₦110,000/year** (or $ equivalents abroad), each with a **"Save ₦…"** badge | ☐ | |
| 2.4 | Switch toggle to Monthly | Pro shows **₦5,000/month**, Business **₦12,000/month**; savings badge disappears | ☐ | |
| 2.5 | Switch back to Annual | Prices update back to yearly; no page reload needed | ☐ | |
| 2.6 | Look at the Pro card | Pro has the **"★ Most Popular"** highlight | ☐ | |
| 2.7 | Look at the Business card | Business is visually distinct and lists **FIRS-compliant e-invoicing** with a **"Coming soon"** tag | ☐ | |
| 2.8 | Read the line under the cards | "30-day money-back guarantee • Cancel anytime • No setup fees" | ☐ | |
| 2.9 | **On an Android phone**, view the pricing section | Cards **stack vertically**, nothing is cut off, **no sideways scrolling**, toggle and buttons are easy to tap | ☐ | |
| 2.10 | Tap "Choose Pro" (Annual) | Goes to the upgrade/checkout page showing **Pro** and the **annual** price | ☐ | |
| 2.11 | Tap "Choose Business" (Monthly) | Upgrade page shows **Business** and the **monthly** price | ☐ | |

---

## 3. Region-based currency
*(Region is detected by the visitor's country automatically.)*

| # | Steps | Expected result | Pass/Fail | Notes |
|---|---|---|---|---|
| 3.1 | Open the pricing page **from Nigeria** (normal connection, no VPN) | Prices show in **Naira (₦)** | ☐ | |
| 3.2 | Open the pricing page **via a VPN set to the US/UK** (or ask a colleague abroad) | Prices show in **US Dollars ($)** | ☐ | Needs VPN or someone abroad |

---

## 4. New Free plan — limits & locked features
**Use the NEW FREE user (account #1, signed up after launch).**

| # | Steps | Expected result | Pass/Fail | Notes |
|---|---|---|---|---|
| 4.1 | Create invoices until you hit the cap | After **5 invoices in the current month**, creating a 6th is **blocked** with an "upgrade" message | ☐ | |
| 4.2 | On invoice #4 or #5 | A warning (e.g. limit-approaching email) may be sent | ☐ | |
| 4.3 | Try to **email an invoice to a client** | **Blocked** — message says emailing is a Pro feature | ☐ | |
| 4.4 | Try to create an **Estimate** | **Blocked** — Pro feature message | ☐ | |
| 4.5 | Try to create a **Credit Note** | **Blocked** — Pro feature message | ☐ | |
| 4.6 | Open the currency dropdown and pick an unusual currency (not NGN/USD/GBP/EUR/GHS), then save | **Blocked** — message says that currency needs Pro | ☐ | |
| 4.7 | Try to pick a theme other than the 2 free ones (Slate, Blue) and save | **Blocked** — message says extra themes need Pro | ☐ | |
| 4.8 | Create a normal invoice (NGN, default theme) | **Works** — free users can still make basic invoices | ☐ | |
| 4.9 | Download the invoice as PDF | **Works** — PDF export is available on Free | ☐ | |

---

## 5. Grandfathering — existing users keep their old benefits
**Use the EXISTING (grandfathered) user (account #2, created before launch).**

| # | Steps | Expected result | Pass/Fail | Notes |
|---|---|---|---|---|
| 5.1 | Create more than 5 invoices this month | Allowed up to **15** (old limit), not blocked at 5 | ☐ | |
| 5.2 | Email an invoice to a client | **Works** (kept from old Free plan) | ☐ | |
| 5.3 | Create an Estimate and a Credit Note | **Works** (kept) | ☐ | |

> If 5.1–5.3 are **blocked**, grandfathering is broken — report it (existing users must not be downgraded).

---

## 6. Paystack subscriptions (Naira) — the 4 plans
**Use the NEW FREE user. Pay with the Paystack TEST card above. Test from Nigeria / with NGN pricing.**
After each successful payment, ask the admin to confirm the plan + expiry in Admin → User Management.

| # | Steps | Expected result | Pass/Fail | Notes |
|---|---|---|---|---|
| 6.1 | Choose **Pro → Monthly** → pay with Paystack test card | Payment succeeds; account becomes **Pro**; expiry ≈ **30 days** out | ☐ | |
| 6.2 | Confirm Pro features now work: email invoice, create estimate/credit note, unlimited invoices, all currencies/themes | All unlocked | ☐ | |
| 6.3 | (New test account) Choose **Pro → Annual** → pay | Account **Pro**; expiry ≈ **365 days** out | ☐ | |
| 6.4 | (New test account) Choose **Business → Monthly** → pay | Account **Business**; expiry ≈ **30 days**; Smart Reports & AI receipt scanning available | ☐ | |
| 6.5 | (New test account) Choose **Business → Annual** → pay | Account **Business**; expiry ≈ **365 days** | ☐ | |
| 6.6 | Start a checkout, then **close the Paystack popup** without paying | No plan change; you can retry; no error stuck on screen | ☐ | |
| 6.7 | In the Paystack dashboard (admin), open the plan | A **subscription** appears for the customer (auto-renewing), not just a one-off charge | ☐ | |

---

## 7. Stripe subscriptions (US Dollars)
**Use a test account with USD pricing (via VPN abroad, or ask the admin to force USD). Pay with the Stripe test card `4242…`.**

| # | Steps | Expected result | Pass/Fail | Notes |
|---|---|---|---|---|
| 7.1 | Choose **Pro → Monthly** → pay with Stripe test card | Account becomes **Pro**; expiry ≈ **30 days** | ☐ | |
| 7.2 | Choose **Pro → Annual** (new test account) → pay | Account **Pro**; expiry ≈ **365 days** | ☐ | |
| 7.3 | Choose **Business → Monthly / Annual** (new test accounts) → pay | Account **Business**; correct expiry | ☐ | |
| 7.4 | In the Stripe dashboard (admin), open the customer | An active **subscription** exists with the correct interval (monthly/yearly) | ☐ | |
| 7.5 | If a 30-day free trial is offered on Stripe: start it | Access granted immediately, marked as trial | ☐ | If trial enabled |

---

## 8. Subscription lifecycle (renewal & cancellation)
*(Renewals are hard to test in real time — coordinate with the admin, who can use Stripe "test clocks" or shorten a plan to simulate a renewal.)*

| # | Steps | Expected result | Pass/Fail | Notes |
|---|---|---|---|---|
| 8.1 | **Renewal (admin-assisted):** simulate the next billing cycle | The user's subscription **end date moves forward** by one interval; plan stays active | ☐ | |
| 8.2 | **Cancellation:** cancel a test subscription in the Paystack/Stripe dashboard | User's status becomes **cancelled** but access **remains until the end date** | ☐ | |
| 8.3 | After the end date passes on a cancelled sub (admin can expire it) | User is **downgraded to Free**; Pro/Business features lock again | ☐ | |

---

## 9. Core invoice features — regression check
*(Make sure nothing basic broke. Use any Pro/Business test account.)*

| # | Steps | Expected result | Pass/Fail | Notes |
|---|---|---|---|---|
| 9.1 | Create a full invoice with several line items, tax, discount | Totals calculate correctly | ☐ | |
| 9.2 | Add a company logo | Logo appears on the invoice | ☐ | |
| 9.3 | Download PDF | PDF is correct and readable | ☐ | |
| 9.4 | Email the invoice to yourself (as a client) | Email arrives with the invoice attached/linked | ☐ | |
| 9.5 | Generate a Paystack payment link on an invoice and open it | Payment page loads with the correct amount | ☐ | |
| 9.6 | Mark/record a payment on an invoice | Invoice shows as paid | ☐ | |
| 9.7 | Open an invoice's **public payment page** (as if you were the client, logged out) | Loads correctly, shows the amount and pay option | ☐ | |
| 9.8 | Recurring invoices, WhatsApp send (if used) | Work as before | ☐ | If these features are used |

---

## 10. Admin spot-checks

| # | Steps | Expected result | Pass/Fail | Notes |
|---|---|---|---|---|
| 10.1 | Admin → Pricing Settings: change the Nigeria price, Save | Saves successfully (no "Authentication required" error) | ☐ | |
| 10.2 | Admin → User Management: open a test user | Plan, status, and expiry are correct after the payment tests | ☐ | |
| 10.3 | Admin dashboard loads and other admin pages open | No errors / no unexpected logouts | ☐ | |

---

## Bug Report template
For every **Fail**, copy this and fill it in:

```
Test #:
Device / browser:            (e.g. Android 13, Chrome)
Account used:                (which test account + is it new or grandfathered?)
Payment mode:                Test / Live
What I did (steps):
What I expected:
What actually happened:
Screenshot / screen recording: (attach)
Time it happened:
```

---

## Sign-off
- Tester name: ___________________  Date: ___________
- Environment tested: ☐ Test mode  ☐ Live
- Devices tested: ☐ Android phone  ☐ Desktop  ☐ iPhone
- Overall result: ☐ All pass  ☐ Pass with minor issues  ☐ Blocking issues found
- Summary / notes: ______________________________________________
