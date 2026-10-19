import { createHash } from "node:crypto";
import type { HashManifest } from "./security-headers.ts";

/** Where `scripts/csp-hashes.mjs` writes the manifest, relative to `.next`. */
export const MANIFEST_FILE = "csp-hashes.json";

/** Prerendered HTML of an app route, relative to `.next`. */
export function routeHtmlPath(route: string): string {
  return `server/app/${route === "/" ? "index" : route.slice(1)}.html`;
}

function sha256(text: string): string {
  return `'sha256-${createHash("sha256").update(text, "utf8").digest("base64")}'`;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

/**
 * CSP hash sources for every inline <script> (no `src`) and <style> in a
 * page. Next escapes "</" inside its inline payloads, so the first closing
 * tag ends the element.
 */
export function inlineHashes(html: string): { scripts: string[]; styles: string[] } {
  const scripts: string[] = [];
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=/i.test(m[1]) || m[2] === "") continue;
    scripts.push(sha256(m[2]));
  }
  const styles: string[] = [];
  for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    if (m[1] !== "") styles.push(sha256(m[1]));
  }
  return { scripts: unique(scripts), styles: unique(styles) };
}

const HASH_SOURCE = /^'sha256-[A-Za-z0-9+/]+=*'$/;

/** Validate the manifest; anything unexpected returns null (strict fallback). */
export function parseManifest(text: string): HashManifest | null {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  for (const entry of Object.values(data)) {
    if (!entry || typeof entry !== "object") return null;
    for (const key of ["scripts", "styles"]) {
      const list = (entry as Record<string, unknown>)[key];
      if (!Array.isArray(list) || !list.every((v) => typeof v === "string" && HASH_SOURCE.test(v))) {
        return null;
      }
    }
  }
  return data as HashManifest;
}
