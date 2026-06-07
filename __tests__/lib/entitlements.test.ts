import { describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    entitlement: {
      findFirst: vi.fn(),
    },
  },
}));

import { resolvePlanForUser } from '@/lib/entitlements';

describe('resolvePlanForUser', () => {
  it('returns free when there is no signed-in user', async () => {
    const lookup = vi.fn();

    await expect(resolvePlanForUser(null, lookup)).resolves.toBe('free');
    expect(lookup).not.toHaveBeenCalled();
  });

  it('returns free when a user has no active Pro entitlement', async () => {
    await expect(resolvePlanForUser('user_123', async () => false)).resolves.toBe('free');
  });

  it('returns pro when a user has an active Pro entitlement', async () => {
    await expect(resolvePlanForUser('user_123', async () => true)).resolves.toBe('pro');
  });
});
