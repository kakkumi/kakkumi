import { NextResponse } from "next/server";

const APK_BUILDER_URL = process.env.APK_BUILDER_URL ?? "http://localhost:8080";

export interface ApkBuildRequest {
  themeName: string;
  packageId: string;
  colors: Record<string, string>;
  images?: Record<string, string>;
  versionName?: string;
  versionCode?: number;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ApkBuildRequest;

    // 필수 필드 검증
    if (!body.themeName || typeof body.themeName !== "string") {
      return NextResponse.json({ error: "themeName이 필요합니다." }, { status: 400 });
    }
    if (!body.packageId || typeof body.packageId !== "string") {
      return NextResponse.json({ error: "packageId가 필요합니다." }, { status: 400 });
    }
    if (!body.colors || typeof body.colors !== "object") {
      return NextResponse.json({ error: "colors 객체가 필요합니다." }, { status: 400 });
    }

    // APK 빌더 서비스 호출 (서버 사이드 — URL이 클라이언트에 노출되지 않음)
    const builderRes = await fetch(`${APK_BUILDER_URL}/build`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // 빌드 최대 3분 대기
      signal: AbortSignal.timeout(180_000),
    });

    if (!builderRes.ok) {
      const errText = await builderRes.text();
      console.error("[APK] 빌더 오류:", errText);
      return NextResponse.json(
        { error: "APK 빌드에 실패했습니다.", detail: errText },
        { status: 500 }
      );
    }

    const apkBuffer = await builderRes.arrayBuffer();
    const safeName = body.themeName.replace(/[^\w가-힣\-]/g, "_");

    return new NextResponse(apkBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.android.package-archive",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(safeName)}.apk"`,
        "Content-Length": apkBuffer.byteLength.toString(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[APK] 오류:", message);
    return NextResponse.json({ error: "APK 다운로드 실패", detail: message }, { status: 500 });
  }
}

