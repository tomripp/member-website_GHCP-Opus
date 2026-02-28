import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted to ensure the mock is available before vi.mock runs
const { mockSend } = vi.hoisted(() => {
  const mockSend = vi.fn().mockResolvedValue({ data: { id: 'email-1' }, error: null });
  return { mockSend };
});

// Mock Resend
vi.mock('resend', () => {
  return {
    Resend: class MockResend {
      emails = { send: mockSend };
    },
  };
});

// Set env vars before import
vi.stubEnv('RESEND_API_KEY', 'test-key');
vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');

import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/email';

describe('Email utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendVerificationEmail', () => {
    it('should send email with English content by default', async () => {
      await sendVerificationEmail('test@example.com', 'abc123');

      expect(mockSend).toHaveBeenCalledOnce();
      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.to).toEqual(['test@example.com']);
      expect(callArgs.subject).toContain('Verify your email');
      expect(callArgs.html).toContain('abc123');
      expect(callArgs.html).toContain('Verify Your Email Address');
    });

    it('should send email with German content when locale is "de"', async () => {
      await sendVerificationEmail('test@example.com', 'abc123', 'de');

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.subject).toContain('E-Mail bestätigen');
      expect(callArgs.html).toContain('E-Mail-Adresse bestätigen');
    });

    it('should include the correct verification URL with locale', async () => {
      await sendVerificationEmail('test@example.com', 'token123', 'en');

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.html).toContain(
        'http://localhost:3000/en/auth/verify-email?token=token123'
      );
    });

    it('should include the correct verification URL for German locale', async () => {
      await sendVerificationEmail('test@example.com', 'token123', 'de');

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.html).toContain(
        'http://localhost:3000/de/auth/verify-email?token=token123'
      );
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send email with English content by default', async () => {
      await sendPasswordResetEmail('test@example.com', 'reset123');

      expect(mockSend).toHaveBeenCalledOnce();
      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.to).toEqual(['test@example.com']);
      expect(callArgs.subject).toContain('Reset your password');
      expect(callArgs.html).toContain('Reset Your Password');
    });

    it('should send email with German content when locale is "de"', async () => {
      await sendPasswordResetEmail('test@example.com', 'reset123', 'de');

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.subject).toContain('Passwort zurücksetzen');
      expect(callArgs.html).toContain('Passwort zurücksetzen');
    });

    it('should include the correct reset URL', async () => {
      await sendPasswordResetEmail('test@example.com', 'resettoken', 'en');

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.html).toContain(
        'http://localhost:3000/en/auth/reset-password?token=resettoken'
      );
    });
  });
});
