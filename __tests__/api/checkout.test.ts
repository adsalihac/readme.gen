import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

import { GET, POST } from '@/app/api/checkout/route';
import {
  getCurrentSessionUser,
  getPlanForUserId,
} from '@/lib/entitlements';
import { Checkout } from '@polar-sh/nextjs';

vi.mock('@/lib/entitlements', () => ({
  getCurrentSessionUser: vi.fn(),
  getPlanForUserId: vi.fn(),
}));

vi.mock('@/lib/polar', () => ({
  getAppUrl: vi.fn(() => 'http://localhost:3000'),
  getRequiredEnv: vi.fn(() => 'prod_test'),
  getPolarServer: vi.fn(() => 'sandbox'),
}));

vi.mock('@polar-sh/nextjs', () => ({
  Checkout: vi.fn(),
}));

const checkoutHandler = vi.fn();

function makeRequest(): NextRequest {
  return new Request('http://localhost:3000/api/checkout') as NextRequest;
}

describe('GET /api/checkout', () => {
  beforeEach(() => {
    vi.mocked(getCurrentSessionUser).mockReset();
    vi.mocked(getPlanForUserId).mockReset();
    checkoutHandler.mockReset();
    checkoutHandler.mockResolvedValue(
      Response.redirect('https://checkout.polar.sh/session')
    );
    vi.mocked(Checkout).mockReset();
    vi.mocked(Checkout).mockReturnValue(checkoutHandler);
  });

  it('redirects unauthenticated users to sign in', async () => {
    vi.mocked(getCurrentSessionUser).mockResolvedValue(null);

    const response = await GET(makeRequest());

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/api/auth/signin'
    );
    expect(checkoutHandler).not.toHaveBeenCalled();
  });

  it('delegates signed-in free users to Polar Checkout', async () => {
    vi.mocked(getCurrentSessionUser).mockResolvedValue({
      id: 'user_123',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
    });
    vi.mocked(getPlanForUserId).mockResolvedValue('free');

    const response = await GET(makeRequest());

    expect(response.status).toBe(302);
    expect(Checkout).toHaveBeenCalledWith({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      successUrl:
        process.env.SUCCESS_URL ??
        process.env.POLAR_SUCCESS_URL ??
        'http://localhost:3000/?checkout=success&checkout_id={CHECKOUT_ID}',
      returnUrl: 'http://localhost:3000',
      server: 'sandbox',
    });

    const polarRequest = checkoutHandler.mock.calls[0]?.[0] as Request;
    const polarUrl = new URL(polarRequest.url);

    expect(polarUrl.searchParams.get('products')).toBe('prod_test');
    expect(polarUrl.searchParams.get('customerExternalId')).toBe('user_123');
    expect(polarUrl.searchParams.get('customerEmail')).toBe('test@example.com');
    expect(polarUrl.searchParams.get('customerName')).toBe('Test User');
    expect(JSON.parse(polarUrl.searchParams.get('metadata') ?? '{}')).toEqual({
      userId: 'user_123',
      plan: 'pro',
    });
  });

  it('keeps old POST callers compatible with Polar Checkout', async () => {
    vi.mocked(getCurrentSessionUser).mockResolvedValue({
      id: 'user_123',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
    });
    vi.mocked(getPlanForUserId).mockResolvedValue('free');

    const response = await POST(makeRequest());

    expect(response.status).toBe(302);
    expect(checkoutHandler).toHaveBeenCalledOnce();
  });
});
