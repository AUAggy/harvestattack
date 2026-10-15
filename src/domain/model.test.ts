import { describe, expect, it } from "vitest";
import {
  buildCohorts,
  cutoverMonth,
  deriveScenario,
  formatMonth,
  known,
  protectionAt,
  unknown,
  validateScenario,
  type ScenarioInputs,
} from "./model";
import { cohortAt, fixtures, replayIsDeterministic } from "./fixtures";

const base: ScenarioInputs = {
  migrationStartMonth: 0,
  migrationDurationMonths: 24,
  confidentialityLifetimeMonths: known(120),
  attackAssumption: { kind: "assumed", month: 60 },
  assumeCapture: true,
  includeHistoricalCohorts: false,
  horizonMonths: 240,
};

describe("month arithmetic", () => {
  it("computes cutover as start plus duration", () => {
    expect(cutoverMonth({ ...base, migrationStartMonth: 6, migrationDurationMonths: 18 })).toBe(24);
  });

  it("treats 18 months as months, not a year and a half rounded", () => {
    expect(cutoverMonth({ ...base, migrationStartMonth: 0, migrationDurationMonths: 18 })).toBe(18);
  });

  it("formats month offsets without timezone drift", () => {
    expect(formatMonth(0)).toBe("Jan 2026");
    expect(formatMonth(1)).toBe("Feb 2026");
    expect(formatMonth(12)).toBe("Jan 2027");
    expect(formatMonth(-1)).toBe("Dec 2025");
  });
});

describe("protection assignment", () => {
  it("assigns classical strictly before cutover and hybrid at or after", () => {
    expect(protectionAt(23, 24)).toBe("classical");
    expect(protectionAt(24, 24)).toBe("hybrid");
    expect(protectionAt(-5, 24)).toBe("classical");
  });
});

describe("boundary fixtures", () => {
  for (const fixture of fixtures) {
    it(fixture.name, () => {
      const result = deriveScenario(fixture.inputs, fixture.viewMonth);
      if (fixture.overlapAt) {
        for (const [month, expected] of Object.entries(fixture.overlapAt)) {
          expect(cohortAt(result, Number(month)).preArrivalOverlap).toBe(expected);
        }
      }
      if (fixture.protectionAt) {
        for (const [month, expected] of Object.entries(fixture.protectionAt)) {
          expect(cohortAt(result, Number(month)).cohort.protection).toBe(expected);
        }
      }
      if (fixture.planningMargin !== undefined) {
        expect(result.planningMargin).toEqual(fixture.planningMargin);
      }
      if (fixture.overlapCount !== undefined) {
        expect(result.overlapCount).toBe(fixture.overlapCount);
      }
    });
  }
});

describe("capture and recording semantics", () => {
  it("does not mark cohorts recorded when capture is not assumed", () => {
    const result = deriveScenario({ ...base, assumeCapture: false }, 60);
    for (const c of result.cohorts) expect(c.recorded).toBe(false);
  });

  it("records cohorts only once the view month reaches them", () => {
    const result = deriveScenario(base, 12);
    expect(cohortAt(result, 12).recorded).toBe(true);
    expect(cohortAt(result, 18).recorded).toBe(false);
  });

  it("keeps historical protection unchanged as the view advances", () => {
    const early = deriveScenario(base, 12);
    const late = deriveScenario(base, 200);
    expect(cohortAt(early, 0).cohort.protection).toBe("classical");
    expect(cohortAt(late, 0).cohort.protection).toBe("classical");
  });

  it("never erases historical overlap when seeking past a lifetime end", () => {
    const atQ = deriveScenario(base, 60);
    const beyond = deriveScenario(base, 200);
    expect(cohortAt(atQ, 0).preArrivalOverlap).toBe("yes");
    expect(cohortAt(beyond, 0).preArrivalOverlap).toBe("yes");
    expect(cohortAt(beyond, 0).inWindowAtView).toBe("no");
  });
});

describe("unknown propagation", () => {
  it("keeps overlap unknown with unknown lifetime", () => {
    const result = deriveScenario({ ...base, confidentialityLifetimeMonths: unknown() }, 0);
    expect(cohortAt(result, 0).preArrivalOverlap).toBe("unknown");
    expect(result.planningMargin).toEqual({ kind: "unknown" });
  });

  it("keeps overlap unknown with no assumed attack in horizon", () => {
    const result = deriveScenario({ ...base, attackAssumption: { kind: "none-within-horizon" } }, 0);
    expect(result.hasAssumedAttack).toBe(false);
    expect(cohortAt(result, 0).preArrivalOverlap).toBe("unknown");
    expect(result.planningMargin).toEqual({ kind: "unknown" });
  });

  it("keeps overlap unknown without an assumption", () => {
    const result = deriveScenario({ ...base, attackAssumption: { kind: "unknown" } }, 0);
    expect(cohortAt(result, 0).preArrivalOverlap).toBe("unknown");
  });

  it("treats hybrid cohorts as not attackable without inventing certainty", () => {
    const result = deriveScenario(base, 0);
    expect(cohortAt(result, 24).attackableUnderAssumption).toBe("no");
  });
});

describe("determinism and bounds", () => {
  it("replays identically across forward and backward seeking", () => {
    expect(replayIsDeterministic(base, [0, 48, 96, 144, 96, 48, 0])).toBe(true);
  });

  it("clamps out-of-bounds inputs and reports the adjustment", () => {
    const checked = validateScenario({
      ...base,
      migrationStartMonth: 999,
      migrationDurationMonths: -5,
      horizonMonths: 100000,
      attackAssumption: { kind: "assumed", month: 99999 },
    });
    expect(checked.ok).toBe(false);
    expect(checked.issues.length).toBeGreaterThanOrEqual(3);
    expect(checked.value.migrationStartMonth).toBe(120);
    expect(checked.value.migrationDurationMonths).toBe(0);
    expect(checked.value.attackAssumption.kind === "assumed" && checked.value.attackAssumption.month).toBe(
      checked.value.horizonMonths,
    );
  });

  it("derives a thousand cohorts well under the responsiveness budget", () => {
    const wide: ScenarioInputs = { ...base, horizonMonths: 480 };
    const cohorts = buildCohorts(wide);
    expect(cohorts.length).toBeGreaterThan(0);
    const startedAt = performance.now();
    for (let i = 0; i < 100; i += 1) deriveScenario(wide, i);
    expect(performance.now() - startedAt).toBeLessThan(200);
  });
});
