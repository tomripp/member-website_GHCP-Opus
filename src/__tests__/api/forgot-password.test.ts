import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock email
vi.mock('@/lib/email', () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}));

import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import { POST } from '@/app/api/auth/forgot-password/route';

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/auth/forgot-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 for invalid email', async () => {
    const request = createRequest({ email: 'not-valid' });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('should return 200 even when user does not exist (prevent enumeration)', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

    const request = createRequest({ email: 'nonexistent@example.com' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toContain('If an account exists');
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('should generate reset token and send email for existing user', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test',
      passwordHash: 'hash',
      emailVerified: true,
      verificationToken: null,
      resetToken: null,
      resetTokenExpiry: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);
    vi.mocked(prisma.user.update).mockResolvedValueOnce({
      ...mockUser,
      resetToken: 'new-token',
      resetTokenExpiry: new Date(),
    });

    const request = createRequest({ email: 'test@example.com', locale: 'de' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        resetToken: expect.any(String),
        resetTokenExpiry: expect.any(Date),
      },
    });
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      'test@example.com',
      expect.any(String),
      'de'
    );
  });

  it('should default to "en" locale when none provided', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test',
      passwordHash: 'hash',
      emailVerified: true,
      verificationToken: null,
      resetToken: null,
      resetTokenExpiry: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);
    vi.mocked(prisma.user.update).mockResolvedValueOnce({
      ...mockUser,
      resetToken: 'token',
      resetTokenExpiry: new Date(),
    });

    const request = createRequest({ email: 'test@example.com' });
    await POST(request);

    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      'test@example.com',
      expect.any(String),
      'en'
    );
  });
});
