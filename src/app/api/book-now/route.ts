import { NextRequest, NextResponse } from 'next/server';
import { SITE_CONTACT } from '@/lib/site-contact';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, destination, travel_date, travelers, message, inquiryId } = body;

    const html = `
      <h2>New Book Now request — Tempesttrek</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Destination:</strong> ${escapeHtml(destination || '—')}</p>
      <p><strong>Travel date:</strong> ${escapeHtml(travel_date || 'Flexible')}</p>
      <p><strong>Travelers:</strong> ${escapeHtml(String(travelers || '—'))}</p>
      <p><strong>Inquiry ID:</strong> ${escapeHtml(inquiryId || '—')}</p>
      <hr />
      <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(message || '')}</pre>
    `;

    const text = `New booking from ${name}\nEmail: ${email}\nPhone: ${phone}\n${message || ''}`;

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'Tempesttrek <onboarding@resend.dev>',
          to: [SITE_CONTACT.email],
          reply_to: email,
          subject: `Book Now: ${name} — ${destination || 'Kashmir'}`,
          html,
          text,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error('Resend error:', err);
      }
    } else {
      console.log('📧 Book Now email (configure RESEND_API_KEY to deliver):', {
        to: SITE_CONTACT.email,
        subject: `Book Now: ${name}`,
        text,
      });
    }

    await fetch(`${request.nextUrl.origin}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: SITE_CONTACT.email,
        subject: `Book Now: ${name}`,
        html,
        text,
      }),
    }).catch(() => undefined);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
