// 임시 디버그용 - 배포 전 삭제
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Subscription 테이블 컬럼 목록
        const subCols = await prisma.$queryRaw<{ column_name: string }[]>`
            SELECT column_name FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'Subscription'
            ORDER BY column_name
        `;

        // SubscriptionPayment 테이블 존재 여부
        const payTable = await prisma.$queryRaw<{ exists: boolean }[]>`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables
                WHERE table_schema = 'public' AND table_name = 'SubscriptionPayment'
            ) as exists
        `;

        // SubscriptionPaymentStatus enum 존재 여부
        const enumCheck = await prisma.$queryRaw<{ exists: boolean }[]>`
            SELECT EXISTS (
                SELECT 1 FROM pg_type WHERE typname = 'SubscriptionPaymentStatus'
            ) as exists
        `;

        return NextResponse.json({
            subscriptionColumns: subCols.map(c => c.column_name),
            subscriptionPaymentTableExists: payTable[0]?.exists,
            subscriptionPaymentStatusEnumExists: enumCheck[0]?.exists,
        });
    } catch (e) {
        return NextResponse.json({ error: String(e) });
    }
}
