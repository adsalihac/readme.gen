import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

import { POST } from '@/app/api/polar/sync/route';
import { getCurrentSessionUser } from '@/lib/entitlements';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/entitlements', () => ({
  getCurrentSessionUser: vi.fn(),
}));

vi.mock('@/lib/polar', () => ({
  getPolarApiUrl: vi.fn(() => 'https://sandbox-api.polar.sh'),
  getRequiredEnv: vi.fn((key: string) => {
    if (key === 'POLAR_ACCESS_TOKEN') return 'polar_oat_test';
    if (key === 'POLAR_PRO_PRODUCT_ID') return 'prod_test';
    return 'test';
  }),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    entitlement: {
      upsert: vi.fn(),
    },
  },
}));

function makeRequest(checkoutId = 'chk_123'): NextRequest {
  return new Request('http://localhost:3000/api/polar/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ checkoutId }),
  }) as NextRequest;
}

describe('POST /api/polar/sync', () => {
  beforeEach(() => {
    vi.mocked(getCurrentSessionUser).mockReset();
    vi.mocked(prisma.entitlement.upsert).mockReset();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({
          id: 'chk_123',
          status: 'confirmed',
          customer_id: 'cus_123',
          external_customer_id: 'user_123',
          product_id: 'prod_test',
        })
      )
    );
  });

  it('activates Pro for a confirmed checkout matching the signed-in user', async () => {
    vi.mocked(getCurrentSessionUser).mockResolvedValue({
      id: 'user_123',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
    });

    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.plan).toBe('pro');
    expect(prisma.entitlement.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { providerCheckoutSessionId: 'chk_123' },
        create: expect.objectContaining({
          userId: 'user_123',
          plan: 'PRO',
          status: 'ACTIVE',
          paymentProvider: 'polar',
        }),
      })
    );
  });

  it('activates Pro for a succeeded checkout using Polar camelCase fields', async () => {
    vi.mocked(getCurrentSessionUser).mockResolvedValue({
      id: 'user_123',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({
          id: 'chk_123',
          status: 'succeeded',
          customerId: 'cus_123',
          externalCustomerId: 'user_123',
          productId: 'prod_test',
        })
      )
    );

    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.plan).toBe('pro');
    expect(prisma.entitlement.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { providerCheckoutSessionId: 'chk_123' },
        create: expect.objectContaining({
          userId: 'user_123',
          paymentProvider: 'polar',
        }),
      })
    );
  });

  it('activates Pro using metadata user id and nested product fallback', async () => {
    vi.mocked(getCurrentSessionUser).mockResolvedValue({
      id: 'user_123',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({
          id: 'chk_123',
          status: 'succeeded',
          customer: { id: 'cus_123' },
          metadata: { userId: 'user_123' },
          product: { id: 'prod_test' },
        })
      )
    );

    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.plan).toBe('pro');
    expect(prisma.entitlement.upsert).toHaveBeenCalledOnce();
  });

  it('rejects checkouts for another user', async () => {
    vi.mocked(getCurrentSessionUser).mockResolvedValue({
      id: 'different_user',
      name: null,
      email: null,
      image: null,
    });

    const response = await POST(makeRequest());

    expect(response.status).toBe(409);
    expect(prisma.entitlement.upsert).not.toHaveBeenCalled();
  });
});
