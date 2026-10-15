import { formatMonth, type ScenarioResult, type ThreeValue } from "@/domain/model";

const OVERLAP_LABELS: Record<ThreeValue, string> = {
  yes: "Yes: sent before the assumed attack and still required to stay secret at that date",
  no: "No under these assumptions",
  unknown: "Unknown: an input is missing",
};

const WINDOW_LABELS: Record<ThreeValue, string> = {
  yes: "Yes",
  no: "No",
  unknown: "Unknown: no lifetime set",
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
        Item by item
      </h2>
      <p className="mt-1 max-w-[72ch] text-sm leading-relaxed text-muted-foreground">
        Each bar in the diagram is one item, and this table says the same thing in words: when each
        item was sent, what protected it at that moment, and what your assumptions say happens to
        it. An item keeps the protection it was sent with. Nothing upgrades it later.
      </p>
      <div className="mt-3 max-w-full overflow-x-auto rounded-lg border border-border" role="region" aria-label="Item-by-item table" tabIndex={0}>
        <table className="w-full min-w-[720px] border-collapse bg-white text-sm">
          <caption className="sr-only">
            One row per example item: month sent, protection when sent, whether it is shown as
            recorded at the view month, whether the assumed attack arrives while it must still stay
            secret, and whether it must stay secret at the view month.
          </caption>
          <thead>
            <tr className="border-b border-border bg-surface-1 text-left">
              <th scope="col" className="px-3 py-2 font-medium">Sent</th>
              <th scope="col" className="px-3 py-2 font-medium">Protection when sent</th>
              <th scope="col" className="px-3 py-2 font-medium">Recorded at {formatMonth(viewMonth)}?</th>
              <th scope="col" className="px-3 py-2 font-medium">Exposed under your assumptions?</th>
              <th scope="col" className="px-3 py-2 font-medium">Must stay secret at {formatMonth(viewMonth)}?</th>
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
