import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export type UserPlan = 'free' | 'pro';

export interface CurrentUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export async function resolvePlanForUser(
  userId: string | null | undefined,
  hasActiveProEntitlement: (userId: string) => Promise<boolean>
): Promise<UserPlan> {
  if (!userId) return 'free';

  return (await hasActiveProEntitlement(userId)) ? 'pro' : 'free';
}

export async function getPlanForUserId(
  userId: string | null | undefined
): Promise<UserPlan> {
  try {
    return await resolvePlanForUser(userId, async (id) => {
      const entitlement = await prisma.entitlement.findFirst({
        where: {
          userId: id,
          plan: 'PRO',
          status: 'ACTIVE',
        },
        select: { id: true },
      });

      return entitlement !== null;
    });
  } catch {
    return 'free';
  }
}

export async function getCurrentSessionUser(): Promise<CurrentUser | null> {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user?.id) return null;

    return {
      id: user.id,
      name: user.name ?? null,
      email: user.email ?? null,
      image: user.image ?? null,
    };
  } catch {
    return null;
  }
}

export async function getCurrentPlan(): Promise<UserPlan> {
  const user = await getCurrentSessionUser();
  return getPlanForUserId(user?.id);
}
