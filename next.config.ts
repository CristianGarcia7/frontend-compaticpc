import { existsSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";
import { securityHeaders } from "./lib/security-headers";

// In the pnpm workspace wrapper, dependencies are hoisted to ../node_modules.
// Next stops root detection at this repo's git root, so point Turbopack at the
// workspace when it exists; standalone checkouts keep the default root.
const workspaceRoot = path.resolve(__dirname, "..");
const inWorkspace = existsSync(path.join(workspaceRoot, "pnpm-workspace.yaml"));

const config: NextConfig = {
  ...(inWorkspace ? { turbopack: { root: workspaceRoot } } : {}),
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL || "http://127.0.0.1:3100"}/api/:path*`,
      },
    ];
  },
  async headers() {
    // The nonce-based Content-Security-Policy is set per request in proxy.ts.
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  poweredByHeader: false,
};
export default config;
