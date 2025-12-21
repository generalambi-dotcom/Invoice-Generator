import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Invoicing Guide - Comprehensive Guide to Invoicing in Nigeria',
  description: 'Learn everything about invoicing in Nigeria: essential elements, types of invoices, payment terms, VAT compliance, and best practices.',
};

export default function InvoicingGuidePage() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Comprehensive Guide to Invoicing in Nigeria
          </h1>
        </div>

        {/* Introduction */}
        <section id="introduction" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Introduction</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-700 leading-relaxed mb-4">
              Invoices are written requests for payment sent by sellers to buyers after goods or services have been delivered. 
              In Nigeria, businesses—from freelance graphic designers to large enterprises—issue invoices to document sales, 
              manage cash flow and comply with tax laws. A well‑prepared invoice helps you get paid quickly, provides an audit 
              trail and enhances professionalism.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This guide explains the basics of invoicing for the Nigerian market. It covers why invoices matter, the essential 
              elements of an invoice, different types of invoices, how to create them, payment terms and reminders, and basic 
              accounting concepts. It also summarises Nigerian regulatory requirements and best practices so that you can invoice 
              clients confidently.
            </p>
          </div>
        </section>

        {/* Why Invoicing Matters */}
        <section id="why-invoicing-matters" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Invoicing Matters</h2>
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Legal proof of transaction</h3>
              <p className="text-gray-700 leading-relaxed">
                Invoices serve as evidence that a transaction occurred. They may be required during audits or tax checks. 
                Some sectors (e.g., public procurement) require compliant invoices for payment.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Business cash flow</h3>
              <p className="text-gray-700 leading-relaxed">
                Clearly specifying payment terms encourages faster payment. In Nigeria, late payments are common, so clear 
                invoices help manage cash flow.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Financial records</h3>
              <p className="text-gray-700 leading-relaxed">
                Invoices form the basis of accounts receivable and are vital when preparing financial statements and VAT returns.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Professionalism and trust</h3>
              <p className="text-gray-700 leading-relaxed">
                A professional invoice that matches your brand instils confidence and reduces disputes.
              </p>
            </div>
          </div>
        </section>

        {/* Essential Elements */}
        <section id="essential-elements" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Essential Elements of an Invoice</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-700 leading-relaxed mb-6">
              A standard invoice should include the following components, which align with international and Nigerian regulations:
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Header and "Invoice" label</h3>
                <p className="text-gray-700 leading-relaxed">
                  Clearly label the document as an Invoice to avoid confusion with receipts or quotes. Include your business 
                  name, logo and contact details.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Invoice number</h3>
                <p className="text-gray-700 leading-relaxed">
                  Each invoice should have a unique sequential number for tracking and to comply with FIRS regulations. 
                  Nigerian rules require receipt numbers to follow an unbroken sequence each calendar year.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your information (supplier)</h3>
                <p className="text-gray-700 leading-relaxed">
                  Business name, address, telephone/email, Tax Identification Number (TIN) and VAT registration number 
                  (if registered). Freelancers and sole traders may use their personal address and phone number.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Client information (customer)</h3>
                <p className="text-gray-700 leading-relaxed">
                  Name or company name, address and contact details. Include the client's TIN or VAT number if applicable.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Invoice date</h3>
                <p className="text-gray-700 leading-relaxed">
                  Date you issue the invoice. For VAT invoices, Nigerian law requires that invoices be issued within 15 days 
                  of the end of the month in which the supply took place.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Due date</h3>
                <p className="text-gray-700 leading-relaxed">
                  Clearly state when payment is due. Common payment terms include Net 7, Net 14 or Net 30 days. According to 
                  Nigerian best practices, Net 30 (payment due 30 days after invoice date) is common, but you can set shorter 
                  terms (e.g., Net 15) to encourage faster payment.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description of goods or services</h3>
                <p className="text-gray-700 leading-relaxed">
                  List each item or service provided, quantity, unit price, and subtotal. Descriptions should be clear to avoid disputes.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tax information</h3>
                <p className="text-gray-700 leading-relaxed">
                  Nigeria's Value Added Tax (VAT) rate is 7.5% for most goods and services. VAT-registered suppliers must show 
                  VAT separately and include their VAT registration number; businesses not registered must not collect VAT. 
                  Some items (basic food, books, pharmaceuticals) are exempt.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total amount due</h3>
                <p className="text-gray-700 leading-relaxed">
                  Sum of line items and taxes. Show both subtotal and total payable.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment details</h3>
                <p className="text-gray-700 leading-relaxed">
                  Provide bank account details, mobile money information or payment gateway links. Many Nigerian businesses accept 
                  bank transfers, card payments through Paystack or Flutterwave, and mobile money.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Terms & notes</h3>
                <p className="text-gray-700 leading-relaxed">
                  Include late payment penalties, early payment discounts, refund policy, or any other agreements. Clearly stating 
                  a penalty (e.g., 2% per month on overdue balances) can deter late payment.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Signatures or stamps (optional)</h3>
                <p className="text-gray-700 leading-relaxed">
                  Although not always required for standard invoices, official stamps or digital signatures may be used to authenticate 
                  documents, especially for e‑invoicing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Example Layout */}
        <section id="example-layout" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Example Layout</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-700 leading-relaxed">
              While you may design your invoice to match your brand, the typical layout includes your logo at the top, supplier 
              and client details, table of goods/services with quantities and prices, VAT and totals, payment instructions, and any 
              notes or terms. Using accounting or invoicing software ensures that your invoices are properly formatted and helps 
              maintain sequential invoice numbers.
            </p>
          </div>
        </section>

        {/* Types of Invoices */}
        <section id="types-of-invoices" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Types of Invoices</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-700 leading-relaxed mb-6">
              Invoices serve different purposes. Understanding the distinctions helps you choose the right one:
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type of Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purpose & When to Use
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Standard or Sales Invoice
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Issued after goods or services are delivered; requests payment from the buyer. This is the most common 
                      invoice used in Nigeria.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Pro Forma Invoice
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      A preliminary bill sent before work begins or goods are delivered. It gives the buyer an estimate and terms 
                      but is not an official demand for payment. Pro forma invoices are not used for VAT collection.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      VAT Invoice
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Required for all VAT-registered businesses. Must include supplier's and customer's VAT numbers, description of 
                      goods, quantity, unit price, total VAT charged, and must be issued within 15 days of month‑end. Businesses 
                      without a VAT registration must not charge VAT.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Recurring Invoice
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Used for ongoing services or subscriptions (e.g., monthly retainers). Automating recurring invoices saves time 
                      and ensures regular cash flow.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Past‑Due Invoice
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Sent when the original invoice has not been paid by the due date. It may include late fees and a more urgent 
                      tone to remind the client.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Credit or Debit Invoice
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Adjusts amounts previously invoiced—credit invoices reduce amount due (e.g., returns), and debit invoices 
                      increase it (e.g., additional services).
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Interim or Progress Invoice
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Issued at various stages of a long‑term project to bill for work completed to date.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Self‑Billing Invoice
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      When the buyer issues the invoice on behalf of the supplier (rare, usually in special supply arrangements).
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* How to Make an Invoice */}
        <section id="how-to-make-invoice" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How to Make an Invoice (Step‑by‑Step)</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-700 leading-relaxed mb-6">
              Creating a professional invoice is straightforward when you follow these steps:
            </p>
            <ol className="space-y-4 list-decimal list-inside text-gray-700">
              <li>
                <strong>Choose a tool:</strong> You can use a word processor, spreadsheet, dedicated invoicing software or online 
                platforms like Invoice Generator. Accounting software often automates invoice creation, ensures compliance and allows 
                integration with payment gateways.
              </li>
              <li>
                <strong>Add your company details and logo:</strong> Include your business name, address, TIN, VAT number and contact 
                info. Adding a logo builds trust.
              </li>
              <li>
                <strong>Insert client details:</strong> Record the recipient's name or company, address and contact details. Confirm 
                the spelling to avoid payment delays.
              </li>
              <li>
                <strong>Assign a unique invoice number:</strong> Use sequential numbers to keep your records organised and satisfy FIRS 
                requirements. Many businesses include the year (e.g., 2025‑0001).
              </li>
              <li>
                <strong>Set the invoice date and due date:</strong> Align due dates with your payment terms. Shorter terms (Net 7 to 
                Net 14) typically speed up payment.
              </li>
              <li>
                <strong>List goods or services:</strong> Include item names, descriptions, quantities, unit prices and line totals. 
                Provide enough detail to prevent disputes.
              </li>
              <li>
                <strong>Calculate totals:</strong> Sum the line items and add VAT (if applicable). Display subtotal, VAT amount and 
                final total.
              </li>
              <li>
                <strong>Specify payment methods:</strong> Give bank account details (account number, bank name, account name), mobile 
                money numbers or payment gateway links. Indicate accepted currencies (usually Nigerian Naira) and any transaction fees.
              </li>
              <li>
                <strong>State payment terms and penalties:</strong> Clarify the payment deadline, late fees and any early payment 
                discounts. For example, "2% discount if paid within 10 days" or "1% late fee per week after due date". Be explicit 
                about consequences to avoid misunderstanding.
              </li>
              <li>
                <strong>Add notes or terms:</strong> Thank your client, mention project milestones or add other relevant information 
                (e.g., return policy). Using polite language ("please" and "thank you") can improve the likelihood of getting paid promptly.
              </li>
              <li>
                <strong>Review and send:</strong> Double‑check all information before sending. You can send the invoice by email, attach 
                as PDF, or use electronic invoicing systems. Keep copies for your records.
              </li>
            </ol>
          </div>
        </section>

        {/* Using Invoicing Software */}
        <section id="using-invoicing-software" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Using Invoicing Software</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-700 leading-relaxed mb-4">
              Invoicing modules within accounting software automate many tasks:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Templates:</strong> Pre‑designed invoices ensure consistency and compliance.</li>
              <li><strong>Automated numbering:</strong> Prevents duplicate numbers and maintains sequential order.</li>
              <li><strong>Scheduled invoices:</strong> Recurring invoices can be sent automatically.</li>
              <li><strong>Online payment integration:</strong> Clients can pay directly via cards or bank transfers.</li>
              <li><strong>Reminders:</strong> Automatic email or SMS reminders notify clients before and after the due date.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Using software reduces errors, ensures compliance with FIRS regulations and saves time, especially as your business grows.
            </p>
          </div>
        </section>

        {/* Payment Terms */}
        <section id="payment-terms" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Setting Payment Terms and Managing Past‑Due Invoices</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-700 leading-relaxed mb-6">
              Late payments are a common issue in Nigeria, so establishing clear payment terms and follow‑up processes is essential.
            </p>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Setting Payment Terms</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <strong>Define due dates:</strong> Choose a term (Net 7, Net 15, Net 30, etc.) that balances client preferences and 
                  your cash flow needs. Shorter terms usually result in faster payments.
                </li>
                <li>
                  <strong>Specify acceptable payment methods:</strong> Make it easy for clients by accepting bank transfers, mobile money, 
                  debit cards or digital gateways like Paystack and Flutterwave.
                </li>
                <li>
                  <strong>Clarify penalties:</strong> Include a late fee or interest rate (e.g., 1% per week) and the date penalties start. 
                  This acts as a deterrent to late payment.
                </li>
                <li>
                  <strong>Offer early payment discounts:</strong> Encourage prompt payment by offering a small discount for paying earlier 
                  (e.g., 2% discount if paid within 10 days).
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sending Reminders</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                According to invoicing best practices, you should send reminders at three stages:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <strong>Pre‑due reminder:</strong> Send a friendly reminder 2–3 days before the due date to ensure your invoice is 
                  top of mind.
                </li>
                <li>
                  <strong>On‑due reminder:</strong> On the due date, send a short message thanking them for their business and reminding 
                  them that payment is due.
                </li>
                <li>
                  <strong>Past‑due reminder:</strong> If the payment date passes, send a past‑due invoice with a polite but firm reminder, 
                  restate the late fee, and ask if there are any issues delaying payment. For persistent non‑payment, issue a demand 
                  letter or consider alternate dispute resolution before legal action.
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Following a structured reminder schedule improves the likelihood of timely payment and demonstrates professionalism.
              </p>
            </div>
          </div>
        </section>

        {/* Accounting Basics */}
        <section id="accounting-basics" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Accounting Basics for Invoicing</h2>
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Bookkeeping vs. Accounting</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                <strong>Bookkeeping</strong> involves recording daily financial transactions—sales, purchases, receipts and payments. 
                Accurate bookkeeping ensures you have up‑to‑date records for decision‑making and tax compliance.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Accounting</strong> goes further: summarising, analysing and interpreting financial data to produce reports like 
                the income statement, balance sheet and cash flow statements.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Chart of Accounts and Key Terms</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Chart of accounts:</strong> A structured list of categories that businesses use to record transactions. Common categories include Assets, Liabilities, Equity, Income and Expenses.</li>
                <li><strong>Accounts Receivable (A/R):</strong> Money owed to your business by customers for sales made on credit. Invoices create accounts receivable entries.</li>
                <li><strong>Accounts Payable (A/P):</strong> Money your business owes to suppliers for purchases made on credit.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Record‑Keeping and Compliance</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Maintain a copy of every invoice issued and received. For VAT-registered businesses, keep records for at least 10 years.</li>
                <li>Ensure that VAT collected is correctly remitted to the Federal Inland Revenue Service (FIRS). VAT returns are due on or before the 21st day of the month following the month of supply.</li>
                <li>Unregistered businesses should not charge VAT; doing so attracts penalties up to 100% of the VAT shown.</li>
                <li>Use business software or professional accountants to prepare financial statements and ensure compliance with FIRS and the Financial Reporting Council of Nigeria.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Choosing Software */}
        <section id="choosing-software" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choosing Accounting and Invoicing Software</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-700 leading-relaxed mb-6">
              When selecting software for your business, consider features that support invoicing and bookkeeping:
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Why It Matters
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      General ledger & chart of accounts
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Keeps records structured and aids compliance
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Invoicing module
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Automates creation of invoices, numbering, VAT calculations and reminders
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Accounts receivable/payable tracking
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Helps manage money owed to and by the business.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Inventory management
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Useful if you sell physical goods and need to track stock levels.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Multiple payment options & integration
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Allows clients to pay via bank transfer, cards or mobile money, promoting faster payment
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Reporting & analytics
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Generates financial statements and cash flow reports for decision‑making.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-700 leading-relaxed mt-6">
              Popular accounting solutions in Nigeria include QuickBooks, Xero, FreshBooks, ProInvoice, and local solutions like Bumpa 
              and Invoice.ng. Many integrate with local payment gateways and support VAT computation.
            </p>
          </div>
        </section>

        {/* Compliance */}
        <section id="compliance" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Compliance and Nigerian Regulatory Requirements</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <ul className="list-disc list-inside space-y-3 text-gray-700">
              <li>
                <strong>VAT registration:</strong> Businesses with an annual turnover of ₦25 million or more must register for VAT and 
                issue VAT invoices. Voluntary registration is allowed.
              </li>
              <li>
                <strong>E‑Invoicing initiatives:</strong> The FIRS is developing an electronic invoicing system (Merchant Buyer Solution) 
                that will require businesses to issue digital invoices with a unique reference number, QR code and digital signature. 
                Full deployment is expected in July 2025.
              </li>
              <li>
                <strong>Sequential numbering:</strong> Receipts and invoices must follow an unbroken sequential numbering system each calendar year.
              </li>
              <li>
                <strong>Invoice contents:</strong> FIRS guidelines require invoices to include date, quantity, price, description of goods 
                or services, names and addresses of supplier and customer, and VAT details where applicable.
              </li>
              <li>
                <strong>Record retention:</strong> Keep invoicing records for at least 10 years to support tax audits and compliance.
              </li>
            </ul>
          </div>
        </section>

        {/* Best Practices */}
        <section id="best-practices" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Best Practices and Tips</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <ul className="list-disc list-inside space-y-3 text-gray-700">
              <li><strong>Issue invoices promptly:</strong> Send invoices immediately after delivering goods or completing services; this speeds up payment.</li>
              <li><strong>Use polite language:</strong> Studies show that invoices with polite phrases like "please" and "thank you" are paid faster.</li>
              <li><strong>Offer multiple payment options:</strong> Give clients flexibility by accepting bank transfers, cards, USSD and mobile money.</li>
              <li><strong>Follow up consistently:</strong> Use automated reminders or manual emails to remind clients of upcoming and overdue payments.</li>
              <li><strong>Maintain professional records:</strong> Keep copies of all invoices and receipts, and ensure that invoice numbers are sequential and traceable.</li>
              <li><strong>Understand VAT obligations:</strong> Register for VAT if your turnover exceeds the threshold, issue VAT invoices, and remit VAT by the 21st day of the following month.</li>
              <li><strong>Seek professional advice:</strong> If unsure about tax compliance or accounting, consult an accountant or tax adviser. Mistakes can lead to penalties or delayed payments.</li>
            </ul>
          </div>
        </section>

        {/* Conclusion */}
        <section id="conclusion" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Conclusion</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-700 leading-relaxed">
              Invoicing is more than just requesting payment—it is a fundamental business process that affects cash flow, tax compliance 
              and client relationships. By understanding the essential components of an invoice, choosing the appropriate type, setting clear 
              payment terms, using reminders and adopting accounting software, Nigerian businesses can improve efficiency, reduce late payments 
              and maintain compliance with FIRS regulations. Use this guide as a reference for invoicing best practices and adapt it to suit 
              your industry and client needs.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

