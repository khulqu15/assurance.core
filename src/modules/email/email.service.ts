import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendEmailVerification(
    email: string,
    fullName: string,
    verificationUrl: string,
  ) {
    const html = this.buildEmailLayout({
      preheader: 'Verify your email address to activate your account.',
      badge: 'Email Verification',
      title: 'Verify your email address',
      greeting: `Hello, ${this.escapeHtml(fullName)}`,
      body: `
        <p style="margin:0 0 16px 0;">
          Thanks for registering. Please verify your email address to activate your account and continue using the insurance approval platform.
        </p>
        <p style="margin:0 0 24px 0;">
          Click the button below to complete your email verification.
        </p>
      `,
      buttonLabel: 'Verify Email',
      buttonUrl: verificationUrl,
      footerNote:
        'If you did not create this account, you can safely ignore this email.',
    });

    await this.safeSendMail({
      to: email,
      subject: 'Verify your email address',
      html,
    });
  }

  async sendResetPassword(
    email: string,
    fullName: string,
    resetUrl: string,
  ) {
    const html = this.buildEmailLayout({
      preheader: 'Reset your password securely.',
      badge: 'Password Reset',
      title: 'Reset your password',
      greeting: `Hello, ${this.escapeHtml(fullName)}`,
      body: `
        <p style="margin:0 0 16px 0;">
          We received a request to reset your password for your Insurance Approval account.
        </p>
        <p style="margin:0 0 24px 0;">
          Click the button below to set a new password. This link should only be used by you.
        </p>
      `,
      buttonLabel: 'Reset Password',
      buttonUrl: resetUrl,
      footerNote:
        'If you did not request a password reset, you can ignore this email and your password will remain unchanged.',
    });

    await this.safeSendMail({
      to: email,
      subject: 'Reset your password',
      html,
    });
  }

  async sendClaimStatusNotification(params: {
    to: string;
    fullName: string;
    claimNumber: string;
    status: string;
    note?: string | null;
  }) {
    const statusLabel = this.escapeHtml(params.status.toUpperCase());
    const claimNumber = this.escapeHtml(params.claimNumber);

    const html = this.buildEmailLayout({
      preheader: `Your claim ${claimNumber} has a new status.`,
      badge: 'Claim Update',
      title: `Claim ${claimNumber} status updated`,
      greeting: `Hello, ${this.escapeHtml(params.fullName)}`,
      body: `
        <p style="margin:0 0 16px 0;">
          Your claim <strong>${claimNumber}</strong> has been updated in the system.
        </p>

        <div style="margin:0 0 20px 0; padding:16px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px;">
          <div style="font-size:12px; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:8px;">
            Current Status
          </div>
          <div style="display:inline-block; background:#dbeafe; color:#1d4ed8; font-weight:800; font-size:13px; padding:8px 14px; border-radius:999px;">
            ${statusLabel}
          </div>
        </div>

        ${
          params.note
            ? `
              <div style="margin:0 0 8px 0; padding:16px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:16px;">
                <div style="font-size:12px; color:#1d4ed8; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:8px;">
                  Note
                </div>
                <div style="color:#334155; line-height:1.7;">
                  ${this.escapeHtml(params.note)}
                </div>
              </div>
            `
            : ''
        }
      `,
      footerNote:
        'You are receiving this notification because claim status alerts are enabled for your account.',
    });

    await this.safeSendMail({
      to: params.to,
      subject: `Claim ${params.claimNumber} status updated to ${params.status}`,
      html,
    });
  }

  async sendSystemUpdate(params: {
    to: string;
    fullName: string;
    title: string;
    content: string;
  }) {
    const html = this.buildEmailLayout({
      preheader: params.title,
      badge: 'System Update',
      title: this.escapeHtml(params.title),
      greeting: `Hello, ${this.escapeHtml(params.fullName)}`,
      body: `
        <div style="margin:0; line-height:1.8; color:#334155;">
          ${params.content}
        </div>
      `,
      footerNote:
        'This message contains the latest information and updates from the system.',
    });

    await this.safeSendMail({
      to: params.to,
      subject: params.title,
      html,
    });
  }

  private buildEmailLayout(params: {
    preheader: string;
    badge: string;
    title: string;
    greeting: string;
    body: string;
    buttonLabel?: string;
    buttonUrl?: string;
    footerNote?: string;
  }): string {
    const buttonBlock =
      params.buttonLabel && params.buttonUrl
        ? `
          <div style="margin:28px 0 28px 0; text-align:center;">
            <a
              href="${this.escapeAttribute(params.buttonUrl)}"
              style="
                display:inline-block;
                background:#2563eb;
                color:#ffffff;
                text-decoration:none;
                font-weight:800;
                font-size:15px;
                padding:14px 24px;
                border-radius:16px;
                box-shadow:0 10px 24px rgba(37, 99, 235, 0.22);
              "
            >
              ${this.escapeHtml(params.buttonLabel)}
            </a>
          </div>

          <div style="margin:0 0 8px 0; color:#64748b; font-size:13px; line-height:1.7;">
            If the button above does not work, copy and paste this link into your browser:
          </div>
          <div style="word-break:break-word; color:#2563eb; font-size:13px; line-height:1.7;">
            ${this.escapeHtml(params.buttonUrl)}
          </div>
        `
        : '';

    return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${this.escapeHtml(params.title)}</title>
  </head>
  <body style="margin:0; padding:0; background:#f8fafc; font-family:Arial, Helvetica, sans-serif; color:#334155;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">
      ${this.escapeHtml(params.preheader)}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fafc; margin:0; padding:24px 0;">
      <tr>
        <td align="center">
          <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="max-width:640px; margin:0 auto;"
          >
            <tr>
              <td style="padding:0 20px;">
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    background:linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
                    border-radius:28px 28px 0 0;
                    padding:28px 28px 22px 28px;
                  "
                >
                  <tr>
                    <td>
                      <div style="display:inline-block; background:#ffffff; color:#2563eb; font-weight:900; font-size:18px; width:52px; height:52px; line-height:52px; text-align:center; border-radius:18px; box-shadow:0 10px 30px rgba(255,255,255,0.22);">
                        AQ
                      </div>

                      <div style="margin-top:18px;">
                        <div style="display:inline-block; padding:8px 14px; border-radius:999px; background:rgba(255,255,255,0.14); color:#ffffff; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.12em;">
                          ${this.escapeHtml(params.badge)}
                        </div>
                      </div>

                      <h1 style="margin:18px 0 0 0; font-size:30px; line-height:1.2; color:#ffffff; font-weight:900;">
                        ${this.escapeHtml(params.title)}
                      </h1>
                    </td>
                  </tr>
                </table>

                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    background:#ffffff;
                    border:1px solid #e2e8f0;
                    border-top:none;
                    border-radius:0 0 28px 28px;
                    box-shadow:0 24px 60px rgba(15, 23, 42, 0.08);
                  "
                >
                  <tr>
                    <td style="padding:32px 28px;">
                      <div style="font-size:16px; font-weight:800; color:#0f172a; margin:0 0 16px 0;">
                        ${params.greeting}
                      </div>

                      <div style="font-size:15px; line-height:1.8; color:#475569;">
                        ${params.body}
                      </div>

                      ${buttonBlock}

                      ${
                        params.footerNote
                          ? `
                            <div style="margin-top:28px; padding-top:20px; border-top:1px solid #e2e8f0; font-size:12px; line-height:1.8; color:#64748b;">
                              ${this.escapeHtml(params.footerNote)}
                            </div>
                          `
                          : ''
                      }
                    </td>
                  </tr>
                </table>

                <div style="padding:18px 8px 0 8px; text-align:center; font-size:12px; color:#94a3b8; line-height:1.8;">
                  Insurance Approval System<br />
                  Fast • Clear • Traceable
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `;
  }

  private async safeSendMail(params: {
    to: string;
    subject: string;
    html: string;
  }) {
    try {
      await this.mailerService.sendMail(params);
      this.logger.log(`Email sent to ${params.to} with subject "${params.subject}"`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${params.to} with subject "${params.subject}"`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private escapeAttribute(value: string): string {
    return this.escapeHtml(value);
  }
}