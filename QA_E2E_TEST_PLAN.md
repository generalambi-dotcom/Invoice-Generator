# InvoiceGenerator.ng — Comprehensive End-to-End Test Plan

**Purpose:** Provide full regression and feature coverage for the entire Invoice Generator app, from the unauthenticated landing page experience through to premium features, subscriptions, and document management. 
**Who runs this:** QA / staff tester (no coding needed).
**How to use:** Work top to bottom. For each test, follow the steps, compare to "Expected result," and mark **Pass / Fail**. Log every failure using the Bug Report template at the end.

---

## 0. Prerequisites & Setup

- **Test Environments:** Ensure you are testing against the staging environment with test keys (Paystack Test, Stripe Test). Confirm mode with admin.
- **Test Accounts Needed:**
  1. **New Free User** (Signed up today)
  2. **Grandfathered Free User** (Created before pricing launch)
  3. **Premium User** (Pro or Business)
- **Devices:** Test on at least one Desktop browser (Chrome/Safari) and one Mobile device (Android/iOS).

---

## 1. Landing Page & Unauthenticated Experience

| # | Scenario | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|
| 1.1 | Homepage Load | Open the homepage on Desktop and Mobile. | Loads quickly, hero section is visible, layouts adjust properly to mobile screens without horizontal scroll. | ☐ |
| 1.2 | Unauthenticated Generator | Click "Create Free Invoice" on the homepage without logging in. | The free invoice generator tool loads. You can add items, totals calculate, and you can download a PDF. | ☐ |
| 1.3 | Unauthenticated Save Block | Try to click "Save Invoice" while logged out. | A prompt appears asking you to sign up or log in to save and manage invoices. | ☐ |
| 1.4 | Pricing Display | View the pricing section. Toggle Monthly/Annual. | Prices update correctly. Annual shows default with savings badge. | ☐ |
| 1.5 | Geo-Pricing | Use a VPN (US/UK) and view pricing. | Prices display in USD instead of NGN. | ☐ |

---

## 2. Authentication & Onboarding

| # | Scenario | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|
| 2.1 | Sign Up | Create a new account with email and password. | Account created, redirected to onboarding/dashboard. | ☐ |
| 2.2 | Email Verification | Check inbox for verification link, click it. | Email is verified successfully. | ☐ |
| 2.3 | Login & Persistence | Log in, close browser tab, reopen the app. | You remain logged in. | ☐ |
| 2.4 | Invalid Login | Attempt login with wrong password 5 times. | Clear error messages; account locks/rate-limits after max attempts. | ☐ |
| 2.5 | 2FA (If enabled) | Turn on 2FA in settings, logout, log back in. | Prompted for 6-digit code. Login blocked until correct code entered. | ☐ |
| 2.6 | Password Reset | Click "Forgot Password", use reset link from email. | Password updates successfully, user can log in with new password. | ☐ |
| 2.7 | Dashboard Onboarding | View dashboard as a brand new user. | See the "Profile Strength" card and the "Get Started" Activation checklist. | ☐ |

---

## 3. Profile & Settings

| # | Scenario | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|
| 3.1 | Business Details | Go to Settings/Profile. Update Business Name, Address, and Tax ID. | Saves successfully. Dashboard "Profile Strength" percentage increases. | ☐ |
| 3.2 | Logo Upload | Upload a company logo. | Upload succeeds, logo appears in settings and on new invoices. | ☐ |
| 3.3 | Bank Details | Add Bank Name, Account Number, and Account Name. | Saves successfully. These appear automatically at the bottom of new invoices. | ☐ |
| 3.4 | Default Preferences | Set a default currency, default tax rate (e.g., 7.5% VAT), and default notes. | New invoices automatically load with these defaults applied. | ☐ |
| 3.5 | Directory Opt-in | Toggle public directory settings. | Saves successfully. | ☐ |

---

## 4. Core Invoice Editor (Heavy Lifter)

| # | Scenario | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|
| 4.1 | Adding Line Items | Create an invoice, add 3 line items with different quantities and rates. | Subtotal calculates exactly (Qty * Rate). | ☐ |
| 4.2 | Tax & Discount | Apply a 10% discount and a 5% tax. | Total accurately reflects: (Subtotal - Discount) + Tax. | ☐ |
| 4.3 | Client Selection | Click the client field. Add a brand new client. Then create a second invoice and search for that client. | New client saves to address book. Can be selected from dropdown on future invoices. | ☐ |
| 4.4 | Layout Changes | (Pro feature) Change invoice layout from Modern to Classic, Bold, etc. | Preview updates instantly reflecting the new structural layout. | ☐ |
| 4.5 | Save as Draft | Click "Save" without sending. | Invoice saves successfully, appears in invoice list with "Draft" status. | ☐ |

---

## 5. Plan Gating & Entitlements (The Paywall)

**Use the NEW FREE User for this section.**

| # | Scenario | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|
| 5.1 | Invoice Cap | Create invoices until you hit 5 for the month. Try creating a 6th. | Creation blocked; usage meter shows 5/5; upgrade prompt appears. | ☐ |
| 5.2 | Locked Document Types | Try to toggle document type to "Estimate" or "Credit Note". | Amber lock icon visible. Clicking redirects to /upgrade. | ☐ |
| 5.3 | Locked Themes | Try to select the Green, Purple, or Red themes. | Lock overlay visible. Clicking redirects to /upgrade. | ☐ |
| 5.4 | Locked Currencies | Open the currency dropdown and select a non-free currency (e.g. JPY). | Option shows "· Pro". Clicking shows error toast and redirects to /upgrade. | ☐ |
| 5.5 | Locked Emailing | Click "Send via email" in the success modal after saving. | Button is muted with a lock icon. Redirects to /upgrade. | ☐ |
| 5.6 | Grandfathering Check | **Log into the GRANDFATHERED FREE account.** Try to create >5 invoices, send emails, and make estimates. | **Allowed**. Grandfathered users retain their old 15 limit and legacy features. | ☐ |

---

## 6. Sharing & Getting Paid

**Use a PRO/BUSINESS User for this section to avoid gates.**

| # | Scenario | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|
| 6.1 | PDF Download | Click "Download PDF". | PDF generates correctly, matches the web preview, formatting is intact. | ☐ |
| 6.2 | Emailing Client | Click "Send via email". Edit the subject and message. Send to a test email. | Email arrives formatted nicely, with PDF attached and a "View/Pay Invoice" button. | ☐ |
| 6.3 | Public Link View | Copy the public link. Open in an Incognito window. | Client view loads correctly. Shows "Pay Now" button and invoice details. | ☐ |
| 6.4 | Online Payment (Stripe/Paystack) | As a client on the public link, click Pay Now. Complete test checkout. | Payment succeeds. Invoice status changes to "Paid" automatically. | ☐ |
| 6.5 | Manual Payment Record | Open an unpaid invoice. Click "Record Payment". Enter partial amount. | Invoice status changes to "Partially Paid". Remaining balance updates. | ☐ |
| 6.6 | Overdue Status | Set an invoice due date to yesterday. | Dashboard and invoice list flag it as "Overdue" in red. | ☐ |

---

## 7. Advanced Document Workflows

**Use a PRO/BUSINESS User.**

| # | Scenario | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|
| 7.1 | Estimates | Create an Estimate. Send via public link. "Client" clicks "Approve". | Estimate status changes to Approved. | ☐ |
| 7.2 | Estimate to Invoice | Open an approved estimate. Click "Convert to Invoice". | New invoice is generated carrying over all line items and clients. | ☐ |
| 7.3 | Credit Notes | Create a Credit Note. | Generates properly with negative connotations/formatting. | ☐ |
| 7.4 | Duplication | Open an existing invoice. Click "Duplicate". | Creates a fresh draft invoice with identical line items and client info. | ☐ |

---

## 8. Dashboard & Analytics

| # | Scenario | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|
| 8.1 | Metric Accuracy | Create a $100 invoice, mark $50 as paid. Check dashboard. | Total revenue, Paid, and Unpaid tiles reflect the exact amounts accurately. | ☐ |
| 8.2 | Usage Meter | On a Free account, create an invoice and view the dashboard. | Meter increments correctly (e.g., 1/5 to 2/5). | ☐ |
| 8.3 | Activity Feed | Perform actions (create, send, mark paid). Check dashboard feed. | Recent Activity list logs these actions chronologically. | ☐ |

---

## 9. Clients Management

| # | Scenario | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|
| 9.1 | Client Address Book | Go to Clients page. View list. | All previously added clients are listed. | ☐ |
| 9.2 | Edit Client | Select a client, update their address and email. | Saves successfully. Future invoices reflect new address. | ☐ |
| 9.3 | Client History | Click on a specific client profile. | Displays a history/ledger of all invoices specifically assigned to them. | ☐ |

---

## 10. Subscriptions & Billing Lifecycle

| # | Scenario | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|
| 10.1 | Upgrade to Pro | Free user goes to /upgrade, selects Pro (Monthly), checks out via Paystack. | User is upgraded instantly. Editor locks are removed. | ☐ |
| 10.2 | Admin Verification | Admin opens User Management. | User shows "Pro" plan and "Active" status with correct expiry. | ☐ |
| 10.3 | Cancellation | Cancel the subscription in the payment provider dashboard. | Access remains active until the end date, then reverts to Free plan. | ☐ |

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
