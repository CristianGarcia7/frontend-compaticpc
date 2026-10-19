import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";
import {
  STATIC_ROUTES,
  buildStaticContentSecurityPolicy,
  cspForRequest,
  isStaticRoute,
} from "../lib/security-headers.ts";
import { inlineHashes, parseManifest, routeHtmlPath } from "../lib/csp-hashes.ts";

/** Parse "a b c; d e" into { a: ["b", "c"], d: ["e"] }. */
function directives(csp) {
  const out = {};
  for (const part of csp.split(";")) {
    const [name, ...values] = part.trim().split(/\s+/);
    if (name) out[name] = values;
  }
  return out;
}

const sha = (s) => `'sha256-${createHash("sha256").update(s, "utf8").digest("base64")}'`;

describe("isStaticRoute", () => {
  it("covers exactly the public marketing pages", () => {
    assert.deepEqual([...STATIC_ROUTES].sort(), [
      "/",
      "/ayuda",
      "/precios",
      "/privacidad",
      "/terminos",
    ]);
    for (const route of STATIC_ROUTES) assert.ok(isStaticRoute(route), route);
  });

  it("sends look-alikes, app routes and unknown paths to the nonce policy", () => {
    for (const path of [
      "/precios-x",
      "/precios/",
      "/precios/extra",
      "/ayudax",
      "//",
      "/index",
      "/login",
      "/dashboard",
      "/analyses/123",
      "/no-existe",
    ]) {
      assert.ok(!isStaticRoute(path), path);
    }
  });
});

describe("buildStaticContentSecurityPolicy", () => {
  const scripts = ["'sha256-AAA='", "'sha256-BBB='"];
  const styles = ["'sha256-CCC='"];
  const csp = buildStaticContentSecurityPolicy({ scripts, styles });
  const d = directives(csp);

  it("allows own chunks and the hashed inline scripts only", () => {
    assert.deepEqual(d["script-src"], ["'self'", ...scripts]);
  });

  it("never carries a nonce, unsafe-inline or unsafe-eval in script-src", () => {
    assert.doesNotMatch(csp, /nonce-/);
    assert.doesNotMatch(csp, /unsafe-eval/);
    assert.ok(!d["script-src"].includes("'unsafe-inline'"));
    assert.ok(!d["style-src"].includes("'unsafe-inline'"));
  });

  it("hashes inline styles and keeps Google Fonts", () => {
    assert.deepEqual(d["style-src"], ["'self'", "https://fonts.googleapis.com", ...styles]);
    assert.deepEqual(d["style-src-attr"], ["'unsafe-inline'"]);
    assert.ok(d["font-src"].includes("https://fonts.gstatic.com"));
  });

  it("keeps the same lockdown directives as the nonce policy", () => {
    assert.deepEqual(d["default-src"], ["'self'"]);
    assert.deepEqual(d["connect-src"], ["'self'"]);
    assert.deepEqual(d["object-src"], ["'none'"]);
    assert.deepEqual(d["base-uri"], ["'self'"]);
    assert.deepEqual(d["form-action"], ["'self'"]);
    assert.deepEqual(d["frame-ancestors"], ["'none'"]);
    assert.ok("upgrade-insecure-requests" in d);
  });

  it("stays strict when there are no hashes", () => {
    const empty = directives(buildStaticContentSecurityPolicy({ scripts: [], styles: [] }));
    assert.deepEqual(empty["script-src"], ["'self'"]);
    assert.deepEqual(empty["style-src"], ["'self'", "https://fonts.googleapis.com"]);
  });
});

describe("cspForRequest", () => {
  const manifest = { "/precios": { scripts: ["'sha256-P='"], styles: [] } };

  it("serves the hash policy without a nonce on a static route", () => {
    const r = cspForRequest({ pathname: "/precios", isDev: false, manifest });
    assert.equal(r.nonce, null);
    assert.deepEqual(directives(r.csp)["script-src"], ["'self'", "'sha256-P='"]);
  });

  it("serves a fresh nonce policy on app routes", () => {
    const a = cspForRequest({ pathname: "/login", isDev: false, manifest });
    const b = cspForRequest({ pathname: "/login", isDev: false, manifest });
    assert.ok(a.nonce && b.nonce);
    assert.notEqual(a.nonce, b.nonce);
    assert.ok(directives(a.csp)["script-src"].includes(`'nonce-${a.nonce}'`));
  });

  it("uses the nonce policy on look-alikes of static routes", () => {
    assert.ok(cspForRequest({ pathname: "/precios-x", isDev: false, manifest }).nonce);
  });

  it("uses the nonce policy everywhere in development (pages render per request)", () => {
    assert.ok(cspForRequest({ pathname: "/precios", isDev: true, manifest }).nonce);
  });

  it("fails safe to a strict hash-less policy when the manifest lacks the route", () => {
    for (const m of [null, {}]) {
      const r = cspForRequest({ pathname: "/precios", isDev: false, manifest: m });
      assert.equal(r.nonce, null);
      assert.deepEqual(directives(r.csp)["script-src"], ["'self'"]);
    }
  });
});

describe("inlineHashes", () => {
  const bootstrap = 'self.__next_f.push([1,"a\\u003c/b"])';
  const style = ".x{color:red}";
  const html = [
    "<!DOCTYPE html><html><head>",
    '<link rel="stylesheet" href="/_next/static/css/a.css"/>',
    '<script src="/_next/static/chunks/main.js" async=""></script>',
    `<style data-x="1">${style}</style>`,
    "</head><body>",
    `<script>${bootstrap}</script>`,
    "<script>(self.__next_f=self.__next_f||[]).push([0])</script>",
    `<script>${bootstrap}</script>`,
    "<script type=\"application/ld+json\"></script>",
    "</body></html>",
  ].join("");

  it("hashes every inline script body once and skips external scripts", () => {
    const { scripts } = inlineHashes(html);
    assert.deepEqual(scripts, [
      sha(bootstrap),
      sha("(self.__next_f=self.__next_f||[]).push([0])"),
    ]);
  });

  it("hashes inline style elements", () => {
    assert.deepEqual(inlineHashes(html).styles, [sha(style)]);
  });

  it("hashes multi-byte text as UTF-8", () => {
    const body = 'self.__next_f.push([1,"Página"])';
    assert.deepEqual(inlineHashes(`<script>${body}</script>`).scripts, [sha(body)]);
  });
});

describe("routeHtmlPath", () => {
  it("maps routes to Next's prerendered files", () => {
    assert.equal(routeHtmlPath("/"), "server/app/index.html");
    assert.equal(routeHtmlPath("/precios"), "server/app/precios.html");
  });
});

describe("parseManifest", () => {
  it("accepts a well-formed manifest", () => {
    const m = { "/": { scripts: ["'sha256-A='"], styles: [] } };
    assert.deepEqual(parseManifest(JSON.stringify(m)), m);
  });

  it("rejects malformed input instead of trusting it", () => {
    for (const bad of [
      "not json",
      "[]",
      '{"/": {"scripts": "x", "styles": []}}',
      `{"/": {"scripts": ["'unsafe-inline'"], "styles": []}}`,
      `{"/": {"scripts": [], "styles": ["https://evil.example"]}}`,
    ]) {
      assert.equal(parseManifest(bad), null, bad);
    }
  });
});
