import { prisma } from "@/lib/prisma";

export type SubscriptionPlan = "FREE" | "PRO" | "CREATOR" | "ADMIN";

export async function getUserPlan(userId: string, role: string): Promise<SubscriptionPlan> {
    if (role === "ADMIN") return "ADMIN";
    if (role === "CREATOR") return "CREATOR";

    const sub = await prisma.subscription.findUnique({ where: { userId } });
    if (sub?.status === "ACTIVE") return "PRO";
    return "FREE";
}

export function canSaveMoreThemes(currentCount: number, plan: SubscriptionPlan): boolean {
    if (plan === "PRO" || plan === "CREATOR" || plan === "ADMIN") return true;
    return currentCount < 5;
}

export const FREE_THEME_SLOT_LIMIT = 5;

/**
 * 구독 해지/만료 시 유저 아바타 초기화
 * CREATOR → creator.png, 그 외 → null
 */
export async function resetUserAvatar(userId: string, role: string): Promise<void> {
    const resetAvatarUrl = role === "CREATOR" ? "/creator.png" : null;
    await prisma.$executeRaw`
        UPDATE "User" SET "avatarUrl" = ${resetAvatarUrl}, "updatedAt" = NOW()
        WHERE id = ${userId}
    `;
}
