/**
 * Versioned claim registry. Every volatile or externally supported statement
 * published on the site is registered here with a stable ID, a scoped
 * statement, its sources, and its review record. Teaching prose refers to
 * claims by ID; exports and the sources page render from the same registry.
 *
 * Rules:
 * - Statements are narrowly scoped. A claim never asserts more than its source
 *   supports.
 * - "Reviewed" means a maintainer re-opened the primary source on the checked
 *   date. An overdue review does not prove a claim false; it is flagged.
 * - Draft and announcement sources keep that status until a reviewer verifies
 *   a change.
 */
import { getSource, type SourceType } from "./sources";

export type ClaimStatus =
  | "final-standard"
  | "vendor-capability"
  | "announcement"
  | "policy-draft"
  | "illustration";

export interface Claim {
  /** Stable id used by prose, exports, and anchors. Never repurposed. */
  id: string;
  revision: number;
  /** Exact scoped statement. */
  statement: string;
  /** Cryptographic purpose the statement concerns. */
  purpose: "key-establishment" | "signature" | "symmetric-encryption" | "key-custody" | "general";
  sourceIds: string[];
  sourceType: SourceType;
  applicability: string;
  /** Date a maintainer last verified this statement against the source. */
  reviewedDate: string;
  /** Date by which the claim should be re-reviewed. */
  reviewDueDate: string;
  /** Optional short supporting excerpt. */
  excerpt?: string;
  /** Set when a newer claim supersedes this one. */
  supersededBy?: string;
  /** True once the statement is known wrong and kept only for history. */
  withdrawn?: boolean;
}

/**
 * The date the site's freshness labels are measured against: the content
 * release date. Move it forward at each content release, after re-reviewing
 * every claim that has come due. The registry tests fail if an active claim
 * is overdue as of this date, or if anything was checked after it, so a
 * release cannot ship with a lapsed review.
 */
export const CONTENT_DATE = "2026-10-15";

/** Quarterly starting cadence per the freshness policy. */
const nextQuarter = "2027-01-15";

export const claims: Record<string, Claim> = {
  "fips-203-final": {
    id: "fips-203-final",
    revision: 1,
    statement:
      "NIST finalized FIPS 203 in August 2024. It specifies ML-KEM, a lattice-based key-encapsulation mechanism.",
    purpose: "key-establishment",
    sourceIds: ["fips-203"],
    sourceType: "standard",
    applicability: "The standard itself. It does not say which products support it or how.",
    reviewedDate: "2026-10-15",
    reviewDueDate: nextQuarter,
  },
  "fips-204-final": {
    id: "fips-204-final",
    revision: 1,
    statement:
      "NIST finalized FIPS 204 in August 2024. It specifies ML-DSA, a lattice-based digital signature scheme.",
    purpose: "signature",
    sourceIds: ["fips-204"],
    sourceType: "standard",
    applicability: "The standard itself. Deployment depends on product and protocol support.",
    reviewedDate: "2026-10-15",
    reviewDueDate: nextQuarter,
  },
  "fips-205-final": {
    id: "fips-205-final",
    revision: 1,
    statement:
      "NIST finalized FIPS 205 in August 2024. It specifies SLH-DSA, a stateless hash-based signature scheme.",
    purpose: "signature",
    sourceIds: ["fips-205"],
    sourceType: "standard",
    applicability: "The standard itself. Signature and key sizes differ from ML-DSA.",
    reviewedDate: "2026-10-15",
    reviewDueDate: nextQuarter,
  },
  "sp800-227-kem": {
    id: "sp800-227-kem",
    revision: 1,
    statement:
      "NIST published SP 800-227 with recommendations for using key-encapsulation mechanisms, including hybrid use.",
    purpose: "key-establishment",
    sourceIds: ["sp-800-227", "nist-pqc-faq"],
    sourceType: "standard",
    applicability: "Guidance on KEM construction and use, not a deployment instruction.",
    reviewedDate: "2026-10-15",
    reviewDueDate: nextQuarter,
  },
  "hqc-selected-not-final": {
    id: "hqc-selected-not-final",
    revision: 1,
    statement:
      "NIST selected HQC in March 2025 as a fifth algorithm for post-quantum encryption. A draft standard was expected later; selection is not a final FIPS standard.",
    purpose: "key-establishment",
    sourceIds: ["hqc-selection"],
    sourceType: "announcement",
    applicability: "Standardization status only. No product support is implied.",
    reviewedDate: "2026-10-15",
    reviewDueDate: nextQuarter,
  },
  "openssl-3-5-mlkem": {
    id: "openssl-3-5-mlkem",
    revision: 1,
    statement:
      "OpenSSL 3.5 (April 2025) includes ML-KEM and enables hybrid ML-KEM key agreement in TLS by default. Applications still choose their own TLS stack, negotiation, and provider configuration.",
    purpose: "key-establishment",
    sourceIds: ["openssl-3-5"],
    sourceType: "vendor-capability",
    applicability:
      "The OpenSSL library release. A system using OpenSSL must still negotiate and observe the connection to confirm use.",
    reviewedDate: "2026-10-15",
    reviewDueDate: nextQuarter,
  },
  "openssh-hybrid-kex": {
    id: "openssh-hybrid-kex",
    revision: 1,
    statement:
      "OpenSSH documents a post-quantum hybrid key exchange (mlkem768x25519-sha256) and its maintained page describes default behavior by version. Host and user authentication remain separate signature operations.",
    purpose: "key-establishment",
    sourceIds: ["openssh-pq"],
    sourceType: "vendor-capability",
    applicability:
      "OpenSSH key agreement. A specific server's enabled kex list and negotiated method require local observation.",
    reviewedDate: "2026-10-15",
    reviewDueDate: nextQuarter,
  },
  "aws-kms-mldsa-signing": {
    id: "aws-kms-mldsa-signing",
    revision: 1,
    statement:
      "AWS KMS documents ML-DSA key specs for signing and verification. This is a signing capability; it is not transport key establishment for a connection.",
    purpose: "signature",
    sourceIds: ["aws-kms-mldsa"],
    sourceType: "vendor-capability",
    applicability: "KMS key specifications. API use, region availability, and constraints should be confirmed in the service documentation.",
    reviewedDate: "2026-10-15",
    reviewDueDate: nextQuarter,
  },
  "aws-kms-pq-tls-telemetry": {
    id: "aws-kms-pq-tls-telemetry",
    revision: 1,
    statement:
      "AWS KMS documents post-quantum TLS for calls to KMS endpoints and a tlsDetails field in some logs. Where tlsDetails.keyExchange is missing, the negotiated key agreement is unknown from that record.",
    purpose: "key-establishment",
    sourceIds: ["aws-kms-pq-tls"],
    sourceType: "vendor-capability",
    applicability:
      "Transport to KMS endpoints. It does not describe a visitor's own application traffic or stored encryption.",
    reviewedDate: "2026-10-15",
    reviewDueDate: nextQuarter,
  },
  "aws-cloudhsm-mldsa": {
    id: "aws-cloudhsm-mldsa",
    revision: 1,
    statement:
      "AWS CloudHSM documents generating ML-DSA key pairs with the CloudHSM CLI, with SDK, cluster hardware, FIPS mode, and provider constraints recorded in its release documentation. An HSM protects key custody; it does not change what algorithms a connection negotiates.",
    purpose: "key-custody",
    sourceIds: ["aws-cloudhsm-mldsa"],
    sourceType: "vendor-capability",
    applicability:
      "CloudHSM key generation and custody. Exact SDK versions, modes, and provider support must be rechecked in the linked pages before relying on them.",
    reviewedDate: "2026-10-15",
    reviewDueDate: nextQuarter,
  },
  "aws-transfer-pq-ssh": {
    id: "aws-transfer-pq-ssh",
    revision: 1,
    statement:
      "AWS Transfer Family documents post-quantum SSH security policies for SFTP endpoints. This covers key agreement policy on that product's endpoints only.",
    purpose: "key-establishment",
    sourceIds: ["aws-transfer-pq-ssh"],
    sourceType: "vendor-capability",
    applicability: "Transfer Family SFTP endpoints. It is not a statement about SSH elsewhere.",
    reviewedDate: "2026-10-15",
    reviewDueDate: nextQuarter,
  },
  "ir8547-draft-transition": {
    id: "ir8547-draft-transition",
    revision: 1,
    statement:
      "NIST IR 8547 is an initial public draft about transitioning from classical algorithms. Its draft tables treat RSA-2048 (112-bit category) differently from P-256 (128-bit category) for deprecation and disallowance milestones. Drafts are not requirements, and the document does not set a private-sector deadline.",
    purpose: "general",
    sourceIds: ["ir-8547"],
    sourceType: "policy",
    applicability: "Draft transition thinking by NIST. Scope and dates may change before finalization.",
    reviewedDate: "2026-10-15",
    reviewDueDate: nextQuarter,
  },
  "nsm10-federal-scope": {
    id: "nsm10-federal-scope",
    revision: 1,
    statement:
      "US National Security Memorandum 10 sets an objective for National Security Systems to complete quantum-resistant migration by 2035. Its scope is those systems, not the private sector generally.",
    purpose: "general",
    sourceIds: ["nsm-10"],
    sourceType: "policy",
    applicability: "US National Security Systems only. It does not set a deadline for the private sector.",
    reviewedDate: "2026-10-15",
    reviewDueDate: nextQuarter,
  },
  "rfc5280-path-validation": {
    id: "rfc5280-path-validation",
    revision: 1,
    statement:
      "RFC 5280 defines the X.509 certificate profile and the path-building and path-validation rules relying parties follow, including revocation handling.",
    purpose: "signature",
    sourceIds: ["rfc-5280"],
    sourceType: "standard",
    applicability: "X.509 PKI mechanics. It predates post-quantum algorithms; PQ algorithm identifiers are separate work.",
    reviewedDate: "2026-10-15",
    reviewDueDate: nextQuarter,
  },
  "rfc6960-ocsp": {
    id: "rfc6960-ocsp",
    revision: 1,
    statement:
      "RFC 6960 defines OCSP, the protocol relying parties can use to check certificate status with a responder.",
    purpose: "signature",
    sourceIds: ["rfc-6960"],
    sourceType: "standard",
    applicability: "Status checking mechanics. Deployment and algorithm support vary.",
    reviewedDate: "2026-10-15",
    reviewDueDate: nextQuarter,
  },
  "cmvp-module-validation": {
    id: "cmvp-module-validation",
    revision: 1,
    statement:
      "The NIST Cryptographic Module Validation Program validates cryptographic modules against FIPS 140 requirements. A validated module is a specific product, version, mode, and operating environment; algorithm standardization is a separate question.",
    purpose: "key-custody",
    sourceIds: ["nist-cmvp"],
    sourceType: "standard",
    applicability: "Module validation evidence. It does not certify a deployment or an organization.",
    reviewedDate: "2026-10-15",
    reviewDueDate: nextQuarter,
  },
};

export function getClaim(id: string): Claim {
  const found = claims[id];
  if (!found) throw new Error(`Unknown claim id: ${id}`);
  return found;
}

/** A claim is active when it is neither withdrawn nor superseded. */
export function isActiveClaim(claim: Claim): boolean {
  return !claim.withdrawn && !claim.supersededBy;
}

export function isReviewOverdue(claim: Claim, today: string): boolean {
  return today > claim.reviewDueDate;
}

/** Validate registry invariants: known sources, date ordering, no dangling supersession. */
export function validateClaims(): string[] {
  const issues: string[] = [];
  for (const claim of Object.values(claims)) {
    for (const sourceId of claim.sourceIds) {
      try {
        getSource(sourceId);
      } catch {
        issues.push(`Claim ${claim.id} references unknown source ${sourceId}`);
      }
    }
    if (claim.reviewedDate > claim.reviewDueDate) {
      issues.push(`Claim ${claim.id} has reviewedDate after reviewDueDate`);
    }
    if (claim.supersededBy && !claims[claim.supersededBy]) {
      issues.push(`Claim ${claim.id} supersedes to unknown claim ${claim.supersededBy}`);
    }
  }
  return issues;
}
