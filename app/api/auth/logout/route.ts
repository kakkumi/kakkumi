import { NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "kakkumi_session";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const response = NextResponse.redirect(new URL("/", url.origin));

    response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    return response;
}
