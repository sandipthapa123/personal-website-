import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface ISendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly fromName: string;
  private readonly fromEmail: string;
  private readonly appName: string;
  private readonly appUrl: string;

  constructor(private configService: ConfigService) {
    this.fromName = this.configService.get<string>('MAIL_FROM_NAME') || 'Sandip Thapa';
    this.fromEmail = this.configService.get<string>('MAIL_FROM_EMAIL') || 'no-reply@thapasandip.com.np';
    this.appName = this.configService.get<string>('APP_NAME') || 'Sandip Thapa CMS Platform';
    this.appUrl = (this.configService.get<string>('APP_URL') || 'http://localhost:4000').replace(/\/+$/, '');

    const host = this.configService.get<string>('MAIL_HOST');
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(this.configService.get<string>('MAIL_PORT')) || 587,
        secure: this.configService.get<string>('MAIL_SECURE') === 'true',
        requireTLS: this.configService.get<string>('MAIL_REQUIRE_TLS') !== 'false',
        auth: { user, pass },
      });
    } else {
      this.logger.warn('MAIL_HOST/MAIL_USER/MAIL_PASS not fully configured — emails will be logged, not sent.');
    }
  }

  get baseUrl(): string {
    return this.appUrl;
  }

  /** Core send primitive. Never throws — a mail delivery failure must not break the calling request; the
   *  triggering link/token remains valid and usable regardless, and is always logged as a fallback. */
  async sendMail(options: ISendMailOptions): Promise<boolean> {
    if (!this.transporter) {
      this.logger.log(`[DEV MAIL] To: ${options.to} | Subject: ${options.subject}\n${options.text || options.html}`);
      return false;
    }
    try {
      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    } catch (err) {
      this.logger.error(`Failed to send email to ${options.to}: ${(err as Error).message}`);
      this.logger.log(`[UNDELIVERED MAIL FALLBACK] To: ${options.to} | Subject: ${options.subject}\n${options.text || options.html}`);
      return false;
    }
  }

  private wrap(title: string, bodyHtml: string): string {
    return `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0f172a;">
      <h2 style="margin:0 0 16px;">${title}</h2>
      ${bodyHtml}
      <p style="margin-top:32px;font-size:12px;color:#64748b;">${this.appName}</p>
    </div>`;
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
    return this.sendMail({
      to,
      subject: `Reset your ${this.appName} password`,
      html: this.wrap(
        'Reset your password',
        `<p>We received a request to reset the password for this account. This link expires in 1 hour and can only be used once.</p>
         <p><a href="${resetUrl}" style="display:inline-block;padding:10px 18px;background:#0284c7;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Reset Password</a></p>
         <p>If you didn't request this, you can safely ignore this email — your password will not change.</p>`,
      ),
      text: `Reset your password: ${resetUrl} (expires in 1 hour, one-time use)`,
    });
  }

  async sendInviteEmail(to: string, inviteUrl: string, inviterName?: string): Promise<boolean> {
    return this.sendMail({
      to,
      subject: `You've been invited to ${this.appName}`,
      html: this.wrap(
        'You have been invited',
        `<p>${inviterName || 'An administrator'} has invited you to join ${this.appName}. Click below to set your password and activate your account. This link expires in 7 days.</p>
         <p><a href="${inviteUrl}" style="display:inline-block;padding:10px 18px;background:#0284c7;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Accept Invite</a></p>`,
      ),
      text: `You've been invited to ${this.appName}. Accept: ${inviteUrl} (expires in 7 days)`,
    });
  }

  async sendEmailChangeConfirmation(to: string, confirmUrl: string): Promise<boolean> {
    return this.sendMail({
      to,
      subject: `Confirm your new email for ${this.appName}`,
      html: this.wrap(
        'Confirm your new email address',
        `<p>Click below to confirm this address as your new account email. This link expires in 1 hour and can only be used once.</p>
         <p><a href="${confirmUrl}" style="display:inline-block;padding:10px 18px;background:#0284c7;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Confirm Email</a></p>
         <p>If you didn't request this change, please contact the site administrator.</p>`,
      ),
      text: `Confirm your new email: ${confirmUrl} (expires in 1 hour, one-time use)`,
    });
  }

  async sendPasswordChangedNotice(to: string): Promise<boolean> {
    return this.sendMail({
      to,
      subject: `Your ${this.appName} password was changed`,
      html: this.wrap(
        'Password changed',
        `<p>The password for this account was just changed. All other active sessions have been signed out.</p>
         <p>If this wasn't you, reset your password immediately and contact the site administrator.</p>`,
      ),
      text: `Your password was changed. All other active sessions have been signed out. If this wasn't you, reset your password immediately.`,
    });
  }
}
