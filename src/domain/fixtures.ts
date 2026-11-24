/**
 * Fixed model fixtures for the domain model. Every fixture uses month
 * offsets so it stays valid regardless of calendar year. These are the
 * regression contract for the domain model.
 */
import {
  deriveScenario,
  unknown,
  known,
  type AttackAssumption,
  type Maybe,
  type ScenarioInputs,
} from "./model";

const base: ScenarioInputs = {
  migrationStartMonth: 0,
  migrationDurationMonths: 24,
  confidentialityLifetimeMonths: known(120),
  attackAssumption: { kind: "assumed", month: 60 },
  assumeCapture: true,
  includeHistoricalCohorts: false,
  horizonMonths: 240,
};

const clone = (over: Partial<ScenarioInputs>): ScenarioInputs => ({ ...base, ...over });

export interface FixtureExpectation {
  name: string;
  inputs: ScenarioInputs;
  viewMonth: number;
  /** Overlap at q for these transmitted months (cohort step is 6 months). */
  overlapAt?: Record<number, "yes" | "no" | "unknown">;
  protectionAt?: Record<number, "classical" | "hybrid">;
  planningMargin?: Maybe<number>;
  overlapCount?: number;
}

export const fixtures: FixtureExpectation[] = [
  {
    name: "Immediate start still has transition traffic",
    inputs: clone({}),
    viewMonth: 0,
    overlapAt: { 0: "yes", 12: "yes", 24: "no" },
    protectionAt: { 0: "classical", 12: "classical", 24: "hybrid" },
    planningMargin: known(-84),
    overlapCount: 4,
  },
  {
    name: "Instant cutover",
    inputs: clone({ migrationDurationMonths: 0 }),
    viewMonth: 0,
    protectionAt: { 0: "hybrid", 12: "hybrid", 24: "hybrid" },
    overlapCount: 0,
  },
  {
    name: "Lifetime boundary: end month equals q is outside the window",
    inputs: clone({ migrationDurationMonths: 24, confidentialityLifetimeMonths: known(60) }),
    viewMonth: 0,
    overlapAt: { 0: "no", 6: "yes" },
    overlapCount: 3,
  },
  {
    name: "Longer remaining lifetime overlaps at q",
    inputs: clone({ confidentialityLifetimeMonths: known(60) }),
    viewMonth: 0,
    // Cohort at 12 ends at month 72, which is after q=60: overlap.
    overlapAt: { 12: "yes" },
  },
  {
    name: "Cutover boundary: month 23 classical, month 24 hybrid",
    inputs: clone({ migrationDurationMonths: 24 }),
    viewMonth: 0,
    protectionAt: { 18: "classical", 24: "hybrid" },
  },
  {
    name: "Arrival boundary: transmission at q is not pre-arrival",
    inputs: clone({ attackAssumption: { kind: "assumed", month: 12 } }),
    viewMonth: 0,
    overlapAt: { 0: "yes", 12: "no" },
  },
  {
    name: "Unknown lifetime keeps overlap unknown",
    inputs: clone({ confidentialityLifetimeMonths: unknown() }),
    viewMonth: 0,
    overlapAt: { 0: "unknown" },
    planningMargin: unknown(),
  },
  {
    name: "No assumed attack in horizon: no overlap, no margin",
    inputs: clone({ attackAssumption: { kind: "none-within-horizon" } }),
    viewMonth: 0,
    overlapAt: { 0: "unknown" },
    planningMargin: unknown(),
  },
];

export function cohortAt(result: ReturnType<typeof deriveScenario>, month: number) {
  const found = result.cohorts.find((c) => c.cohort.transmittedMonth === month);
  if (!found) throw new Error(`No cohort marker at month ${month}`);
  return found;
}

/** Replay determinism: seek forward, backward, forward; results must match. */
export function replayIsDeterministic(inputs: ScenarioInputs, months: number[]): boolean {
  const seen = months.map((m) => JSON.stringify(deriveScenario(inputs, m)));
  const reversed = [...months].reverse().map((m) => JSON.stringify(deriveScenario(inputs, m)));
  return JSON.stringify(seen) === JSON.stringify([...reversed].reverse());
}

export type { AttackAssumption };
