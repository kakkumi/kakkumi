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
