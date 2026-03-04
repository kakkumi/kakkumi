import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_ID = "00000000-0000-0000-0000-000000000001";

// 목업 데이터와 1:1 매핑되는 고정 UUID (seed 전용)
const SEED_THEMES = [
    { id: "00000001-0000-0000-0000-000000000001", title: "봄 벚꽃",      price: 1200, description: "따스한 봄날의 벚꽃을 담은 테마입니다. 핑크빛 감성으로 당신의 카톡을 꾸며보세요." },
    { id: "00000001-0000-0000-0000-000000000002", title: "다크 미니멀",  price: 1500, description: "눈이 편안한 다크 모드 테마입니다. 심플하고 세련된 디자인을 선호하는 분들께 추천합니다." },
    { id: "00000001-0000-0000-0000-000000000003", title: "오션 블루",    price: 1000, description: "시원한 바다를 연상시키는 블루 테마입니다. 청량감 넘치는 화면을 만나보세요." },
    { id: "00000001-0000-0000-0000-000000000004", title: "선셋 오렌지",  price: 1200, description: "노을지는 저녁 하늘의 오렌지 빛깔을 담았습니다. 따뜻한 감성을 느껴보세요." },
    { id: "00000001-0000-0000-0000-000000000005", title: "민트 그린",    price: 0,    description: "상쾌한 민트향이 날 것 같은 그린 테마입니다. 기분 전환이 필요할 때 딱이에요." },
    { id: "00000001-0000-0000-0000-000000000006", title: "라벤더 드림",  price: 1000, description: "몽환적인 보랏빛 라벤더 테마입니다. 우아하고 신비로운 분위기를 연출합니다." },
    { id: "00000001-0000-0000-0000-000000000007", title: "로즈 골드",    price: 1500, description: "고급스러운 로즈 골드 컬러의 테마입니다. 당신의 품격을 높여줄 거예요." },
    { id: "00000001-0000-0000-0000-000000000008", title: "네온 퍼플",    price: 1200, description: "힙한 감성의 네온 퍼플 테마입니다. 남들과 다른 개성을 표현하고 싶다면 선택하세요." },
    { id: "00000001-0000-0000-0000-000000000009", title: "파스텔 옐로우", price: 0,   description: "귀여운 병아리가 생각나는 파스텔 옐로우 테마입니다. 밝고 활기찬 에너지를 전해드려요." },
];

async function main() {
    // 시드용 관리자 계정
    const admin = await prisma.user.upsert({
        where: { id: ADMIN_ID },
        update: {},
        create: {
            id: ADMIN_ID,
            kakaoId: "seed_admin_kakkumi",
            email: "admin@kakkumi.com",
            name: "카꾸미",
            role: "ADMIN",
        } as Parameters<typeof prisma.user.create>[0]["data"],
    });
    console.log("✅ Admin user:", admin.id);

    for (const theme of SEED_THEMES) {
        const created = await prisma.theme.upsert({
            where: { id: theme.id },
            update: { title: theme.title, price: theme.price, description: theme.description, status: "PUBLISHED" },
            create: {
                id: theme.id,
                title: theme.title,
                price: theme.price,
                description: theme.description,
                thumbnailUrl: "/back.jpg",
                status: "PUBLISHED",
                creatorId: admin.id,
            },
        });
        console.log(`✅ ${created.title} (${created.price === 0 ? "무료" : created.price + "원"})`);
    }

    console.log("\n🎉 Seed 완료! 총", SEED_THEMES.length, "개 테마 등록됨");
}

main()
    .catch((e) => { console.error("❌ Seed 오류:", e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
