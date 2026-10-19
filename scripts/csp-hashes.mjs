// Runs after `next build`: hashes the inline scripts and styles of every
// prerendered marketing page and writes .next/csp-hashes.json for proxy.ts.
// Fails the build if a static route was not prerendered, so a page that
// silently turned dynamic cannot ship with a hash-only CSP.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { MANIFEST_FILE, inlineHashes, routeHtmlPath } from "../lib/csp-hashes.ts";
import { STATIC_ROUTES } from "../lib/security-headers.ts";

const distDir = path.resolve(import.meta.dirname, "..", ".next");
const manifest = {};
for (const route of STATIC_ROUTES) {
  const file = path.join(distDir, routeHtmlPath(route));
  let html;
  try {
    html = readFileSync(file, "utf8");
  } catch {
    console.error(`csp-hashes: ${route} was not prerendered (${file} missing).`);
    process.exit(1);
  }
  manifest[route] = inlineHashes(html);
  console.log(
    `csp-hashes: ${route} ${manifest[route].scripts.length} scripts, ${manifest[route].styles.length} styles`,
  );
}
writeFileSync(path.join(distDir, MANIFEST_FILE), `${JSON.stringify(manifest, null, 2)}\n`);
