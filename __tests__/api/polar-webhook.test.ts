import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  activatePolarOrder,
  syncPolarSubscription,
} from '@/app/api/polar/webhook/route';
import { prisma } from '@/lib/prisma';

vi.mock('@polar-sh/nextjs', () => ({
  Webhooks: vi.fn(() => vi.fn()),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    entitlement: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock('@/lib/polar', () => ({
  getRequiredEnv: vi.fn(() => 'prod_test'),
}));

const baseCustomer = {
  id: 'cus_123',
  externalId: 'user_123',
};

describe('Polar webhook entitlement handlers', () => {
  beforeEach(() => {
    vi.mocked(prisma.entitlement.upsert).mockReset();
  });

  it('activates Pro entitlement for paid Polar orders', async () => {
    await activatePolarOrder({
      id: 'ord_123',
      paid: true,
      productId: 'prod_test',
      checkoutId: 'chk_123',
      customerId: 'cus_123',
      customer: baseCustomer,
      metadata: {},
    } as Parameters<typeof activatePolarOrder>[0]);

    expect(prisma.entitlement.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { providerCheckoutSessionId: 'chk_123' },
        create: expect.objectContaining({
          userId: 'user_123',
          plan: 'PRO',
          status: 'ACTIVE',
          paymentProvider: 'polar',
          providerCustomerId: 'cus_123',
          providerPaymentId: 'ord_123',
        }),
      })
    );
  });

  it('revokes Pro entitlement for revoked Polar subscriptions', async () => {
    await syncPolarSubscription(
      {
        id: 'sub_123',
        productId: 'prod_test',
        checkoutId: 'chk_123',
        customerId: 'cus_123',
        customer: baseCustomer,
        metadata: {},
      } as Parameters<typeof syncPolarSubscription>[0],
      'REVOKED'
    );

    expect(prisma.entitlement.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { providerCheckoutSessionId: 'chk_123' },
        create: expect.objectContaining({
          userId: 'user_123',
          plan: 'PRO',
          status: 'REVOKED',
          paymentProvider: 'polar',
        }),
        update: expect.objectContaining({
          status: 'REVOKED',
          paymentProvider: 'polar',
        }),
      })
    );
  });
});
