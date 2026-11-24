import { describe, expect, it } from "vitest";
import {
  CONTENT_DATE,
  claims,
  getClaim,
  isActiveClaim,
  isReviewOverdue,
  validateClaims,
} from "./claims";
import { getSource, sources } from "./sources";

describe("claim registry", () => {
  it("passes structural validation", () => {
    expect(validateClaims()).toEqual([]);
  });

  it("release gate: no active claim is overdue as of the content date", () => {
    const overdue = Object.values(claims)
      .filter((claim) => isActiveClaim(claim))
      .filter((claim) => isReviewOverdue(claim, CONTENT_DATE))
      .map((claim) => `${claim.id} (review due ${claim.reviewDueDate})`);
    expect(overdue).toEqual([]);
  });

  it("release gate: nothing was checked after the content date", () => {
    const laterClaims = Object.values(claims)
      .filter((claim) => claim.reviewedDate > CONTENT_DATE)
      .map((claim) => `${claim.id} (checked ${claim.reviewedDate})`);
    const laterSources = Object.values(sources)
      .filter((source) => source.checkedDate > CONTENT_DATE)
      .map((source) => `${source.id} (checked ${source.checkedDate})`);
    expect([...laterClaims, ...laterSources]).toEqual([]);
  });

  it("resolves every source reference", () => {
    for (const claim of Object.values(claims)) {
      for (const sourceId of claim.sourceIds) {
        expect(() => getSource(sourceId)).not.toThrow();
      }
    }
  });

  it("throws on unknown claim or source ids", () => {
    expect(() => getClaim("nope")).toThrow();
    expect(() => getSource("nope")).toThrow();
  });

  it("flags overdue reviews without deleting the claim", () => {
    const claim = getClaim("fips-203-final");
    expect(isReviewOverdue(claim, "2027-02-01")).toBe(true);
    expect(isReviewOverdue(claim, "2026-11-01")).toBe(false);
    expect(isActiveClaim(claim)).toBe(true);
  });

  it("keeps draft policy claims marked as drafts", () => {
    const draft = getClaim("ir8547-draft-transition");
    expect(draft.sourceType).toBe("policy");
    expect(draft.statement.toLowerCase()).toContain("draft");
  });

  it("scopes NSM-10 to National Security Systems", () => {
    const claim = getClaim("nsm10-federal-scope");
    expect(claim.statement).toContain("National Security Systems");
    expect(claim.applicability).toContain("not set a deadline for the private sector");
  });

  it("records missing KMS telemetry as unknown rather than classical", () => {
    const claim = getClaim("aws-kms-pq-tls-telemetry");
    expect(claim.statement).toContain("unknown");
  });

  it("separates signing capability from transport key establishment", () => {
    const signing = getClaim("aws-kms-mldsa-signing");
    expect(signing.purpose).toBe("signature");
    expect(signing.statement).toContain("not transport key establishment");
  });
});
