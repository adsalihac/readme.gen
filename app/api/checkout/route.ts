import { Checkout } from '@polar-sh/nextjs';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentSessionUser, getPlanForUserId } from '@/lib/entitlements';
import { getAppUrl, getPolarServer, getRequiredEnv } from '@/lib/polar';

export async function GET(req: NextRequest) {
  const user = await getCurrentSessionUser();

  if (!user) {
    return NextResponse.redirect(new URL('/api/auth/signin', req.url));
  }

  const plan = await getPlanForUserId(user.id);
  const appUrl = getAppUrl();

  if (plan === 'pro') {
    return NextResponse.redirect(`${appUrl}/?pro=active`);
  }

  let productId: string;

  try {
    productId = getRequiredEnv('POLAR_PRO_PRODUCT_ID');
  } catch {
    return NextResponse.json(
      { error: 'POLAR_PRO_PRODUCT_ID is required before checkout can start.' },
      { status: 500 }
    );
  }

  const checkoutUrl = new URL(req.url);
  checkoutUrl.searchParams.set('products', productId);
  checkoutUrl.searchParams.set('customerExternalId', user.id);
  checkoutUrl.searchParams.set('metadata', JSON.stringify({ userId: user.id, plan: 'pro' }));

  if (user.email) {
    checkoutUrl.searchParams.set('customerEmail', user.email);
  }

  if (user.name) {
    checkoutUrl.searchParams.set('customerName', user.name);
  }

  const checkout = Checkout({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    successUrl:
      process.env.SUCCESS_URL ??
      process.env.POLAR_SUCCESS_URL ??
      `${appUrl}/?checkout=success&checkout_id={CHECKOUT_ID}`,
    returnUrl: appUrl,
    server: getPolarServer(),
  });

  return checkout(new NextRequest(checkoutUrl));
}

export async function POST(req: NextRequest) {
  return GET(req);
}
