import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('app.smtpHost');
    const user = this.configService.get<string>('app.smtpUser');

    this.transporter = host && user
      ? nodemailer.createTransport({
          host,
          port: this.configService.get<number>('app.smtpPort') ?? 587,
          secure: false,
          auth: {
            user,
            pass: this.configService.get<string>('app.smtpPass')
          }
        })
      : null;
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      this.logger.debug(`Email skipped for ${to}: transporter not configured.`);
      return;
    }

    await this.transporter.sendMail({
      from: this.configService.get<string>('app.smtpFrom'),
      to,
      subject,
      html
    });
  }
}
