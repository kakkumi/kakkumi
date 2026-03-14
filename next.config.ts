import type { NextConfig } from "next";

const securityHeaders = [
    { key: "X-Content-Type-Options",    value: "nosniff" },
    { key: "X-Frame-Options",           value: "DENY" },
    { key: "X-XSS-Protection",          value: "1; mode=block" },
    { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
    {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
    },
];

const nextConfig: NextConfig = {
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: securityHeaders,
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "rffasesvapdttcuqxeda.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
            {
                protocol: "https",
                hostname: "k.kakaocdn.net",
            },
        ],
        qualities: [75, 100],
    },
};

export default nextConfig;
