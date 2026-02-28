import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock email
vi.mock('@/lib/email', () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
}));

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn(),
  },
}));

import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';

// Import the route handler
import { POST } from '@/app/api/auth/register/route';

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 for invalid input (missing name)', async () => {
    const request = createRequest({
      email: 'test@example.com',
      password: 'password123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid input');
  });

  it('should return 400 for invalid email', async () => {
    const request = createRequest({
      name: 'Test User',
      email: 'not-an-email',
      password: 'password123',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 400 for short password', async () => {
    const request = createRequest({
      name: 'Test User',
      email: 'test@example.com',
      password: 'short',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 409 if email already exists', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: '1',
      email: 'test@example.com',
      name: 'Existing',
      passwordHash: 'hash',
      emailVerified: true,
      verificationToken: null,
      resetToken: null,
      resetTokenExpiry: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = createRequest({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe('email_exists');
  });

  it('should return 201 and send verification email on success', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.user.create).mockResolvedValueOnce({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hashed_password',
      emailVerified: false,
      verificationToken: 'some-token',
      resetToken: null,
      resetTokenExpiry: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = createRequest({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      locale: 'en',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe('User created successfully');
    expect(prisma.user.create).toHaveBeenCalledOnce();
    expect(sendVerificationEmail).toHaveBeenCalledWith(
      'test@example.com',
      expect.any(String),
      'en'
    );
  });

  it('should use default locale "en" when locale is not provided', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.user.create).mockResolvedValueOnce({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hashed_password',
      emailVerified: false,
      verificationToken: 'some-token',
      resetToken: null,
      resetTokenExpiry: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = createRequest({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    expect(sendVerificationEmail).toHaveBeenCalledWith(
      'test@example.com',
      expect.any(String),
      'en'
    );
  });
});
