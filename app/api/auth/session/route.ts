import { NextResponse } from "next/server";
import { createHmac } from "crypto";

const SESSION_COOKIE_NAME = "kakkumi_session";

function verifySession(token: string, secret: string) {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) {
        return null;
    }

    const json = Buffer.from(payloadB64, "base64url").toString("utf8");
    const expectedSignature = createHmac("sha256", secret)
        .update(json)
        .digest("base64url");

    if (signature !== expectedSignature) {
        return null;
    }

    return JSON.parse(json) as Record<string, unknown>;
}

export async function GET(request: Request) {
    const sessionSecret = process.env.KAKAO_SESSION_SECRET;
    if (!sessionSecret) {
        return NextResponse.json({ error: "Missing KAKAO_SESSION_SECRET" }, { status: 500 });
    }

    const cookieHeader = request.headers.get("cookie") ?? "";
    const cookieMatch = cookieHeader
        .split(";")
        .map((value) => value.trim())
        .find((value) => value.startsWith(`${SESSION_COOKIE_NAME}=`));

    if (!cookieMatch) {
        return NextResponse.json({ session: null }, { status: 200 });
    }

    const token = cookieMatch.replace(`${SESSION_COOKIE_NAME}=`, "");
    const session = verifySession(token, sessionSecret);

    return NextResponse.json({ session }, { status: 200 });
}
