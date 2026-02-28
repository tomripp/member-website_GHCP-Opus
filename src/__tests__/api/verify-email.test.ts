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

import { prisma } from '@/lib/prisma';
import { GET } from '@/app/api/auth/verify-email/route';

function createRequest(token?: string): NextRequest {
  const url = token
    ? `http://localhost:3000/api/auth/verify-email?token=${token}`
    : 'http://localhost:3000/api/auth/verify-email';
  return new NextRequest(url, { method: 'GET' });
}

describe('GET /api/auth/verify-email', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 when no token is provided', async () => {
    const request = createRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Token is required');
  });

  it('should return 400 for invalid token', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

    const request = createRequest('invalid-token');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid or expired token');
  });

  it('should verify email and return 200 on valid token', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test',
      passwordHash: 'hash',
      emailVerified: false,
      verificationToken: 'valid-token',
      resetToken: null,
      resetTokenExpiry: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);
    vi.mocked(prisma.user.update).mockResolvedValueOnce({
      ...mockUser,
      emailVerified: true,
      verificationToken: null,
    });

    const request = createRequest('valid-token');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Email verified successfully');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        emailVerified: true,
        verificationToken: null,
      },
    });
  });
});
