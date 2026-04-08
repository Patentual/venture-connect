import { sendEmail } from '@/lib/email/resend';
import type { EmailTemplate } from '@/lib/email/resend';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, template, data } = body;

    if (!to || !template) {
      return Response.json(
        { error: 'Missing required fields: to, template' },
        { status: 400 }
      );
    }

    const validTemplates: EmailTemplate[] = [
      'welcome',
      'nda_invite',
      'project_invite',
      'nda_signed',
      'nda_declined',
      'team_joined',
    ];

    if (!validTemplates.includes(template)) {
      return Response.json(
        { error: `Invalid template. Must be one of: ${validTemplates.join(', ')}` },
        { status: 400 }
      );
    }

    const result = await sendEmail({ to, template, data: data || {} });

    return Response.json({ success: true, emailId: result.id });
  } catch (error) {
    console.error('Email send error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
