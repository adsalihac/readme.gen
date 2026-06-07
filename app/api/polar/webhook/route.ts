import { Webhooks } from '@polar-sh/nextjs';

import { prisma } from '@/lib/prisma';
import { getRequiredEnv } from '@/lib/polar';

interface PolarCustomerRef {
  externalId?: string | null;
}

interface PolarOrder {
  id: string;
  paid: boolean;
  productId: string | null;
  checkoutId: string | null;
  customerId: string;
  customer: PolarCustomerRef;
  metadata: Record<string, string | number | boolean>;
}

interface PolarSubscription {
  id: string;
  productId: string;
  checkoutId: string | null;
  customerId: string;
  customer: PolarCustomerRef;
  metadata: Record<string, string | number | boolean>;
  status?: string;
}

function getUserIdFromOrder(order: PolarOrder): string | null {
  return (order.customer.externalId ?? String(order.metadata.userId ?? '')) || null;
}

function getUserIdFromSubscription(subscription: PolarSubscription): string | null {
  return (
    (subscription.customer.externalId ??
      String(subscription.metadata.userId ?? '')) || null
  );
}

export async function activatePolarOrder(order: PolarOrder) {
  if (!order.paid) return;

  const userId = getUserIdFromOrder(order);
  const checkoutId = order.checkoutId ?? order.id;

  if (!userId || order.productId !== getRequiredEnv('POLAR_PRO_PRODUCT_ID')) {
    return;
  }

  await prisma.entitlement.upsert({
    where: {
      providerCheckoutSessionId: checkoutId,
    },
    create: {
      userId,
      plan: 'PRO',
      status: 'ACTIVE',
      paymentProvider: 'polar',
      providerCustomerId: order.customerId,
      providerCheckoutSessionId: checkoutId,
      providerPaymentId: order.id,
    },
    update: {
      status: 'ACTIVE',
      paymentProvider: 'polar',
      providerCustomerId: order.customerId,
      providerPaymentId: order.id,
    },
  });
}

export async function syncPolarSubscription(
  subscription: PolarSubscription,
  status: 'ACTIVE' | 'INACTIVE' | 'REVOKED'
) {
  const userId = getUserIdFromSubscription(subscription);

  if (!userId || subscription.productId !== getRequiredEnv('POLAR_PRO_PRODUCT_ID')) {
    return;
  }

  await prisma.entitlement.upsert({
    where: {
      providerCheckoutSessionId: subscription.checkoutId ?? subscription.id,
    },
    create: {
      userId,
      plan: 'PRO',
      status,
      paymentProvider: 'polar',
      providerCustomerId: subscription.customerId,
      providerCheckoutSessionId: subscription.checkoutId ?? subscription.id,
      providerPaymentId: subscription.id,
    },
    update: {
      status,
      paymentProvider: 'polar',
      providerCustomerId: subscription.customerId,
      providerPaymentId: subscription.id,
    },
  });
}

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET ?? '',
  onOrderPaid: async ({ data }) => {
    await activatePolarOrder(data);

    await prisma.paymentEvent
      .create({
        data: {
          id: `polar:order.paid:${data.id}`,
          provider: 'polar',
          type: 'order.paid',
        },
      })
      .catch(() => undefined);
  },
  onSubscriptionActive: async ({ data }) => {
    await syncPolarSubscription(data, 'ACTIVE');
  },
  onSubscriptionUpdated: async ({ data }) => {
    await syncPolarSubscription(
      data,
      data.status === 'active' ? 'ACTIVE' : 'INACTIVE'
    );
  },
  onSubscriptionCanceled: async ({ data }) => {
    await syncPolarSubscription(data, 'INACTIVE');
  },
  onSubscriptionRevoked: async ({ data }) => {
    await syncPolarSubscription(data, 'REVOKED');
  },
});
