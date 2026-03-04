import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "rffasesvapdttcuqxeda.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
        ],
        qualities: [75, 100],
    },
};

export default nextConfig;
