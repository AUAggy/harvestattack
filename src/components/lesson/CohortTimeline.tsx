import { formatMonth, type ScenarioInputs, type ScenarioResult, type ThreeValue } from "@/domain/model";

const COL_WIDTH = 30;
const BAR_HEIGHT = 56;
/** Clear space above the bars for the two marker labels. */
const LABEL_SPACE = 44;
/** Fixed rows under the bars: 4px gap + 6px dot, then 2px gap + 14px year line. */
const DOT_ROW = 10;
const YEAR_ROW = 16;
/** Every column is this tall, so bars and dots line up with or without a year label. */
const ROWS_HEIGHT = BAR_HEIGHT + DOT_ROW + YEAR_ROW;
const INNER_HEIGHT = LABEL_SPACE + ROWS_HEIGHT;

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
      return { className: "overlap-yes", label: "exposed under the assumed attack" };
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
 * scenario overlap, never a measured incident. Marker labels sit in clear
 * space above the bars, and every column has the same fixed rows.
 */
export function CohortTimeline({ scenario, result, viewMonth }: CohortTimelineProps) {
  const qMonth =
    scenario.attackAssumption.kind === "assumed" ? scenario.attackAssumption.month : null;
  const leftFor = (month: number) => ((month + (scenario.includeHistoricalCohorts ? 24 : 0)) / 6) * COL_WIDTH;

  return (
    <figure>
      <div className="rounded-lg border border-border bg-white p-4">
        <div aria-hidden="true" className="relative max-w-full overflow-x-auto pb-5">
          <div className="relative" style={{ width: result.cohorts.length * COL_WIDTH, height: INNER_HEIGHT }}>
            {/* Cutover marker */}
            {result.cohorts.length > 0 && (
              <div
                className="absolute top-0 z-10 border-l-2 border-dashed border-cool"
                style={{ left: leftFor(result.cutoverMonth), height: LABEL_SPACE + BAR_HEIGHT }}
              >
                <span className="absolute left-1 top-0 whitespace-nowrap font-mono text-[10px] text-cool">
                  cutover {formatMonth(result.cutoverMonth)}
                </span>
              </div>
            )}
            {/* Assumed capability marker */}
            {qMonth !== null && (
              <div
                className="absolute top-0 z-10 border-l-2 border-dotted border-caution"
                style={{ left: leftFor(qMonth), height: LABEL_SPACE + BAR_HEIGHT }}
              >
                <span className="absolute left-1 top-5 whitespace-nowrap font-mono text-[10px] text-caution">
                  assumed capability {formatMonth(qMonth)}
                </span>
              </div>
            )}
            {/* Cohort bars */}
            <div className="absolute inset-x-0 flex items-start" style={{ top: LABEL_SPACE }}>
              {result.cohorts.map(({ cohort, recorded, preArrivalOverlap }, index) => {
                const overlap = overlapClass(preArrivalOverlap);
                const transmitted = cohort.transmittedMonth <= viewMonth;
                return (
                  <div
                    key={cohort.id}
                    className="flex flex-col items-center justify-end px-[2px]"
                    style={{ width: COL_WIDTH, height: ROWS_HEIGHT }}
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
                    {/* A year label is wider than its column. Start the first one at the edge so the scroller does not clip it. */}
                    <span
                      className={`mt-0.5 h-[14px] whitespace-nowrap font-mono text-[9px] leading-[14px] text-muted-foreground ${
                        index === 0 ? "self-start" : ""
                      }`}
                    >
                      {cohort.transmittedMonth % 12 === 0 || cohort.transmittedMonth === 0
                        ? formatMonth(cohort.transmittedMonth).replace(" 20", " '")
                        : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <figcaption className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="pattern-classical inline-block h-3 w-4 rounded-sm" /> Sent with classical protection
          </span>
          <span className="flex items-center gap-1.5">
            <span className="pattern-hybrid inline-block h-3 w-4 rounded-sm" /> Sent with hybrid protection
          </span>
          <span className="flex items-center gap-1.5">
            <span className="overlap-yes inline-block h-3 w-4 rounded-sm bg-surface-2" /> Exposed at the assumed attack date
          </span>
          <span className="flex items-center gap-1.5">
            <span className="overlap-unknown inline-block h-3 w-4 rounded-sm bg-surface-2" /> Exposure unknown: an input is missing
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground" /> Recorded by the view month
          </span>
          <span>Faded bars: not sent yet at the view month.</span>
        </figcaption>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Each bar is one example item; a new bar appears every six months. This is a teaching
        diagram, not measured traffic. The lesson's item list says the same thing in words.
      </p>
    </figure>
  );
}
