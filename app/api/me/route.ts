import { NextResponse } from 'next/server';

import {
  getCurrentSessionUser,
  getPlanForUserId,
} from '@/lib/entitlements';

export async function GET() {
  const user = await getCurrentSessionUser();
  const plan = await getPlanForUserId(user?.id);

  return NextResponse.json({ user, plan });
}
