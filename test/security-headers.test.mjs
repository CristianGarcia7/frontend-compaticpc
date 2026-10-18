import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildContentSecurityPolicy,
  createNonce,
  securityHeaders,
} from "../lib/security-headers.ts";

/** Parse "a b c; d e" into { a: ["b", "c"], d: ["e"] }. */
function directives(csp) {
  const out = {};
  for (const part of csp.split(";")) {
    const [name, ...values] = part.trim().split(/\s+/);
    if (name) out[name] = values;
  }
  return out;
}

describe("buildContentSecurityPolicy", () => {
  const nonce = "abc123==";
  const prod = directives(buildContentSecurityPolicy({ nonce, isDev: false }));

  it("allows scripts only through the per-request nonce", () => {
    assert.deepEqual(prod["script-src"], [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
    ]);
  });

  it("never allows unsafe-inline or unsafe-eval scripts in production", () => {
    const csp = buildContentSecurityPolicy({ nonce, isDev: false });
    assert.doesNotMatch(csp, /unsafe-eval/);
    assert.ok(!prod["script-src"].includes("'unsafe-inline'"));
  });

  it("adds unsafe-eval only in development", () => {
    const dev = directives(buildContentSecurityPolicy({ nonce, isDev: true }));
    assert.ok(dev["script-src"].includes("'unsafe-eval'"));
  });

  it("locks framing, plugins, base and forms", () => {
    assert.deepEqual(prod["frame-ancestors"], ["'none'"]);
    assert.deepEqual(prod["object-src"], ["'none'"]);
    assert.deepEqual(prod["base-uri"], ["'self'"]);
    assert.deepEqual(prod["form-action"], ["'self'"]);
    assert.deepEqual(prod["default-src"], ["'self'"]);
  });

  it("keeps API calls same-origin (the /api rewrite proxies the backend)", () => {
    assert.deepEqual(prod["connect-src"], ["'self'"]);
  });

  it("allows Google Fonts stylesheets and font files", () => {
    assert.ok(prod["style-src"].includes("https://fonts.googleapis.com"));
    assert.ok(prod["style-src"].includes(`'nonce-${nonce}'`));
    assert.ok(prod["font-src"].includes("https://fonts.gstatic.com"));
  });

  it("allows inline style attributes but not inline style elements", () => {
    assert.deepEqual(prod["style-src-attr"], ["'unsafe-inline'"]);
    assert.ok(!prod["style-src"].includes("'unsafe-inline'"));
  });

  it("upgrades insecure requests only in production", () => {
    assert.ok("upgrade-insecure-requests" in prod);
    const dev = directives(buildContentSecurityPolicy({ nonce, isDev: true }));
    assert.ok(!("upgrade-insecure-requests" in dev));
  });

  it("is a single header line", () => {
    assert.doesNotMatch(buildContentSecurityPolicy({ nonce, isDev: false }), /\n/);
  });
});

describe("createNonce", () => {
  it("returns a fresh base64 value per call", () => {
    const a = createNonce();
    const b = createNonce();
    assert.notEqual(a, b);
    assert.match(a, /^[A-Za-z0-9+/]+=*$/);
    assert.ok(a.length >= 22);
  });
});

describe("securityHeaders", () => {
  const byKey = Object.fromEntries(securityHeaders.map((h) => [h.key, h.value]));

  it("sends HSTS for two years with subdomains and no preload", () => {
    assert.equal(
      byKey["Strict-Transport-Security"],
      "max-age=63072000; includeSubDomains",
    );
  });

  it("sends the anti-sniffing, referrer and framing headers", () => {
    assert.equal(byKey["X-Content-Type-Options"], "nosniff");
    assert.equal(byKey["Referrer-Policy"], "strict-origin-when-cross-origin");
    assert.equal(byKey["X-Frame-Options"], "DENY");
  });

  it("denies powerful browser features", () => {
    const policy = byKey["Permissions-Policy"];
    for (const feature of ["camera", "microphone", "geolocation", "payment", "usb"]) {
      assert.match(policy, new RegExp(`(^|, )${feature}=\\(\\)`));
    }
  });
});
