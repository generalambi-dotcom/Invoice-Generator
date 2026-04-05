import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import nodemailer from 'nodemailer';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, email, message } = await request.json();
    const userId = params.id;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Securely pull the recipient's private email address
    const recipientBusiness = await prisma.user.findUnique({
      where: { id: userId, directoryOptIn: true },
      select: { email: true, name: true }
    });

    if (!recipientBusiness) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #6B4CE6; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">New Lead from InvoiceGenerator.ng</h2>
        </div>
        <div style="padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Hello <strong>${recipientBusiness.name}</strong>,</p>
          <p>You have received a new contact request through your public business directory profile!</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${name} &lt;<a href="mailto:${email}">${email}</a>&gt;</p>
            <p style="margin: 0; white-space: pre-wrap;"><strong>Message:</strong><br/><br/>${message}</p>
          </div>
          
          <p>Reply directly to this email to get in touch with them.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center;">
            This email was sent via your public profile on InvoiceGenerator.ng.<br/>
            You can manage your visibility settings in your Dashboard.
          </p>
        </div>
      </div>
    `;

    // Dispatch
    await transporter.sendMail({
      from: `"InvoiceGenerator Leads" <${process.env.SYSTEM_EMAIL || 'leads@invoicegenerator.ng'}>`,
      to: recipientBusiness.email,
      replyTo: email, 
      subject: `New Lead: ${name} sent you a message`,
      html: htmlTemplate,
    });

    return NextResponse.json({ success: true, message: 'Message sent successfully' });

  } catch (error) {
    console.error('Failed to send contact email:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
