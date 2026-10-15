import { known, unknown, SCENARIO_BOUNDS, type ScenarioInputs } from "@/domain/model";
import type { SessionAction } from "@/state/session";
import { formatMonth } from "@/domain/model";

interface AssumptionsPanelProps {
  scenario: ScenarioInputs;
  dispatch: (action: SessionAction) => void;
}

function NumberField({
  id,
  label,
  help,
  value,
  min,
  max,
  onChange,
  suffix,
}: {
  id: string;
  label: string;
  help?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {help && (
        <p id={`${id}-help`} className="mt-0.5 text-xs text-muted-foreground">
          {help}
        </p>
      )}
      <div className="mt-1.5 flex items-center gap-3">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          aria-describedby={help ? `${id}-help` : undefined}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-3 accent-primary"
        />
        <span className="flex items-center gap-1">
          <input
            id={`${id}-number`}
            type="number"
            min={min}
            max={max}
            value={value}
            aria-label={`${label} (months)`}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (!Number.isNaN(next)) onChange(next);
            }}
            className="w-16 rounded-md border border-input bg-white px-2 py-1 text-right font-mono text-sm"
          />
          <span className="text-xs text-muted-foreground">{suffix ?? "mo"}</span>
        </span>
      </div>
    </div>
  );
}

/**
 * The assumptions rail. Every control shows units and bounds and has a numeric
 * alternative to the slider. Changing any input pauses playback and re-derives
 * the scenario; the previous view is a changed educational scenario, not a
 * rewritten history.
 */
export function AssumptionsPanel({ scenario, dispatch }: AssumptionsPanelProps) {
  const b = SCENARIO_BOUNDS;
  const set = (patch: Partial<ScenarioInputs>) => dispatch({ type: "set-scenario", scenario: patch });

  const lifetimeKnown = scenario.confidentialityLifetimeMonths.kind === "known";
  const lifetimeValue =
    scenario.confidentialityLifetimeMonths.kind === "known"
      ? scenario.confidentialityLifetimeMonths.value
      : 120;
  const assumption = scenario.attackAssumption;

  return (
    <section aria-labelledby="assumptions-heading" className="space-y-5">
      <h2 id="assumptions-heading" className="text-lg font-semibold">
        Assumptions
      </h2>
      <p className="text-xs leading-relaxed text-muted-foreground">
        These are your teaching assumptions. Changing them edits the example; it never changes what
        an attacker already holds.
      </p>

      <NumberField
        id="migration-start"
        label="Migration starts"
        help="Months from the reference month (Jan 2026) until the migration begins."
        value={scenario.migrationStartMonth}
        min={b.migrationStartMonth.min}
        max={b.migrationStartMonth.max}
        onChange={(migrationStartMonth) => set({ migrationStartMonth })}
      />

      <NumberField
        id="migration-duration"
        label="Migration duration"
        help="Months from start until this path sends everything with hybrid protection."
        value={scenario.migrationDurationMonths}
        min={b.migrationDurationMonths.min}
        max={b.migrationDurationMonths.max}
        onChange={(migrationDurationMonths) => set({ migrationDurationMonths })}
      />

      <fieldset>
        <legend className="text-sm font-medium">Confidentiality lifetime</legend>
        <p className="mt-0.5 text-xs text-muted-foreground">
          How long a transmitted item must stay secret. "Unknown" is a normal answer.
        </p>
        <div className="mt-2 flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="lifetime-kind"
              checked={lifetimeKnown}
              onChange={() => set({ confidentialityLifetimeMonths: known(lifetimeValue) })}
            />
            Known
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="lifetime-kind"
              checked={!lifetimeKnown}
              onChange={() => set({ confidentialityLifetimeMonths: unknown() })}
            />
            Unknown
          </label>
        </div>
        {lifetimeKnown && (
          <div className="mt-2">
            <NumberField
              id="lifetime-months"
              label="Lifetime length"
              value={lifetimeValue}
              min={1}
              max={480}
              onChange={(value) => set({ confidentialityLifetimeMonths: known(value) })}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              An item sent now stays in the chosen window until {formatMonth(lifetimeValue)}.
            </p>
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">Hypothetical attacker capability</legend>
        <p className="mt-0.5 text-xs text-muted-foreground">
          A what-if month when the classical operation could be attacked. This is an assumption, not
          a forecast.
        </p>
        <div className="mt-2 space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="attack-assumption"
              checked={assumption.kind === "assumed"}
              onChange={() => set({ attackAssumption: { kind: "assumed", month: Math.min(60, scenario.horizonMonths) } })}
            />
            Assume an attack from a chosen month
          </label>
          {assumption.kind === "assumed" && (
            <div className="pl-6">
              <NumberField
                id="capability-month"
                label="Capability month"
                value={assumption.month}
                min={-b.historyBackMonths}
                max={scenario.horizonMonths}
                onChange={(month) => set({ attackAssumption: { kind: "assumed", month } })}
              />
            </div>
          )}
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="attack-assumption"
              checked={assumption.kind === "none-within-horizon"}
              onChange={() => set({ attackAssumption: { kind: "none-within-horizon" } })}
            />
            Assume no attack within the horizon
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="attack-assumption"
              checked={assumption.kind === "unknown"}
              onChange={() => set({ attackAssumption: { kind: "unknown" } })}
            />
            Leave this unknown
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">Scope</legend>
        <div className="mt-2 space-y-2 text-sm">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={scenario.assumeCapture}
              onChange={(event) => set({ assumeCapture: event.target.checked })}
              className="mt-1"
            />
            <span>
              Assume the illustrated path was recorded
              <span className="block text-xs text-muted-foreground">
                A teaching assumption. The site never observes or detects interception.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={scenario.includeHistoricalCohorts}
              onChange={(event) => set({ includeHistoricalCohorts: event.target.checked })}
              className="mt-1"
            />
            <span>
              Include earlier cohorts (back to {formatMonth(-b.historyBackMonths)})
              <span className="block text-xs text-muted-foreground">
                Adds two years of illustrative history before the reference month.
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      <NumberField
        id="horizon-months"
        label="Model horizon"
        help="How far the example reaches. Beyond it is outside the model, not safe."
        value={scenario.horizonMonths}
        min={b.horizonMonths.min}
        max={b.horizonMonths.max}
        onChange={(horizonMonths) => set({ horizonMonths })}
      />

      <button
        type="button"
        onClick={() => dispatch({ type: "reset-scenario" })}
        className="rounded-md border border-border bg-white px-3 py-2 text-sm font-medium hover:bg-secondary"
      >
        Reset example
      </button>
    </section>
  );
}

