/**
 * Worksheet, evidence, and private-PKI review contracts. These types are
 * shared by the worksheet, actions, briefing, and export code. Unknown is
 * explicit everywhere; there is no aggregate
 * score, no risk rating, and no compliance verdict in this file or any
 * consumer of it.
 */

/** Cryptographic purpose. A capability for one purpose never satisfies another. */
export type CryptoPurpose =
  | "key-establishment"
  | "symmetric-encryption"
  | "signature"
  | "key-custody";

export const CRYPTO_PURPOSE_LABELS: Record<CryptoPurpose, string> = {
  "key-establishment": "Key establishment",
  "symmetric-encryption": "Symmetric encryption",
  signature: "Signatures / authentication",
  "key-custody": "Private key custody",
};

/** Signature-only evidence cannot satisfy a key-establishment requirement. */
export function purposesCompatible(required: CryptoPurpose, offered: CryptoPurpose): boolean {
  return required === offered;
}

/** Evidence level for an observed or recorded fact about a real system. */
export type EvidenceLevel =
  | "documented" // vendor documentation says the capability exists
  | "configured" // local configuration shows it is set up
  | "observed" // observation shows it actually negotiated or verified
  | "unknown"; // no evidence collected yet

export const EVIDENCE_LEVEL_LABELS: Record<EvidenceLevel, string> = {
  documented: "Documented support",
  configured: "Configured locally",
  observed: "Observed in use",
  unknown: "Unknown; needs evidence",
};

export interface EvidenceRecord {
  localId: string;
  /** Which hop, asset, or component this evidence is about. */
  subject: string;
  purpose: CryptoPurpose;
  level: EvidenceLevel;
  /** Sanitized note. No credentials, private keys, hostnames of sensitive systems, or uploads. */
  note: string;
  /** When the observation was made, visitor-entered. */
  observedAt?: string;
  /** What to check next, if the level is unknown or partial. */
  nextCheck?: string;
}

export interface WorksheetAction {
  localId: string;
  /** Plain-language next test or decision. */
  text: string;
  linkedAssetId?: string;
  linkedPkiReviewId?: string;
  owner?: string;
  targetDate?: string;
  done?: boolean;
}

// ---------------------------------------------------------------------------
// Worksheet assets
// ---------------------------------------------------------------------------

export type AssetKind = "confidentiality-flow" | "signing-asset";

export interface WorksheetAsset {
  localId: string;
  kind: AssetKind;
  /** Safe label. Organization and asset names are optional. */
  label: string;
  owner: string;
  purpose: CryptoPurpose;
  /** Endpoints and hops, or verifier population. */
  scope: string;
  /** Required confidentiality lifetime in months, where relevant. */
  lifetimeMonths?: number;
  lifetimeBasis: string;
  /** Known algorithms in use, as far as the visitor knows. */
  knownAlgorithms: string;
  /** Third parties or dependencies that affect this asset. */
  dependencies: string;
  evidence: EvidenceRecord[];
  nextAction: string;
  nextActionTargetDate?: string;
}

// ---------------------------------------------------------------------------
// Private-PKI review
// ---------------------------------------------------------------------------

export type TrustContext = "private" | "public" | "mixed" | "unknown";

export type PkiComponentRole =
  | "root-ca"
  | "issuing-ca"
  | "certificate-profile"
  | "enrollment"
  | "status"
  | "relying-party"
  | "trust-store";

export const PKI_ROLE_LABELS: Record<PkiComponentRole, string> = {
  "root-ca": "Root CA / trust anchor",
  "issuing-ca": "Issuing CA",
  "certificate-profile": "Certificate profile",
  enrollment: "Enrollment / renewal",
  status: "Revocation / status",
  "relying-party": "Relying party group",
  "trust-store": "Trust distribution",
};

export interface PkiComponent {
  localId: string;
  role: PkiComponentRole;
  /** Safe name, e.g. "Issuing CA (software)". Real names optional. */
  name: string;
  purpose: string;
  /** Known algorithm / format / version / mode details, or empty if unknown. */
  algorithms: string;
  evidenceLevel: EvidenceLevel;
  evidenceNote: string;
  updateOwner: string;
}

export type RequirementStatus = "final" | "draft" | "stale" | "unknown";
export type Applicability = "applies" | "does-not-apply" | "unresolved";
export type GapState = "none-identified" | "gap-identified" | "needs-evidence" | "unknown";

export interface RequirementMapping {
  localId: string;
  /** Issuing authority or internal policy name. */
  authority: string;
  versionSection: string;
  status: RequirementStatus;
  applicability: Applicability;
  /** Basis for the applicability decision; required when not unresolved. */
  applicabilityBasis: string;
  /** Which operation, component, and deployment boundary this covers. */
  boundary: string;
  evidenceNote: string;
  gap: GapState;
  /** Visitor-entered reviewer decisions are labelled as such everywhere. */
  reviewerNote: string;
  reviewerRole: string;
  reviewedOn: string;
  nextAction: string;
}

export interface PkiReview {
  localId: string;
  /** Neutral label, e.g. "Internal service certificates". */
  label: string;
  trustContext: TrustContext;
  owner: string;
  purpose: string;
  relyingPartyGroup: string;
  exclusions: string;
  components: PkiComponent[];
  requirements: RequirementMapping[];
  nextTest: string;
}

// ---------------------------------------------------------------------------
// Deterministic suggestions (no scoring, no reassurance)
// ---------------------------------------------------------------------------

export interface Suggestion {
  text: string;
}

/** Visible, deterministic rules. Unknown fields suggest evidence gathering. */
export function suggestionsForAsset(asset: WorksheetAsset): Suggestion[] {
  const out: Suggestion[] = [];
  if (asset.purpose === "key-establishment") {
    const kexEvidence = asset.evidence.filter((e) => e.purpose === "key-establishment");
    if (!kexEvidence.some((e) => e.level === "observed")) {
      out.push({
        text: `Collect negotiation evidence for ${asset.label || "this flow"}: record which key exchange the connection actually used, per hop.`,
      });
    }
    if (asset.evidence.length === 0) {
      out.push({ text: "No evidence recorded yet for this flow. Start with the hop you control least." });
    }
  }
  if (asset.purpose === "signature") {
    if (!asset.scope.trim()) {
      out.push({ text: "List who must verify these signatures and for how long. Verifier lifetime drives the replacement plan." });
    }
    if (!asset.knownAlgorithms.trim()) {
      out.push({ text: "Record which signature formats existing verifiers accept today before planning a new key." });
    }
  }
  if (!asset.owner.trim()) {
    out.push({ text: "Name an owner for this asset, even a placeholder role. Unowned findings usually stay unfixed." });
  }
  if (!asset.nextAction.trim()) {
    out.push({ text: "Write the single next test that would remove the biggest unknown." });
  }
  return out;
}

export function suggestionsForPkiReview(review: PkiReview): Suggestion[] {
  const out: Suggestion[] = [];
  if (review.trustContext === "unknown") {
    out.push({ text: "Decide the trust context: private only, public, or mixed. Public trust adds external requirements." });
  }
  if (review.components.length === 0) {
    out.push({ text: "Add the lifecycle parts you will review: hierarchy, profiles, enrollment, status, relying parties, trust distribution." });
  }
  for (const component of review.components) {
    if (component.evidenceLevel === "unknown") {
      out.push({ text: `Record evidence for "${component.name || PKI_ROLE_LABELS[component.role]}": what algorithm and version support exists today?` });
    }
  }
  for (const requirement of review.requirements) {
    if (requirement.applicability === "unresolved") {
      out.push({ text: `Requirement "${requirement.authority || "unnamed"}": contact the policy owner to confirm whether it applies to this deployment.` });
    }
    if (requirement.status === "draft" || requirement.status === "stale") {
      out.push({ text: `Requirement "${requirement.authority || "unnamed"}" is ${requirement.status}. Re-check it against the current source before treating it as binding.` });
    }
  }
  if (!review.nextTest.trim()) {
    out.push({ text: "Choose one isolated compatibility test to run next, such as path validation with a representative relying party." });
  }
  return out;
}
