import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateNickname } from "@/lib/nickname";

export async function GET(req: NextRequest) {
    const nickname = req.nextUrl.searchParams.get("nickname") ?? "";
    const currentUserId = req.nextUrl.searchParams.get("userId");

    const validationError = validateNickname(nickname);
    if (validationError) {
        return NextResponse.json({ available: false, error: validationError });
    }

    const trimmed = nickname.trim();

    const rows = currentUserId
        ? await prisma.$queryRaw<{ id: string }[]>`
            SELECT id FROM "User" WHERE nickname = ${trimmed} AND id != ${currentUserId} LIMIT 1
          `
        : await prisma.$queryRaw<{ id: string }[]>`
            SELECT id FROM "User" WHERE nickname = ${trimmed} LIMIT 1
          `;

    return NextResponse.json({ available: rows.length === 0 });
}
