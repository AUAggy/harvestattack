/**
 * Pure cohort model for the HarvestAttack lesson.
 *
 * This module is deterministic and framework-independent. It contains no
 * browser APIs, no timers, no random data, and no UI. Everything here derives
 * from explicit month offsets relative to a fixed reference month.
 *
 * Teaching boundary:
 * - A cohort is one illustrative item transmitted in a given month, not a
 *   measured packet rate or an organization-wide volume.
 * - Protection is fixed at transmission: classical before cutover, hybrid at
 *   or after cutover. Migration never changes an already-recorded copy.
 * - The hypothetical attack capability month (q) is an assumption, never a
 *   forecast. "No assumed attack within this horizon" is a bounded case.
 */

/** Fixed reference month for all scenarios. Month offset 0 means this month. */
export const REFERENCE_MONTH = { year: 2026, month: 1 } as const;

/** Cohort markers are generated at this step, in months. */
export const COHORT_STEP_MONTHS = 6;

/** Scenario input bounds. Values outside the bounds are clamped by validate. */
export const SCENARIO_BOUNDS = {
  migrationStartMonth: { min: 0, max: 120 },
  migrationDurationMonths: { min: 0, max: 120 },
  horizonMonths: { min: 24, max: 480 },
  /** Historical cohorts reach back this far when explicitly included. */
  historyBackMonths: 24,
  defaultHorizonMonths: 240,
} as const;

/** Three-valued result: the model never collapses "unknown" into "no". */
export type ThreeValue = "yes" | "no" | "unknown";

/** A value the visitor may not know. Unknown stays unknown through every derivation. */
export type Maybe<T> =
  | { kind: "known"; value: T }
  | { kind: "unknown" };

export const known = <T,>(value: T): Maybe<T> => ({ kind: "known", value });
export const unknown = <T,>(): Maybe<T> => ({ kind: "unknown" });

/**
 * The hypothetical attacker capability assumption for the relevant classical
 * public-key operation.
 * - assumed: the visitor supposes an attack becomes possible in month q.
 * - none-within-horizon: the visitor assumes no such attack inside the model
 *   horizon. This is a bounded educational case, not a safety claim.
 * - unknown: the visitor has not chosen an assumption.
 */
export type AttackAssumption =
  | { kind: "assumed"; month: number }
  | { kind: "none-within-horizon" }
  | { kind: "unknown" };

export interface ScenarioInputs {
  /** Month the migration starts, offset from the reference month. */
  migrationStartMonth: number;
  /** Months from migration start until cutover for the illustrated path. */
  migrationDurationMonths: number;
  /** Confidentiality lifetime L, from transmission until an exclusive end month. */
  confidentialityLifetimeMonths: Maybe<number>;
  /** Hypothetical capability assumption q. */
  attackAssumption: AttackAssumption;
  /** Assume the illustrated path was recorded by an attacker with access. */
  assumeCapture: boolean;
  /** Include illustrative cohorts transmitted before the reference month. */
  includeHistoricalCohorts: boolean;
  /** View horizon in months. Outside this is outside the model, never "safe". */
  horizonMonths: number;
}

export type Protection = "classical" | "hybrid";

export interface Cohort {
  /** Stable id derived from the transmission month, e.g. "cohort-m012". */
  id: string;
  /** Transmission month offset (may be negative for included history). */
  transmittedMonth: number;
  /** Illustrative data category. The legend must state the illustrative unit. */
  category: string;
  /** Protection assigned at transmission. Never changes afterwards. */
  protection: Protection;
  /** Cryptographic purpose illustrated by the lesson model. */
  purpose: "key-establishment";
  /** Exclusive end of the chosen confidentiality window, if known. */
  lifetimeEnd: Maybe<number>;
}

export interface CohortStatus {
  cohort: Cohort;
  /** Appears as transmitted and recorded at the current view month. */
  recorded: boolean;
  /** The recorded copy uses a protection the assumed attack can break. */
  attackableUnderAssumption: ThreeValue;
  /**
   * Pre-arrival HNDL overlap at q: captured, transmitted before q, attackable
   * protection, and still inside the chosen confidentiality window at q.
   * Once yes, seeking the view month never erases it.
   */
  preArrivalOverlap: ThreeValue;
  /** Still inside the chosen confidentiality window at the view month v. */
  inWindowAtView: ThreeValue;
}

export interface ScenarioResult {
  /** Month the illustrated path switches to hybrid protection. */
  cutoverMonth: number;
  cohorts: CohortStatus[];
  /** Cohorts with overlap "yes". */
  overlapCount: number;
  /** Cohorts whose overlap is unknown because an input is unknown. */
  overlapUnknownCount: number;
  /**
   * Planning margin Z - X - Y. Only produced when lifetime and capability
   * are both known assumptions. Never a probability or a safety finding.
   */
  planningMargin: Maybe<number>;
  hasAssumedAttack: boolean;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

/** Validate and normalize scenario inputs. Returns a safe copy with clamps applied. */
export function validateScenario(inputs: ScenarioInputs): {
  ok: boolean;
  issues: string[];
  value: ScenarioInputs;
} {
  const issues: string[] = [];
  const b = SCENARIO_BOUNDS;
  const start = clamp(inputs.migrationStartMonth, b.migrationStartMonth.min, b.migrationStartMonth.max);
  const duration = clamp(inputs.migrationDurationMonths, b.migrationDurationMonths.min, b.migrationDurationMonths.max);
  const horizon = clamp(inputs.horizonMonths, b.horizonMonths.min, b.horizonMonths.max);
  if (start !== inputs.migrationStartMonth) issues.push("Migration start was adjusted to the model bounds.");
  if (duration !== inputs.migrationDurationMonths) issues.push("Migration duration was adjusted to the model bounds.");
  if (horizon !== inputs.horizonMonths) issues.push("Horizon was adjusted to the model bounds.");
  if (inputs.attackAssumption.kind === "assumed") {
    const q = clamp(inputs.attackAssumption.month, b.historyBackMonths, horizon);
    if (q !== inputs.attackAssumption.month) {
      issues.push("The assumed capability month was adjusted to the model horizon.");
    }
    return {
      ok: issues.length === 0,
      issues,
      value: {
        ...inputs,
        migrationStartMonth: start,
        migrationDurationMonths: duration,
        horizonMonths: horizon,
        attackAssumption: { kind: "assumed", month: q },
      },
    };
  }
  return {
    ok: issues.length === 0,
    issues,
    value: { ...inputs, migrationStartMonth: start, migrationDurationMonths: duration, horizonMonths: horizon },
  };
}

/** Cutover month c = migration start + duration. */
export function cutoverMonth(inputs: ScenarioInputs): number {
  return inputs.migrationStartMonth + inputs.migrationDurationMonths;
}

/** Protection of a transmission is fixed by its month relative to cutover. */
export function protectionAt(transmittedMonth: number, cutover: number): Protection {
  return transmittedMonth < cutover ? "classical" : "hybrid";
}

/** Deterministic cohort markers for a scenario. Never derived from elapsed time. */
export function buildCohorts(inputs: ScenarioInputs): Cohort[] {
  const cutover = cutoverMonth(inputs);
  const start = inputs.includeHistoricalCohorts ? -SCENARIO_BOUNDS.historyBackMonths : 0;
  const cohorts: Cohort[] = [];
  for (let t = start; t <= inputs.horizonMonths; t += COHORT_STEP_MONTHS) {
    cohorts.push({
      id: `cohort-m${String(t).padStart(4, "0")}`,
      transmittedMonth: t,
      category: "Illustrative transmitted item",
      protection: protectionAt(t, cutover),
      purpose: "key-establishment",
      lifetimeEnd:
        inputs.confidentialityLifetimeMonths.kind === "known"
          ? known(t + inputs.confidentialityLifetimeMonths.value)
          : unknown(),
    });
  }
  return cohorts;
}

const assumedMonth = (a: AttackAssumption): Maybe<number> =>
  a.kind === "assumed" ? known(a.month) : unknown();

/**
 * Derive the full scenario result. Pure: the same inputs and view month always
 * produce the same output, so seeking backward and forward replays exactly.
 */
export function deriveScenario(inputs: ScenarioInputs, viewMonth: number): ScenarioResult {
  const cutover = cutoverMonth(inputs);
  const q = assumedMonth(inputs.attackAssumption);
  const cohorts = buildCohorts(inputs).map((cohort) => {
    // Recorded only under the displayed capture assumption and once transmitted.
    const recorded = inputs.assumeCapture && cohort.transmittedMonth <= viewMonth;

    let attackableUnderAssumption: ThreeValue = "unknown";
    let preArrivalOverlap: ThreeValue = "unknown";

    if (cohort.protection === "hybrid") {
      // No attack on the PQ component is modeled in this scenario.
      attackableUnderAssumption = "no";
      preArrivalOverlap = "no";
    } else if (q.kind === "known") {
      attackableUnderAssumption = "yes";
      // Overlap at q requires transmission strictly before q.
      const beforeQ = cohort.transmittedMonth < q.value;
      let inWindowAtQ: ThreeValue;
      if (cohort.lifetimeEnd.kind === "known") {
        inWindowAtQ = cohort.lifetimeEnd.value > q.value ? "yes" : "no";
      } else {
        inWindowAtQ = "unknown";
      }
      preArrivalOverlap =
        beforeQ && inWindowAtQ === "yes" ? "yes" : beforeQ && inWindowAtQ === "unknown" ? "unknown" : "no";
    } else {
      attackableUnderAssumption = "no";
      preArrivalOverlap = "unknown";
    }

    let inWindowAtView: ThreeValue;
    if (cohort.lifetimeEnd.kind === "known") {
      inWindowAtView = cohort.lifetimeEnd.value > viewMonth ? "yes" : "no";
    } else {
      inWindowAtView = "unknown";
    }

    return { cohort, recorded, attackableUnderAssumption, preArrivalOverlap, inWindowAtView };
  });

  const overlapCount = cohorts.filter((c) => c.preArrivalOverlap === "yes").length;
  const overlapUnknownCount = cohorts.filter((c) => c.preArrivalOverlap === "unknown").length;

  let planningMargin: Maybe<number> = unknown();
  if (inputs.confidentialityLifetimeMonths.kind === "known" && q.kind === "known") {
    // X = required confidentiality, Y = lead time to completed migration, Z = q.
    const x = inputs.confidentialityLifetimeMonths.value;
    const y = cutover;
    const z = q.value;
    planningMargin = known(z - x - y);
  }

  return {
    cutoverMonth: cutover,
    cohorts,
    overlapCount,
    overlapUnknownCount,
    planningMargin,
    hasAssumedAttack: inputs.attackAssumption.kind === "assumed",
  };
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/** Format a month offset for display, e.g. "Jan 2026". Pure and timezone-free. */
export function formatMonth(offset: number): string {
  const totalMonths = REFERENCE_MONTH.year * 12 + (REFERENCE_MONTH.month - 1) + Math.round(offset);
  const year = Math.floor(totalMonths / 12);
  const month = totalMonths % 12;
  return `${MONTH_NAMES[month]} ${year}`;
}
