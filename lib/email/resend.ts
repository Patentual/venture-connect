import { Resend } from 'resend';

const FROM_EMAIL = process.env.FROM_EMAIL || 'VentureNex <noreply@ventureconnect.app>';

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export type EmailTemplate = 'welcome' | 'nda_invite' | 'project_invite' | 'nda_signed' | 'nda_declined' | 'team_joined';

interface SendEmailOptions {
  to: string;
  template: EmailTemplate;
  data: Record<string, string>;
}

// Template definitions
function getEmailContent(template: EmailTemplate, data: Record<string, string>): { subject: string; html: string } {
  switch (template) {
    case 'welcome':
      return {
        subject: 'Welcome to VentureNex!',
        html: buildHtml({
          preheader: 'Your professional journey starts here.',
          heading: `Welcome, ${data.name}!`,
          body: `
            <p>Thanks for joining VentureNex — the global business directory where projects find the right people.</p>
            <p>Here's what you can do now:</p>
            <ul>
              <li><strong>Complete your profile</strong> so project creators can find you</li>
              <li><strong>Explore the directory</strong> to see other professionals</li>
              <li><strong>Use the AI Project Planner</strong> to scope your next venture</li>
            </ul>
          `,
          ctaText: 'Complete Your Profile',
          ctaUrl: data.profileUrl || '#',
        }),
      };

    case 'nda_invite':
      return {
        subject: `NDA Required — ${data.projectTitle}`,
        html: buildHtml({
          preheader: `${data.senderName} wants you on a project.`,
          heading: 'You\'ve Been Invited to a Project',
          body: `
            <p><strong>${data.senderName}</strong> has invited you to join the project <strong>${data.projectTitle}</strong> as a <strong>${data.role}</strong>.</p>
            <p>Before you can see the full project details, you'll need to review and sign a Non-Disclosure Agreement (NDA).</p>
            <p style="color: #71717a; font-size: 13px;">This NDA is standard practice to protect confidential project information.</p>
          `,
          ctaText: 'Review NDA & Project Details',
          ctaUrl: data.ndaUrl || '#',
        }),
      };

    case 'project_invite':
      return {
        subject: `New Project Opportunity — ${data.role}`,
        html: buildHtml({
          preheader: `Your skills matched a project opportunity.`,
          heading: 'New Project Opportunity',
          body: `
            <p>Based on your profile, you've been identified as a great fit for a new project:</p>
            <div style="background: #f4f4f5; border-radius: 12px; padding: 16px; margin: 16px 0;">
              <p style="font-weight: 600; margin: 0;">${data.projectTitle}</p>
              <p style="color: #71717a; margin: 4px 0 0;">Role: ${data.role}</p>
            </div>
            <p>${data.outreachMessage}</p>
          `,
          ctaText: 'View Invitation',
          ctaUrl: data.invitationUrl || '#',
        }),
      };

    case 'nda_signed':
      return {
        subject: `NDA Signed — ${data.recipientName} has signed`,
        html: buildHtml({
          preheader: `${data.recipientName} signed the NDA for ${data.projectTitle}.`,
          heading: 'NDA Signed Successfully',
          body: `
            <p><strong>${data.recipientName}</strong> has signed the NDA for <strong>${data.projectTitle}</strong>.</p>
            <p>They now have access to the full project details. You can review their profile and approve them to join the workspace.</p>
          `,
          ctaText: 'View in Project Workspace',
          ctaUrl: data.workspaceUrl || '#',
        }),
      };

    case 'nda_declined':
      return {
        subject: `NDA Declined — ${data.recipientName}`,
        html: buildHtml({
          preheader: `${data.recipientName} has declined the NDA.`,
          heading: 'NDA Declined',
          body: `
            <p><strong>${data.recipientName}</strong> has declined the NDA for <strong>${data.projectTitle}</strong>.</p>
            <p>You may want to search for alternative candidates for the <strong>${data.role}</strong> role.</p>
          `,
          ctaText: 'Search Directory',
          ctaUrl: data.directoryUrl || '#',
        }),
      };

    case 'team_joined':
      return {
        subject: `Welcome to ${data.projectTitle}!`,
        html: buildHtml({
          preheader: 'You now have access to the project workspace.',
          heading: `You've Joined ${data.projectTitle}`,
          body: `
            <p>You've been approved to join <strong>${data.projectTitle}</strong> as a <strong>${data.role}</strong>.</p>
            <p>You now have full access to the secure project workspace including:</p>
            <ul>
              <li>Project timeline and milestones</li>
              <li>Team discussions</li>
              <li>Shared files and documents</li>
            </ul>
          `,
          ctaText: 'Open Project Workspace',
          ctaUrl: data.workspaceUrl || '#',
        }),
      };

    default:
      return { subject: 'Notification', html: '<p>You have a new notification.</p>' };
  }
}

// Branded HTML email template
function buildHtml(opts: {
  preheader: string;
  heading: string;
  body: string;
  ctaText: string;
  ctaUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>VentureNex</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <span style="display:none;font-size:1px;color:#f4f4f5;max-height:0;overflow:hidden;">${opts.preheader}</span>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:32px 32px 24px;">
            <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">VentureNex</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#18181b;">${opts.heading}</h1>
            <div style="font-size:15px;line-height:1.6;color:#3f3f46;">
              ${opts.body}
            </div>
            <table cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
              <tr>
                <td style="background:linear-gradient(135deg,#2563eb,#7c3aed);border-radius:12px;padding:12px 28px;">
                  <a href="${opts.ctaUrl}" style="color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;display:inline-block;">${opts.ctaText}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 32px;border-top:1px solid #e4e4e7;">
            <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.5;">
              VentureNex — The global business directory for project-based teams.<br>
              You're receiving this because you have a VentureNex account.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendEmail(options: SendEmailOptions): Promise<{ id: string }> {
  const { subject, html } = getEmailContent(options.template, options.data);

  const resend = getResend();
  if (!resend) {
    console.log(`[Email Mock] To: ${options.to}, Subject: ${subject}`);
    return { id: 'mock-' + Date.now() };
  }

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: options.to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return { id: data?.id || '' };
}
