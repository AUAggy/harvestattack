import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  COHORT_STEP_MONTHS,
  SCENARIO_BOUNDS,
  deriveScenario,
  formatMonth,
  known,
} from "@/domain/model";
import { AssumptionsPanel } from "@/components/lesson/AssumptionsPanel";
import { CohortTimeline } from "@/components/lesson/CohortTimeline";
import { CohortLedger } from "@/components/lesson/CohortLedger";
import { useSession, emptyFlow } from "@/state/session";
import { ClaimRef } from "@/components/ClaimRef";

const PLAY_STEP_MS = 900;

function IconButton({
  onClick,
  children,
  label,
  disabled,
}: {
  onClick: () => void;
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="rounded-md border border-border bg-white px-3 py-2 text-sm font-medium hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

/**
 * The lesson. One fixed long-lived-data example with assumed capture, a
 * classical-to-hybrid cutover, confidentiality lifetime, and an explicitly
 * hypothetical attack capability. Diagram, ledger, result sentence, and
 * briefing all derive from the same scenario result.
 */
export default function Understand() {
  const { state, dispatch } = useSession();
  const navigate = useNavigate();
  const scenario = state.scenario;

  const [viewMonth, setViewMonth] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);
  const resultRef = useRef<HTMLParagraphElement>(null);

  const result = useMemo(() => deriveScenario(scenario, viewMonth), [scenario, viewMonth]);

  // Changing any input pauses playback: an edited scenario is a new example.
  useEffect(() => {
    setPlaying(false);
  }, [scenario]);

  // Single cancellable timer. Pausing or unmounting always clears it.
  useEffect(() => {
    if (!playing) return;
    timerRef.current = window.setInterval(() => {
      setViewMonth((current) => {
        const next = current + COHORT_STEP_MONTHS;
        if (next >= scenario.horizonMonths) {
          setPlaying(false);
          return scenario.horizonMonths;
        }
        return next;
      });
    }, PLAY_STEP_MS);
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [playing, scenario.horizonMonths]);

  const restart = () => {
    setPlaying(false);
    setViewMonth(scenario.includeHistoricalCohorts ? -SCENARIO_BOUNDS.historyBackMonths : 0);
  };

  const step = (delta: number) => {
    setPlaying(false);
    setViewMonth((current) =>
      Math.max(scenario.includeHistoricalCohorts ? -SCENARIO_BOUNDS.historyBackMonths : 0, Math.min(scenario.horizonMonths, current + delta)),
    );
  };

  const copyAssumptionsToWorksheet = () => {
    const flow = emptyFlow();
    flow.label = "Lesson assumptions (illustrative example)";
    flow.lifetimeMonths =
      scenario.confidentialityLifetimeMonths.kind === "known"
        ? scenario.confidentialityLifetimeMonths.value
        : undefined;
    flow.lifetimeBasis = "Copied from the lesson example. Replace with your own evidence.";
    flow.knownAlgorithms =
      "Lesson example: classical before cutover, hybrid (e.g. X25519MLKEM768) after.";
    flow.nextAction = "Replace the illustrative assumptions with this flow's real endpoints and evidence.";
    dispatch({ type: "add-flow", asset: flow });
    navigate("/assess");
  };

  // One honest sentence per result axis.
  const resultSentence = () => {
    if (!scenario.assumeCapture) {
      return "Capture is not assumed, so the illustrated harvesting path is not being modeled. This is a scope choice, not evidence that nothing was recorded.";
    }
    if (!result.hasAssumedAttack) {
      return `At ${formatMonth(viewMonth)}, ${result.cohorts.filter((c) => c.recorded).length} illustrative cohorts are recorded. No attack is assumed within this horizon, so there is no overlap result and no planning margin. That is a bounded assumption, not evidence of safety.`;
    }
    const qLabel =
      scenario.attackAssumption.kind === "assumed" ? formatMonth(scenario.attackAssumption.month) : "";
    if (result.planningMargin.kind === "known" && result.overlapCount === 0 && result.overlapUnknownCount === 0) {
      return `At ${formatMonth(viewMonth)}, no illustrative cohort falls inside the overlap at ${qLabel} under these assumptions. This follows from the chosen inputs; it is not a general safety finding.`;
    }
    const unknownPart =
      result.overlapUnknownCount > 0
        ? ` ${result.overlapUnknownCount} cannot be counted because an input is unknown.`
        : "";
    const marginPart =
      result.planningMargin.kind === "known"
        ? ` The planning margin (Z - X - Y) is ${result.planningMargin.value} months under these assumptions; a negative number shows overlap, a positive one is not a safety finding.`
        : "";
    return `At ${formatMonth(viewMonth)}, ${result.overlapCount} illustrative cohort${result.overlapCount === 1 ? "" : "s"} transmitted before the cutover fall inside the overlap at ${qLabel}.${unknownPart}${marginPart} Migration protects later transmissions; it does not change copies already recorded.`;
  };

  const checkId = "migration-history";
  const checkAnswer = state.comprehension[checkId] ?? null;

  return (
    <div className="container px-4 py-8 sm:px-6">
      <header className="max-w-[72ch]">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Lesson</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          Recorded copies keep their original protection
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          <strong className="font-semibold text-foreground">Illustrative scenario.</strong> Capture of
          the example path is assumed, never observed. You control the assumptions; the model shows
          what would follow from them.
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <CohortTimeline scenario={scenario} result={result} viewMonth={viewMonth} />

          {/* Playback and view controls */}
          <section aria-labelledby="controls-heading" className="rounded-lg border border-border bg-white p-4">
            <h2 id="controls-heading" className="text-sm font-semibold">
              View month
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => (playing ? setPlaying(false) : setPlaying(true))}
                aria-pressed={playing}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {playing ? "Pause" : "Play"}
              </button>
              <IconButton onClick={() => step(-COHORT_STEP_MONTHS)} label="Step back six months">
                ◀ Step
              </IconButton>
              <IconButton onClick={() => step(COHORT_STEP_MONTHS)} label="Step forward six months">
                Step ▶
              </IconButton>
              <IconButton onClick={restart} label="Restart playback at the first month">
                Restart
              </IconButton>
              <div className="ml-auto flex items-center gap-2">
                <label htmlFor="view-month" className="text-sm text-muted-foreground">
                  View month
                </label>
                <input
                  id="view-month"
                  type="range"
                  min={scenario.includeHistoricalCohorts ? -SCENARIO_BOUNDS.historyBackMonths : 0}
                  max={scenario.horizonMonths}
                  step={COHORT_STEP_MONTHS}
                  value={viewMonth}
                  onChange={(event) => {
                    setPlaying(false);
                    setViewMonth(Number(event.target.value));
                  }}
                  className="h-2 w-40 cursor-pointer appearance-none rounded-full bg-surface-3 accent-primary"
                />
                <input
                  id="view-month-number"
                  type="number"
                  min={scenario.includeHistoricalCohorts ? -SCENARIO_BOUNDS.historyBackMonths : 0}
                  max={scenario.horizonMonths}
                  value={viewMonth}
                  aria-label="View month number"
                  onChange={(event) => {
                    setPlaying(false);
                    const next = Number(event.target.value);
                    if (!Number.isNaN(next)) {
                      setViewMonth(
                        Math.max(
                          scenario.includeHistoricalCohorts ? -SCENARIO_BOUNDS.historyBackMonths : 0,
                          Math.min(scenario.horizonMonths, next),
                        ),
                      );
                    }
                  }}
                  className="w-16 rounded-md border border-input bg-white px-2 py-1 text-right font-mono text-sm"
                />
                <span className="w-20 font-mono text-sm" aria-hidden="true">
                  {formatMonth(viewMonth)}
                </span>
              </div>
            </div>

            {/* The stable result, announced after each deliberate change */}
            <p
              ref={resultRef}
              aria-live="polite"
              className="mt-4 rounded-md bg-surface-2 p-3 text-sm leading-relaxed"
            >
              {resultSentence()}
            </p>
          </section>

          <CohortLedger result={result} viewMonth={viewMonth} assumeCapture={scenario.assumeCapture} />

          {/* Model limits */}
          <details className="rounded-lg border border-border bg-white p-4">
            <summary className="cursor-pointer text-sm font-semibold">
              What this model leaves out (technical note)
            </summary>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
              <p>
                The example shows one path, one transmission per bar, and one attack assumption at a
                time. It does not model mass decryption, attacker budgets or target selection,
                endpoint compromise, session resumption, or active attacks such as impersonation.
              </p>
              <p>
                "Overlap" means a recorded copy would be eligible for the assumed attack on its
                classical protection. It does not mean anyone has decrypted anything, and it does
                not describe any real system.
              </p>
              <p>
                The example hybrid is a supported construction such as TLS{" "}
                <span className="font-mono text-xs">X25519MLKEM768</span>
                <ClaimRef id="fips-203-final" label=" (ML-KEM standard)" />. The scenario assumes only
                the classical component becomes attackable; it does not promise the hybrid, or your
                connection, is secure forever.
              </p>
              <p>
                Forward secrecy does not fix this: a recorded ephemeral public key can be attacked
                later just like a static one, which is exactly why the recorded copy matters.
              </p>
            </div>
          </details>

          {/* Optional comprehension check */}
          <section aria-labelledby="check-heading" className="rounded-lg border border-border bg-white p-4">
            <h2 id="check-heading" className="text-sm font-semibold">
              Optional check: migration and history
            </h2>
            <fieldset className="mt-3">
              <legend className="text-sm">
                After the cutover, what happens to the attacker's copy of traffic that was recorded
                before it?
              </legend>
              <div className="mt-2 space-y-2 text-sm">
                {[
                  {
                    id: "upgraded",
                    text: "It is upgraded to the new protection when the migration completes.",
                  },
                  {
                    id: "keeps",
                    text: "It keeps the protection it had when it was recorded.",
                  },
                  {
                    id: "disappears",
                    text: "It stops mattering once the migration finishes.",
                  },
                ].map((option) => (
                  <label key={option.id} className="flex items-start gap-2">
                    <input
                      type="radio"
                      name={checkId}
                      checked={checkAnswer === option.id}
                      onChange={() =>
                        dispatch({ type: "answer-check", checkId, answer: option.id })
                      }
                      className="mt-1"
                    />
                    <span>{option.text}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {checkAnswer && (
              <p aria-live="polite" className="mt-3 rounded-md bg-surface-2 p-3 text-sm leading-relaxed">
                {checkAnswer === "keeps"
                  ? "Right. Migration changes the protection of later transmissions. A recorded copy keeps the protection it had, which is why the timeline above never repaints old bars."
                  : "Not quite. Migration changes protection for later transmissions only. The recorded copy keeps the protection it had at transmission, and that is why it can remain the concern."}
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Optional and local. Your answer is not scored, stored anywhere by the site, or used to
              classify you.
            </p>
          </section>

          {/* Exits */}
          <section aria-labelledby="next-heading" className="rounded-lg border border-border bg-white p-4">
            <h2 id="next-heading" className="text-sm font-semibold">
              Take this further
            </h2>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={copyAssumptionsToWorksheet}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Use these assumptions in the worksheet
              </button>
              <Link
                to="/share"
                className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                Save these assumptions to a briefing
              </Link>
              <Link
                to="/learn"
                className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                Read the concepts behind this
              </Link>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              The worksheet copy is labelled as an illustrative example so it is never mistaken for
              your organization's facts.
            </p>
          </section>
        </div>

        {/* Assumptions rail */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-lg border border-border bg-white p-4">
            <AssumptionsPanel scenario={scenario} dispatch={dispatch} />
          </div>
        </aside>
      </div>
    </div>
  );
}
