import { Link } from "react-router-dom";
import {
  claims,
  isActiveClaim,
  isReviewOverdue,
  type Claim,
} from "@/content/claims";
import { getSource, type Source, type SourceType } from "@/content/sources";

const TODAY = "2026-10-15"; // Content release date; claim freshness is relative to the registry.

const PURPOSE_ORDER: Claim["purpose"][] = [
  "general",
  "key-establishment",
  "signature",
  "symmetric-encryption",
  "key-custody",
];

const PURPOSE_LABELS: Record<Claim["purpose"], string> = {
  general: "General",
  "key-establishment": "Key establishment",
  signature: "Signature",
  "symmetric-encryption": "Symmetric encryption",
  "key-custody": "Key custody",
};

const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  standard: "Standard",
  "vendor-capability": "Vendor capability",
  announcement: "Announcement",
  policy: "Policy",
  specification: "Specification",
};

const groups = PURPOSE_ORDER.map((purpose) => ({
  purpose,
  label: PURPOSE_LABELS[purpose],
  items: Object.values(claims)
    .filter((claim) => claim.purpose === purpose)
    .sort(
      (a, b) =>
        a.reviewDueDate.localeCompare(b.reviewDueDate) || a.id.localeCompare(b.id)
    ),
})).filter((group) => group.items.length > 0);

function ReviewBadge({ claim }: { claim: Claim }) {
  if (isReviewOverdue(claim, TODAY)) {
    return (
      <span className="inline-block rounded border border-caution/50 bg-caution/10 px-2 py-0.5 text-xs font-medium text-caution">
        Review overdue; last checked {claim.reviewedDate}
      </span>
    );
  }
  return (
    <span className="inline-block rounded border border-border bg-surface-1 px-2 py-0.5 text-xs text-muted-foreground">
      Checked {claim.reviewedDate}
    </span>
  );
}

function ClaimState({ claim }: { claim: Claim }) {
  if (isActiveClaim(claim)) return null;
  return (
    <p className="mt-3 rounded border border-border bg-surface-1 px-3 py-2 text-sm text-muted-foreground">
      {claim.withdrawn
        ? "Withdrawn. This statement is known wrong or no longer supported; it is kept here for history only."
        : `Superseded by ${claim.supersededBy}. See that claim's record for the current statement.`}
    </p>
  );
}

function SourceRow({ source }: { source: Source }) {
  return (
    <li className="border-t border-border pt-3 first:border-t-0 first:pt-0">
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-link underline underline-offset-2"
      >
        {source.title}
      </a>
      <span className="text-muted-foreground"> ({source.publisher})</span>
      <ul className="mt-1 space-y-0.5 text-sm text-muted-foreground">
        <li>Reference: {source.reference}</li>
        {source.versionDate && <li>Version date: {source.versionDate}</li>}
        <li>Checked by a maintainer on {source.checkedDate}</li>
        {source.accessLimitation && <li>Access note: {source.accessLimitation}</li>}
      </ul>
    </li>
  );
}

function ClaimCard({ claim }: { claim: Claim }) {
  return (
    <article
      id={`claim-${claim.id}`}
      className="scroll-mt-20 rounded-lg border border-border bg-card p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-mono text-sm font-semibold">claim-{claim.id}</h3>
        <p className="text-xs text-muted-foreground">Revision {claim.revision}</p>
      </div>

      <p className="mt-3 text-base">{claim.statement}</p>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded border border-border bg-surface-1 px-2 py-0.5">
          Purpose: {PURPOSE_LABELS[claim.purpose]}
        </span>
        <span className="rounded border border-border bg-surface-1 px-2 py-0.5">
          Source type: {SOURCE_TYPE_LABELS[claim.sourceType]}
        </span>
      </div>

      <div className="mt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Sources
        </h4>
        <ul className="mt-2 space-y-3 text-sm">
          {claim.sourceIds.map((sourceId) => (
            <SourceRow key={sourceId} source={getSource(sourceId)} />
          ))}
        </ul>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Applicability: {claim.applicability}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <ReviewBadge claim={claim} />
        <span className="text-sm text-muted-foreground">
          Review due {claim.reviewDueDate}
        </span>
      </div>

      <ClaimState claim={claim} />
    </article>
  );
}

export default function Sources() {
  return (
    <div className="container max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold">Sources and claim status</h1>

      <p className="mt-4 text-muted-foreground">
        Every claim on this site is one narrow statement, never bigger than its
        source supports. Each claim carries its own record: the sources it rests
        on, when a maintainer last re-read those sources, and when the next
        review is due. Freshness is per-claim on purpose. A single
        site-wide "fact-checked" badge would hide the difference between a final
        standard and a vendor page that can change without notice. To report an
        error, include the claim id (for example, claim-fips-203-final) so the
        correction can be traced to its record. Please do not send private system
        details; this site does not inspect your systems and cannot protect
        material you send.
      </p>

      {groups.map((group) => (
        <section key={group.purpose} className="mt-12">
          <h2 className="text-xl font-semibold">{group.label}</h2>
          <div className="mt-4 space-y-6">
            {group.items.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
        </section>
      ))}

      <p className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
        Vendor and policy claims are re-reviewed quarterly. Corrections and
        release notes are recorded on the{" "}
        <Link to="/updates" className="text-link underline underline-offset-2">
          updates page
        </Link>
        .
      </p>
    </div>
  );
}
