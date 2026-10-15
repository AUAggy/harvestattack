import { formatMonth, type ScenarioInputs, type ScenarioResult, type ThreeValue } from "@/domain/model";

const COL_WIDTH = 30;
const BAR_HEIGHT = 56;

interface CohortTimelineProps {
  scenario: ScenarioInputs;
  result: ScenarioResult;
  viewMonth: number;
}

interface OverlapClass {
  className: string;
  label: string;
}

function overlapClass(overlap: ThreeValue): OverlapClass {
  switch (overlap) {
    case "yes":
      return { className: "overlap-yes", label: "overlap at assumed capability" };
    case "no":
      return { className: "", label: "no overlap at assumed capability" };
    default:
      return { className: "overlap-unknown", label: "overlap unknown (missing input)" };
  }
}

/**
 * The cohort timeline. Purely visual: the figure is hidden from assistive
 * technology and the cohort ledger beside it is the accessible equivalent.
 * Recorded cohorts keep their original protection pattern; amber marks the
 * scenario overlap, never a measured incident.
 */
export function CohortTimeline({ scenario, result, viewMonth }: CohortTimelineProps) {
  const qMonth =
    scenario.attackAssumption.kind === "assumed" ? scenario.attackAssumption.month : null;
  const leftFor = (month: number) => ((month + (scenario.includeHistoricalCohorts ? 24 : 0)) / 6) * COL_WIDTH;

  return (
    <figure>
      <div className="rounded-lg border border-border bg-white p-4">
        <div
          aria-hidden="true"
          className="relative max-w-full overflow-x-auto pb-2"
          style={{ minHeight: BAR_HEIGHT + 40 }}
        >
          <div className="relative" style={{ width: result.cohorts.length * COL_WIDTH, height: BAR_HEIGHT + 20 }}>
            {/* Cutover marker */}
            {result.cohorts.length > 0 && (
              <div
                className="absolute top-0 bottom-6 z-10 border-l-2 border-dashed border-cool"
                style={{ left: leftFor(result.cutoverMonth) }}
              >
                <span className="absolute -top-1 left-1 whitespace-nowrap font-mono text-[10px] text-cool">
                  cutover {formatMonth(result.cutoverMonth)}
                </span>
              </div>
            )}
            {/* Assumed capability marker */}
            {qMonth !== null && (
              <div
                className="absolute top-0 bottom-6 z-10 border-l-2 border-dotted border-caution"
                style={{ left: leftFor(qMonth) }}
              >
                <span className="absolute top-5 left-1 whitespace-nowrap font-mono text-[10px] text-caution">
                  assumed capability {formatMonth(qMonth)}
                </span>
              </div>
            )}
            {/* Cohort bars */}
            <div className="absolute inset-x-0 top-7 flex items-end" style={{ height: BAR_HEIGHT }}>
              {result.cohorts.map(({ cohort, recorded, preArrivalOverlap }) => {
                const overlap = overlapClass(preArrivalOverlap);
                const transmitted = cohort.transmittedMonth <= viewMonth;
                return (
                  <div
                    key={cohort.id}
                    className="flex flex-col items-center justify-end px-[2px]"
                    style={{ width: COL_WIDTH }}
                  >
                    <div
                      title={`${formatMonth(cohort.transmittedMonth)}: ${cohort.protection}, ${recorded ? "recorded" : "not yet transmitted"}, ${overlap.label}`}
                      className={`w-full rounded-t-sm ${cohort.protection === "classical" ? "pattern-classical" : "pattern-hybrid"} ${
                        transmitted ? "opacity-100" : "opacity-25"
                      } ${overlap.className}`}
                      style={{ height: cohort.protection === "classical" ? BAR_HEIGHT : BAR_HEIGHT * 0.55 }}
                    />
                    <span
                      className={`mt-1 h-1.5 w-1.5 rounded-full ${
                        recorded ? "bg-foreground" : "bg-transparent"
                      }`}
                    />
                    {(cohort.transmittedMonth % 12 === 0 || cohort.transmittedMonth === 0) && (
                      <span className="mt-0.5 font-mono text-[9px] text-muted-foreground">
                        {formatMonth(cohort.transmittedMonth).replace(" 20", " '")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <figcaption className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="pattern-classical inline-block h-3 w-4 rounded-sm" /> Classical protection at transmission
          </span>
          <span className="flex items-center gap-1.5">
            <span className="pattern-hybrid inline-block h-3 w-4 rounded-sm" /> Hybrid protection at transmission
          </span>
          <span className="flex items-center gap-1.5">
            <span className="overlap-yes inline-block h-3 w-4 rounded-sm bg-surface-2" /> In overlap at assumed capability
          </span>
          <span className="flex items-center gap-1.5">
            <span className="overlap-unknown inline-block h-3 w-4 rounded-sm bg-surface-2" /> Overlap unknown
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground" /> Recorded at the current view month
          </span>
          <span>Faded bars: not yet transmitted at the view month.</span>
        </figcaption>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Illustrative unit: one item per bar, one bar every six months. This is a teaching diagram,
        not measured traffic. A text version follows in the cohort ledger.
      </p>
    </figure>
  );
}
