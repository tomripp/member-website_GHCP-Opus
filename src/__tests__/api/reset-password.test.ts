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

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('new_hashed_password'),
  },
}));

import { prisma } from '@/lib/prisma';
import { POST } from '@/app/api/auth/reset-password/route';

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/auth/reset-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 for missing token', async () => {
    const request = createRequest({ password: 'newpassword123' });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('should return 400 for short password', async () => {
    const request = createRequest({ token: 'valid-token', password: 'short' });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('should return 400 for invalid token', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

    const request = createRequest({
      token: 'invalid-token',
      password: 'newpassword123',
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid or expired reset token');
  });

  it('should return 400 for expired token', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test',
      passwordHash: 'old_hash',
      emailVerified: true,
      verificationToken: null,
      resetToken: 'expired-token',
      resetTokenExpiry: new Date(Date.now() - 3600000), // 1 hour ago
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = createRequest({
      token: 'expired-token',
      password: 'newpassword123',
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid or expired reset token');
  });

  it('should reset password and clear token on valid request', async () => {
    const futureDate = new Date(Date.now() + 3600000);
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test',
      passwordHash: 'old_hash',
      emailVerified: true,
      verificationToken: null,
      resetToken: 'valid-token',
      resetTokenExpiry: futureDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);
    vi.mocked(prisma.user.update).mockResolvedValueOnce({
      ...mockUser,
      passwordHash: 'new_hashed_password',
      resetToken: null,
      resetTokenExpiry: null,
    });

    const request = createRequest({
      token: 'valid-token',
      password: 'newpassword123',
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Password reset successfully');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        passwordHash: 'new_hashed_password',
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
  });
});
