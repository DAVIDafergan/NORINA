import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    // picsum.photos is only used for local/dev seed data (see prisma/seed.ts) -
    // swap for the real image storage domain (Supabase/S3/R2) once chosen.
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
};

export default withNextIntl(nextConfig);
