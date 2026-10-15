import { formatMonth, type ScenarioResult, type ThreeValue } from "@/domain/model";

const OVERLAP_LABELS: Record<ThreeValue, string> = {
  yes: "Yes, in overlap at the assumed capability month",
  no: "No overlap under these assumptions",
  unknown: "Unknown: an input is missing",
};

const WINDOW_LABELS: Record<ThreeValue, string> = {
  yes: "Inside the chosen window",
  no: "Outside the chosen window",
  unknown: "Unknown lifetime",
};

/**
 * The cohort ledger: the accessible text equivalent of the timeline and the
 * durable record of what the model derived. The two views always derive from
 * the same result object.
 */
export function CohortLedger({
  result,
  viewMonth,
  assumeCapture,
}: {
  result: ScenarioResult;
  viewMonth: number;
  assumeCapture: boolean;
}) {
  return (
    <section aria-labelledby="ledger-heading" className="mt-8">
      <h2 id="ledger-heading" className="text-lg font-semibold">
        Cohort ledger
      </h2>
      <p className="mt-1 max-w-[72ch] text-sm leading-relaxed text-muted-foreground">
        Every bar in the diagram is one illustrative item, listed here with its fixed transmission
        protection and its status under your current assumptions. Protection never changes after
        transmission.
      </p>
      <div className="mt-3 max-w-full overflow-x-auto rounded-lg border border-border" role="region" aria-label="Cohort ledger table" tabIndex={0}>
        <table className="w-full min-w-[720px] border-collapse bg-white text-sm">
          <caption className="sr-only">
            Illustrative cohorts with transmission month, protection, recording status at the view
            month, overlap at the assumed capability month, and chosen-window status.
          </caption>
          <thead>
            <tr className="border-b border-border bg-surface-1 text-left">
              <th scope="col" className="px-3 py-2 font-medium">Transmitted</th>
              <th scope="col" className="px-3 py-2 font-medium">Protection at transmission</th>
              <th scope="col" className="px-3 py-2 font-medium">Recorded at {formatMonth(viewMonth)}?</th>
              <th scope="col" className="px-3 py-2 font-medium">Overlap at assumed capability</th>
              <th scope="col" className="px-3 py-2 font-medium">Chosen window at view month</th>
            </tr>
          </thead>
          <tbody>
            {result.cohorts.map(({ cohort, recorded, preArrivalOverlap, inWindowAtView }) => (
              <tr key={cohort.id} className="border-b border-border/60">
                <td className="px-3 py-2 font-mono text-xs">{formatMonth(cohort.transmittedMonth)}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`inline-block h-3 w-4 rounded-sm ${cohort.protection === "classical" ? "pattern-classical" : "pattern-hybrid"}`}
                    />
                    {cohort.protection === "classical" ? "Classical" : "Hybrid"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {!assumeCapture ? (
                    <span className="text-muted-foreground">Capture not assumed</span>
                  ) : recorded ? (
                    "Yes"
                  ) : (
                    <span className="text-muted-foreground">Not yet transmitted</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span className={preArrivalOverlap === "yes" ? "font-medium text-caution" : ""}>
                    {OVERLAP_LABELS[preArrivalOverlap]}
                  </span>
                </td>
                <td className="px-3 py-2">{WINDOW_LABELS[inWindowAtView]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
