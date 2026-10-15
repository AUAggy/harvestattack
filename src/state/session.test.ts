import { beforeEach, describe, expect, it } from "vitest";
import { deriveScenario, known, unknown } from "@/domain/model";
import {
  DEFAULT_SCENARIO,
  emptyFlow,
  sessionReducer,
  type SessionState,
} from "./session";

function baseState(): SessionState {
  return {
    scenario: { ...DEFAULT_SCENARIO },
    comprehension: {},
    flows: [],
    signingAssets: [],
    pkiReviews: [],
    actions: [],
    saveOnThisDevice: false,
  };
}

describe("sessionReducer: set-scenario", () => {
  it("merges the patch and preserves untouched fields", () => {
    const next = sessionReducer(baseState(), {
      type: "set-scenario",
      scenario: { migrationDurationMonths: 0 },
    });
    expect(next.scenario.migrationDurationMonths).toBe(0);
    // Everything else comes from the previous scenario, not from defaults.
    expect(next.scenario.migrationStartMonth).toBe(DEFAULT_SCENARIO.migrationStartMonth);
    expect(next.scenario.confidentialityLifetimeMonths).toEqual(DEFAULT_SCENARIO.confidentialityLifetimeMonths);
    expect(next.scenario.attackAssumption).toEqual(DEFAULT_SCENARIO.attackAssumption);
    expect(next.scenario.horizonMonths).toBe(DEFAULT_SCENARIO.horizonMonths);
  });

  it("propagates an unknown lifetime into the derived result instead of collapsing it", () => {
    const patched = sessionReducer(baseState(), {
      type: "set-scenario",
      scenario: { confidentialityLifetimeMonths: unknown() },
    });
    expect(patched.scenario.confidentialityLifetimeMonths).toEqual({ kind: "unknown" });

    const result = deriveScenario(patched.scenario, 0);
    expect(result.planningMargin).toEqual({ kind: "unknown" });
    expect(result.overlapUnknownCount).toBeGreaterThan(0);
    expect(result.overlapCount).toBe(0);
  });

  it("keeps a known lifetime intact through a different patch", () => {
    const patched = sessionReducer(baseState(), {
      type: "set-scenario",
      scenario: { attackAssumption: { kind: "assumed", month: 36 } },
    });
    expect(patched.scenario.confidentialityLifetimeMonths).toEqual(known(120));
  });
});

describe("sessionReducer: flow records", () => {
  it("adds, updates, and removes a flow without touching other records", () => {
    let state = baseState();
    const flow = emptyFlow();
    state = sessionReducer(state, { type: "add-flow", asset: flow });
    expect(state.flows).toHaveLength(1);

    state = sessionReducer(state, {
      type: "update-flow",
      localId: flow.localId,
      patch: { label: "Partner API gateway", owner: "Platform team" },
    });
    expect(state.flows[0].label).toBe("Partner API gateway");
    expect(state.flows[0].owner).toBe("Platform team");
    // The update is a merge, not a replacement.
    expect(state.flows[0].purpose).toBe(flow.purpose);
    expect(state.flows[0].localId).toBe(flow.localId);

    state = sessionReducer(state, { type: "remove-flow", localId: flow.localId });
    expect(state.flows).toHaveLength(0);
  });

  it("ignores updates and removals for unknown local ids", () => {
    let state = baseState();
    const flow = emptyFlow();
    state = sessionReducer(state, { type: "add-flow", asset: flow });
    const untouched = sessionReducer(state, {
      type: "update-flow",
      localId: "no-such-id",
      patch: { label: "ghost" },
    });
    expect(untouched.flows[0].label).toBe("");
    const stillThere = sessionReducer(state, { type: "remove-flow", localId: "no-such-id" });
    expect(stillThere.flows).toHaveLength(1);
  });
});

describe("sessionReducer: clear-all-local-work", () => {
  it("resets every record, the scenario, comprehension answers, and the save consent", () => {
    let state = baseState();
    state = sessionReducer(state, { type: "add-flow", asset: emptyFlow() });
    state = sessionReducer(state, { type: "add-signing-asset", asset: { ...emptyFlow(), localId: "s1" } });
    state = sessionReducer(state, { type: "add-pki-review", review: { localId: "p1" } as SessionState["pkiReviews"][number] });
    state = sessionReducer(state, { type: "add-action", action: { localId: "a1", text: "Do a thing" } });
    state = sessionReducer(state, { type: "answer-check", checkId: "migration-history", answer: "keeps" });
    state = sessionReducer(state, { type: "set-scenario", scenario: { migrationDurationMonths: 0 } });
    state = sessionReducer(state, { type: "set-save-consent", enabled: true });
    expect(state.flows).toHaveLength(1);

    const cleared = sessionReducer(state, { type: "clear-all-local-work" });
    expect(cleared.flows).toEqual([]);
    expect(cleared.signingAssets).toEqual([]);
    expect(cleared.pkiReviews).toEqual([]);
    expect(cleared.actions).toEqual([]);
    expect(cleared.comprehension).toEqual({});
    expect(cleared.scenario).toEqual(DEFAULT_SCENARIO);
    expect(cleared.saveOnThisDevice).toBe(false);
  });
});

describe("sessionReducer: hydrate", () => {
  it("replaces the whole state with the hydrated snapshot", () => {
    const saved: SessionState = {
      scenario: { ...DEFAULT_SCENARIO, migrationDurationMonths: 6 },
      comprehension: { "migration-history": "keeps" },
      flows: [{ ...emptyFlow(), label: "Restored flow" }],
      signingAssets: [],
      pkiReviews: [],
      actions: [{ localId: "a1", text: "Check one hop" }],
      saveOnThisDevice: true,
    };
    let state = baseState();
    state = sessionReducer(state, { type: "add-flow", asset: emptyFlow() });

    const hydrated = sessionReducer(state, { type: "hydrate", state: saved });
    expect(hydrated).toEqual(saved);
    expect(hydrated.flows[0].label).toBe("Restored flow");
    expect(hydrated.scenario.migrationDurationMonths).toBe(6);
  });
});
