/// <reference types="node" />
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Cloudflare Pages applies public/_headers at the edge. A unit test cannot see
 * the edge, so this pins the file itself: the headers cannot be dropped or
 * weakened without a failing test. Behaviour under the policy is verified in a
 * browser against a preview deployment before each production release.
 */
// Tests run from the project root, so resolve the file from the working directory.
const text = readFileSync(resolve(process.cwd(), "public/_headers"), "utf8");

function header(name: string): string | undefined {
  const line = text.split("\n").find((candidate) => candidate.trimStart().startsWith(`${name}:`));
  return line?.slice(line.indexOf(":") + 1).trim();
}

describe("security headers (public/_headers)", () => {
  it("applies to every path", () => {
    expect(text).toMatch(/^\/\*\s*$/m);
  });

  it.each([
    "Content-Security-Policy",
    "X-Frame-Options",
    "X-Content-Type-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Strict-Transport-Security",
    "Cross-Origin-Opener-Policy",
  ])("sets %s", (name) => {
    expect(header(name)).toBeTruthy();
  });

  it("keeps the Content-Security-Policy strict", () => {
    const csp = header("Content-Security-Policy") ?? "";
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toContain("unsafe-inline");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toContain("http:");
  });
});
