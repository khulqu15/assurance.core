import { Test } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('EmailService', () => {
  let service: EmailService;
  let mailerService: { sendMail: jest.Mock };

  beforeEach(async () => {
    mailerService = {
      sendMail: (jest.fn() as jest.Mock<any>).mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: MailerService, useValue: mailerService },
      ],
    }).compile();

    service = moduleRef.get(EmailService);
  });

  it('should send verification email', async () => {
    await service.sendEmailVerification(
      'budi@example.com',
      'Budi',
      'http://localhost:8100/verify?token=abc',
    );

    expect(mailerService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'budi@example.com',
        subject: expect.stringContaining('Verify'),
        html: expect.stringContaining('Verify Email'),
      }),
    );
  });

  it('should send reset password email', async () => {
    await service.sendResetPassword(
      'budi@example.com',
      'Budi',
      'http://localhost:8100/reset?token=abc',
    );

    expect(mailerService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'budi@example.com',
        subject: expect.stringContaining('Reset'),
        html: expect.stringContaining('Reset Password'),
      }),
    );
  });

  it('should send claim status notification', async () => {
    await service.sendClaimStatusNotification({
      to: 'budi@example.com',
      fullName: 'Budi',
      claimNumber: 'CLM-001',
      status: 'approved',
      note: 'Approved by approver',
    });

    expect(mailerService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'budi@example.com',
        subject: expect.stringContaining('CLM-001'),
        html: expect.stringContaining('APPROVED'),
      }),
    );
  });

  it('should send system update email', async () => {
    await service.sendSystemUpdate({
      to: 'budi@example.com',
      fullName: 'Budi',
      title: 'System Maintenance',
      content: 'Maintenance tonight.',
    });

    expect(mailerService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'budi@example.com',
        subject: 'System Maintenance',
        html: expect.stringContaining('Maintenance tonight.'),
      }),
    );
  });
});