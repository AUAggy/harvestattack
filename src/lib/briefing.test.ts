import { describe, expect, it } from "vitest";
import { buildSnapshot, formatBriefingJson, formatBriefingMarkdown, formatBriefingText, type ExportSelection } from "./briefing";
import type { SessionState } from "@/state/session";
import { emptyPkiReview, emptyFlow, emptySigningAsset } from "@/state/session";
import { known } from "@/domain/model";

const FROZEN_TIME = "2026-10-15T12:00:00.000Z";

const stateWithContent = (): SessionState => {
  const flow = { ...emptyFlow(), label: "Partner API", owner: "Platform team", purpose: "key-establishment" as const };
  const sign = { ...emptySigningAsset(), label: "Firmware signing", owner: "Device team", purpose: "signature" as const };
  const pki = { ...emptyPkiReview(), label: "Internal service certificates", trustContext: "private" as const };
  return {
    scenario: {
      migrationStartMonth: 0,
      migrationDurationMonths: 24,
      confidentialityLifetimeMonths: known(120),
      attackAssumption: { kind: "assumed", month: 60 },
      assumeCapture: true,
      includeHistoricalCohorts: false,
      horizonMonths: 240,
    },
    comprehension: {},
    flows: [flow],
    signingAssets: [sign],
    pkiReviews: [pki],
    actions: [],
    saveOnThisDevice: false,
  };
};

const fullSelection = (state: SessionState): ExportSelection => ({
  includeScenario: true,
  flowIds: state.flows.map((f) => f.localId),
  signingAssetIds: state.signingAssets.map((a) => a.localId),
  pkiReviewIds: state.pkiReviews.map((r) => r.localId),
  actionIds: state.actions.map((a) => a.localId),
  redactOwners: false,
  redactEvidenceNotes: false,
});

describe("briefing snapshot", () => {
  it("is deterministic for the same state, selection, and time", () => {
    const a = buildSnapshot(stateWithContent(), fullSelection(stateWithContent()), FROZEN_TIME);
    const b = buildSnapshot(stateWithContent(), fullSelection(stateWithContent()), FROZEN_TIME);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("produces identical facts across all formats", () => {
    const state = stateWithContent();
    const snapshot = buildSnapshot(state, fullSelection(state), FROZEN_TIME);
    for (const text of [formatBriefingText(snapshot), formatBriefingMarkdown(snapshot), formatBriefingJson(snapshot)]) {
      expect(text).toContain("Partner API");
      expect(text).toContain("Firmware signing");
      expect(text).toContain("Internal service certificates");
      expect(text).toContain("not observe");
    }
  });

  it("includes the no-inspection scope statement", () => {
    const state = stateWithContent();
    const snapshot = buildSnapshot(state, fullSelection(state), FROZEN_TIME);
    expect(snapshot.scopeStatement).toContain("did not observe");
  });

  it("reports a negative planning margin as a number and unknown as unknown", () => {
    const state = stateWithContent();
    const snapshot = buildSnapshot(state, fullSelection(state), FROZEN_TIME);
    expect(snapshot.scenario?.planningMargin).toBe(-84);
    const noAssumption = stateWithContent();
    noAssumption.scenario = { ...noAssumption.scenario, attackAssumption: { kind: "none-within-horizon" } };
    const s2 = buildSnapshot(noAssumption, fullSelection(noAssumption), FROZEN_TIME);
    expect(s2.scenario?.planningMargin).toBe("unknown");
    expect(s2.scenario?.attackAssumption).toContain("not evidence of safety");
  });

  it("omits the scenario entirely from a PKI-only briefing", () => {
    const state = stateWithContent();
    const selection: ExportSelection = { ...fullSelection(state), includeScenario: false };
    const snapshot = buildSnapshot(state, selection, FROZEN_TIME);
    expect(snapshot.scenario).toBeUndefined();
    expect(formatBriefingText(snapshot)).not.toContain("LESSON SCENARIO");
  });

  it("redacts owners and evidence notes on request", () => {
    const state = stateWithContent();
    const flow = state.flows[0];
    const selection: ExportSelection = {
      ...fullSelection(state),
      flowIds: [flow.localId],
      redactOwners: true,
      redactEvidenceNotes: true,
    };
    const snapshot = buildSnapshot(state, selection, FROZEN_TIME);
    const text = formatBriefingText(snapshot);
    expect(text).toContain("[redacted]");
    expect(text).not.toContain("Platform team");
  });

  it("lists unknowns when evidence is missing", () => {
    const state = stateWithContent();
    const snapshot = buildSnapshot(state, fullSelection(state), FROZEN_TIME);
    expect(snapshot.unknowns.length).toBeGreaterThan(0);
    expect(formatBriefingText(snapshot)).toContain("UNKNOWN AND MISSING EVIDENCE");
  });
});
