import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loginWithNext, safeNext } from "../lib/safe-next.ts";

describe("safeNext rejects off-site and unsafe targets", () => {
  const unsafe = [
    // Dot segments that normalize to a protocol-relative path (F-1).
    "/..//evil.com",
    "/.//evil.com",
    "/a/..//evil.com",
    "/%2e//evil.com",
    "/%2E%2E//evil.com",
    "/../..//evil.invalid/phish",
    // Classic forms.
    "//evil.com",
    "///evil.com",
    "https://evil.com",
    "http:evil.com",
    "/\\evil.com",
    "\\\\evil.com",
    "javascript:alert(1)",
    "evil.com",
    // Control characters.
    "/\u0000//evil.com",
    "/\t/evil.com",
    "/\n/evil.com",
    "/da\rshboard",
    "/x\u007f",
    // Over-length input.
    `/${"a".repeat(600)}`,
    // Login loops and empty values.
    "/login",
    "/login?next=/dashboard",
    "",
    null,
    undefined,
  ];
  for (const value of unsafe)
    it(`rejects ${JSON.stringify(value)?.slice(0, 40)}`, () => {
      assert.equal(safeNext(value), "/dashboard");
    });

  it("uses the provided fallback", () => {
    assert.equal(safeNext("//evil.com", "/"), "/");
  });

  it("decodes the browser-confirmed payload to a rejection", () => {
    assert.equal(
      safeNext(decodeURIComponent("%2F..%2F%2Fevil.invalid%2Fphish")),
      "/dashboard",
    );
  });
});

describe("safeNext keeps valid same-origin paths", () => {
  const valid = [
    ["/equipment", "/equipment"],
    ["/analyses", "/analyses"],
    ["/analyses/123e4567?tab=pdf", "/analyses/123e4567?tab=pdf"],
    ["/analyses?search=Kingston%20RAM", "/analyses?search=Kingston%20RAM"],
    ["/ayuda#faq", "/ayuda#faq"],
    ["/a/../equipment", "/equipment"],
    ["/loginx", "/loginx"],
  ];
  for (const [input, expected] of valid)
    it(`keeps ${input}`, () => {
      assert.equal(safeNext(input), expected);
    });

  it("never returns a path that a browser would treat as another host", () => {
    for (const value of ["/..//x", "/%2e%2e//x", "/./.././/x"]) {
      const result = safeNext(value);
      assert.ok(result.startsWith("/") && !result.startsWith("//"));
    }
  });
});

describe("loginWithNext", () => {
  it("opens the sign-in tab and keeps the query string", () => {
    assert.equal(
      loginWithNext("/analyses?search=RAM"),
      "/login?mode=login&next=%2Fanalyses%3Fsearch%3DRAM",
    );
  });

  it("omits next for the root and the login page", () => {
    assert.equal(loginWithNext("/"), "/login?mode=login");
    assert.equal(loginWithNext("/login?x=1"), "/login?mode=login");
    assert.equal(loginWithNext(""), "/login?mode=login");
  });

  it("round-trips through safeNext", () => {
    const url = new URL(loginWithNext("/equipment?x=1"), "http://h");
    assert.equal(safeNext(url.searchParams.get("next")), "/equipment?x=1");
  });
});
