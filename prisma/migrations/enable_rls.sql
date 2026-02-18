-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InvoiceReminderSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentCredential" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmailLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RefreshToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CompanyDefaults" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InvoiceNumberSequence" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PricingSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecurringInvoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CreditNote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Estimate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WhatsAppCredential" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WhatsAppSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BlogPost" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SystemLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LLMSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Note" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TimeLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SystemSetting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InvoiceTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmailNotificationTemplate" ENABLE ROW LEVEL SECURITY;


-- 1. Policies for "User" table
-- Allows users to view their own profile
CREATE POLICY "Users can view own data" ON "User" FOR SELECT USING (id = auth.uid());
-- Allows users to update their own profile
CREATE POLICY "Users can update own data" ON "User" FOR UPDATE USING (id = auth.uid());


-- 2. Policies for "Invoice" table
CREATE POLICY "Users can do all on own invoices" ON "Invoice" FOR ALL USING ("userId" = auth.uid());


-- 3. Policies for other user-owned tables
CREATE POLICY "Users can do all on own payment creds" ON "PaymentCredential" FOR ALL USING ("userId" = auth.uid());
CREATE POLICY "Users can do all on own reminder settings" ON "InvoiceReminderSettings" FOR ALL USING ("userId" = auth.uid());
CREATE POLICY "Users can do all on own payments" ON "Payment" FOR ALL USING ("userId" = auth.uid());
CREATE POLICY "Users can view own email logs" ON "EmailLog" FOR SELECT USING ("userId" = auth.uid());
CREATE POLICY "Users can do all on own refresh tokens" ON "RefreshToken" FOR ALL USING ("userId" = auth.uid());
CREATE POLICY "Users can do all on own company defaults" ON "CompanyDefaults" FOR ALL USING ("userId" = auth.uid());
CREATE POLICY "Users can do all on own clients" ON "Client" FOR ALL USING ("userId" = auth.uid());
CREATE POLICY "Users can do all on own sequences" ON "InvoiceNumberSequence" FOR ALL USING ("userId" = auth.uid());
CREATE POLICY "Users can do all on own recurring invoices" ON "RecurringInvoice" FOR ALL USING ("userId" = auth.uid());
CREATE POLICY "Users can do all on own credit notes" ON "CreditNote" FOR ALL USING ("userId" = auth.uid());
CREATE POLICY "Users can do all on own estimates" ON "Estimate" FOR ALL USING ("userId" = auth.uid());
CREATE POLICY "Users can do all on own whatsapp creds" ON "WhatsAppCredential" FOR ALL USING ("userId" = auth.uid());
CREATE POLICY "Users can do all on own notes" ON "Note" FOR ALL USING ("userId" = auth.uid());
CREATE POLICY "Users can do all on own tasks" ON "Task" FOR ALL USING ("userId" = auth.uid());
CREATE POLICY "Users can do all on own time logs" ON "TimeLog" FOR ALL USING ("userId" = auth.uid());
CREATE POLICY "Users can do all on own templates" ON "InvoiceTemplate" FOR ALL USING ("userId" = auth.uid());


-- 4. Single-User / Global Settings Tables (Admin only)
-- Note: 'isAdmin' is a boolean field on the "User" table. We check if the requesting user is an admin.

CREATE POLICY "Admins can view/edit whatsapp settings" ON "WhatsAppSettings" FOR ALL USING (
  exists (select 1 from "User" where id = auth.uid() and "isAdmin" = true)
);

CREATE POLICY "Admins can view/edit llm settings" ON "LLMSettings" FOR ALL USING (
  exists (select 1 from "User" where id = auth.uid() and "isAdmin" = true)
);

CREATE POLICY "Admins can view/edit system settings" ON "SystemSetting" FOR ALL USING (
  exists (select 1 from "User" where id = auth.uid() and "isAdmin" = true)
);

CREATE POLICY "Admins can view/edit email templates" ON "EmailNotificationTemplate" FOR ALL USING (
  exists (select 1 from "User" where id = auth.uid() and "isAdmin" = true)
);


-- 5. Content Tables
-- BlogPost
CREATE POLICY "Authors can manage own posts" ON "BlogPost" FOR ALL USING ("authorId" = auth.uid());
CREATE POLICY "Public can view published posts" ON "BlogPost" FOR SELECT USING ("published" = true);


-- 6. System Logs
CREATE POLICY "Admins can view system logs" ON "SystemLog" FOR SELECT USING (
  exists (select 1 from "User" where id = auth.uid() and "isAdmin" = true)
);


-- 7. PricingSettings
CREATE POLICY "Public can view pricing" ON "PricingSettings" FOR SELECT USING (true);
CREATE POLICY "Admins can manage pricing" ON "PricingSettings" FOR ALL USING (
  exists (select 1 from "User" where id = auth.uid() and "isAdmin" = true)
);
