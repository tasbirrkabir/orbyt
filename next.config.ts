import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /**
   * Serve /foo/ with the same content as /foo instead of redirecting.
   * The preview gateway normalizes some paths to a trailing slash; without
   * this, Next's own normalization 308s back and the two loop forever
   * (ERR_TOO_MANY_REDIRECTS in the browser).
   */
  skipTrailingSlashRedirect: true,
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
