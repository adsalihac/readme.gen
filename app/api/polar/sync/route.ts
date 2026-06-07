import { NextRequest, NextResponse } from 'next/server';

import { getCurrentSessionUser } from '@/lib/entitlements';
import { getPolarApiUrl, getRequiredEnv } from '@/lib/polar';
import { prisma } from '@/lib/prisma';

interface PolarCheckoutSession {
  id: string;
  status: string;
  metadata?: Record<string, unknown> | null;
  customer_id?: string | null;
  customerId?: string | null;
  customer?: {
    id?: string | null;
    external_id?: string | null;
    externalId?: string | null;
  } | null;
  external_customer_id?: string | null;
  externalCustomerId?: string | null;
  product_id?: string | null;
  productId?: string | null;
  product?: {
    id?: string | null;
  } | null;
  products?: Array<{
    id?: string | null;
  }> | null;
}

const paidCheckoutStatuses = new Set(['confirmed', 'succeeded']);

function getMetadataUserId(metadata: PolarCheckoutSession['metadata']) {
  const userId = metadata?.userId;
  return typeof userId === 'string' ? userId : null;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentSessionUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Sign in with GitHub before syncing checkout.' },
      { status: 401 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    checkoutId?: string;
  };
  const checkoutId = body.checkoutId?.trim();

  if (!checkoutId) {
    return NextResponse.json(
      { error: 'checkoutId is required.' },
      { status: 400 }
    );
  }

  const response = await fetch(`${getPolarApiUrl()}/v1/checkouts/${checkoutId}`, {
    headers: {
      Authorization: `Bearer ${getRequiredEnv('POLAR_ACCESS_TOKEN')}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Unable to verify Polar checkout.' },
      { status: response.status }
    );
  }

  const checkout = (await response.json()) as PolarCheckoutSession;
  const productId = getRequiredEnv('POLAR_PRO_PRODUCT_ID');
  const checkoutProductId =
    checkout.product_id ??
    checkout.productId ??
    checkout.product?.id ??
    checkout.products?.[0]?.id ??
    null;
  const checkoutExternalCustomerId =
    checkout.external_customer_id ??
    checkout.externalCustomerId ??
    checkout.customer?.external_id ??
    checkout.customer?.externalId ??
    getMetadataUserId(checkout.metadata) ??
    null;
  const checkoutCustomerId =
    checkout.customer_id ?? checkout.customerId ?? checkout.customer?.id ?? null;
  const checkoutStatus = checkout.status.toLowerCase();

  if (
    !paidCheckoutStatuses.has(checkoutStatus) ||
    checkoutProductId !== productId ||
    checkoutExternalCustomerId !== user.id
  ) {
    return NextResponse.json(
      {
        error: 'Polar checkout is not confirmed for this account.',
        details:
          process.env.NODE_ENV === 'production'
            ? undefined
            : {
                checkoutStatus,
                checkoutProductId,
                checkoutExternalCustomerId,
                expectedProductId: productId,
                expectedUserId: user.id,
              },
      },
      { status: 409 }
    );
  }

  await prisma.entitlement.upsert({
    where: {
      providerCheckoutSessionId: checkout.id,
    },
    create: {
      userId: user.id,
      plan: 'PRO',
      status: 'ACTIVE',
      paymentProvider: 'polar',
      providerCustomerId: checkoutCustomerId ?? undefined,
      providerCheckoutSessionId: checkout.id,
      providerPaymentId: checkout.id,
    },
    update: {
      status: 'ACTIVE',
      paymentProvider: 'polar',
      providerCustomerId: checkoutCustomerId ?? undefined,
      providerPaymentId: checkout.id,
    },
  });

  return NextResponse.json({ plan: 'pro' });
}
