import { Link } from "react-router-dom";
import { getClaim, isActiveClaim, isReviewOverdue } from "@/content/claims";

const TODAY = "2026-10-15"; // Content release date; claim freshness is relative to the registry.

/**
 * Inline citation for a registered claim. Links to the claim's record on the
 * Sources page, where scope, source, and checked date are shown. Volatile
 * statements should be rendered with this so their review status is visible at
 * the point of use.
 */
export function ClaimRef({ id, label }: { id: string; label?: string }) {
  let claim;
  try {
    claim = getClaim(id);
  } catch {
    return <span className="text-destructive">[unknown claim: {id}]</span>;
  }
  if (!isActiveClaim(claim)) {
    return <span className="text-muted-foreground">[withdrawn claim: {id}]</span>;
  }
  const overdue = isReviewOverdue(claim, TODAY);
  const description = overdue
    ? `Review overdue; last checked ${claim.reviewedDate}`
    : `Source checked ${claim.reviewedDate}`;
  return (
    <Link
      to={`/sources#claim-${id}`}
      className="align-super text-xs text-link underline decoration-dotted underline-offset-2 hover:decoration-solid"
      aria-label={`${label ?? "Source"}: ${description}. Opens the sources page.`}
    >
      {label ?? "source"}
    </Link>
  );
}
