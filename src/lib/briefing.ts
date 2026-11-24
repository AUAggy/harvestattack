/**
 * Briefing export.
 *
 * One pure snapshot builder feeds every output format. Browser adapters
 * (clipboard, download, mail) never author content. The snapshot contains only
 * what the visitor selects; nothing is transmitted anywhere by this module.
 */
import { deriveScenario, formatMonth, known } from "@/domain/model";
import {
  CRYPTO_PURPOSE_LABELS,
  EVIDENCE_LEVEL_LABELS,
  type PkiReview,
  type WorksheetAsset,
} from "@/lib/contracts";
import type { SessionState } from "@/state/session";

export const EXPORT_SCHEMA_VERSION = 1;

export interface ExportSelection {
  includeScenario: boolean;
  flowIds: string[];
  signingAssetIds: string[];
  pkiReviewIds: string[];
  actionIds: string[];
  /** Exclude owner fields from all outputs. */
  redactOwners: boolean;
  /** Exclude evidence note text, keeping only evidence levels. */
  redactEvidenceNotes: boolean;
}

export interface ExportSnapshot {
  schemaVersion: number;
  generatedAt: string;
  contentVersion: string;
  scopeStatement: string;
  scenario?: {
    referenceMonth: string;
    captureAssumption: string;
    cutoverMonth: number;
    cutoverLabel: string;
    lifetimeMonths: number | "unknown";
    attackAssumption: string;
    planningMargin: number | "unknown";
    cohortExplanation: string;
    limits: string[];
  };
  flows: Array<Record<string, unknown>>;
  signingAssets: Array<Record<string, unknown>>;
  pkiReviews: Array<Record<string, unknown>>;
  actions: Array<Record<string, unknown>>;
  unknowns: string[];
  limitations: string[];
}

export const CONTENT_VERSION = "2026-10-r3";

const SCOPE_STATEMENT =
  "Educational self-assessment produced by harvestattack.com. The site inspected nothing: it did not observe any network, scan any system, or verify any claim below.";

function scenarioAttackLabel(state: SessionState): string {
  const a = state.scenario.attackAssumption;
  if (a.kind === "assumed") {
    return `Hypothetical: from ${formatMonth(a.month)} (month ${a.month}), an attacker can break the pre-migration protection. You chose this date; the site does not predict it.`;
  }
  if (a.kind === "none-within-horizon") {
    return "No attack date was assumed within the horizon. That is a limit of the example, not evidence of safety.";
  }
  return "No attack date chosen; exposure results are unknown.";
}

function assetToRecord(asset: WorksheetAsset, selection: ExportSelection): Record<string, unknown> {
  return {
    kind: asset.kind,
    label: asset.label || "Unlabeled asset",
    purpose: CRYPTO_PURPOSE_LABELS[asset.purpose],
    owner: selection.redactOwners ? "[redacted]" : asset.owner || "not recorded",
    scope: asset.scope || "not recorded",
    lifetimeMonths: asset.lifetimeMonths ?? "unknown",
    lifetimeBasis: asset.lifetimeBasis || "not recorded",
    knownAlgorithms: asset.knownAlgorithms || "unknown",
    dependencies: asset.dependencies || "none recorded",
    evidence: asset.evidence.map((e) => ({
      subject: e.subject,
      purpose: CRYPTO_PURPOSE_LABELS[e.purpose],
      level: EVIDENCE_LEVEL_LABELS[e.level],
      note: selection.redactEvidenceNotes ? "[redacted]" : e.note || "",
      nextCheck: e.nextCheck || "",
    })),
    nextAction: asset.nextAction || "not set",
    nextActionTargetDate: asset.nextActionTargetDate || "",
  };
}

function pkiReviewToRecord(review: PkiReview, selection: ExportSelection): Record<string, unknown> {
  return {
    label: review.label || "Unlabeled PKI use case",
    trustContext: review.trustContext,
    owner: selection.redactOwners ? "[redacted]" : review.owner || "not recorded",
    purpose: review.purpose || "not recorded",
    relyingPartyGroup: review.relyingPartyGroup || "not recorded",
    exclusions: review.exclusions || "none recorded",
    components: review.components.map((c) => ({
      role: c.role,
      name: c.name || "(unnamed)",
      purpose: c.purpose,
      algorithms: c.algorithms || "unknown",
      evidenceLevel: EVIDENCE_LEVEL_LABELS[c.evidenceLevel],
      evidenceNote: selection.redactEvidenceNotes ? "[redacted]" : c.evidenceNote,
      updateOwner: selection.redactOwners ? "[redacted]" : c.updateOwner,
    })),
    requirements: review.requirements.map((r) => ({
      authority: r.authority || "(unnamed)",
      versionSection: r.versionSection,
      status: r.status,
      applicability: r.applicability,
      applicabilityBasis: r.applicabilityBasis,
      boundary: r.boundary,
      evidenceNote: selection.redactEvidenceNotes ? "[redacted]" : r.evidenceNote,
      gap: r.gap,
      reviewerNote: selection.redactEvidenceNotes ? "[redacted]" : r.reviewerNote,
      reviewerRole: r.reviewerRole,
      reviewedOn: r.reviewedOn,
      nextAction: r.nextAction,
    })),
    nextTest: review.nextTest || "not set",
  };
}

/** Build the reviewed snapshot. Pure: same state and selection, same snapshot. */
export function buildSnapshot(state: SessionState, selection: ExportSelection, generatedAt: string): ExportSnapshot {
  const flows = state.flows.filter((f) => selection.flowIds.includes(f.localId));
  const signing = state.signingAssets.filter((a) => selection.signingAssetIds.includes(a.localId));
  const reviews = state.pkiReviews.filter((r) => selection.pkiReviewIds.includes(r.localId));
  const actions = state.actions.filter((a) => selection.actionIds.includes(a.localId));

  const unknowns: string[] = [];
  for (const asset of [...flows, ...signing]) {
    if (asset.evidence.length === 0 || asset.evidence.some((e) => e.level === "unknown")) {
      unknowns.push(`${asset.label || "Unlabeled asset"}: evidence missing or unknown.`);
    }
  }
  for (const review of reviews) {
    if (review.trustContext === "unknown") unknowns.push(`${review.label || "PKI review"}: trust context unknown.`);
    if (review.requirements.some((r) => r.applicability === "unresolved")) {
      unknowns.push(`${review.label || "PKI review"}: requirement applicability unresolved.`);
    }
  }

  let scenario: ExportSnapshot["scenario"];
  if (selection.includeScenario) {
    const result = deriveScenario(state.scenario, state.scenario.horizonMonths);
    const lifetime =
      state.scenario.confidentialityLifetimeMonths.kind === "known"
        ? state.scenario.confidentialityLifetimeMonths.value
        : ("unknown" as const);
    scenario = {
      referenceMonth: formatMonth(0),
      captureAssumption: state.scenario.assumeCapture
        ? "For this example we assume someone recorded everything on the path. It is a teaching assumption; nothing was observed."
        : "Recording is switched off in this example; the page shows no recorded copies.",
      cutoverMonth: result.cutoverMonth,
      cutoverLabel: formatMonth(result.cutoverMonth),
      lifetimeMonths: lifetime,
      attackAssumption: scenarioAttackLabel(state),
      planningMargin: result.planningMargin.kind === "known" ? result.planningMargin.value : "unknown",
      cohortExplanation:
        result.overlapCount > 0
          ? `Under the assumptions above, ${result.overlapCount} example ${result.overlapCount === 1 ? "item" : "items"} sent before the migration must still stay secret when the assumed attack arrives. Their only protection is the pre-migration kind, which the attack is assumed to break. Migration protects later transmissions; it does not change copies already recorded.`
          : result.overlapUnknownCount > 0
            ? `Whether some example items are exposed cannot be counted because an input is unknown (${result.overlapUnknownCount} items). Collecting that input is the next evidence step.`
            : "Under the assumptions above, no example item is both sent before the migration and still required to stay secret at the assumed attack date. This follows from the chosen inputs; it is not a general safety finding.",
      limits: [
        "The model shows one simplified path with example items, not measured traffic.",
        "The attack date is a hypothetical assumption. No arrival date is predicted.",
        "Exposed describes eligibility for the assumed attack, not confirmed decryption.",
        "Records outside the horizon, endpoint compromise, and active attacks are outside this model.",
      ],
    };
  }

  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    generatedAt,
    contentVersion: CONTENT_VERSION,
    scopeStatement: SCOPE_STATEMENT,
    scenario,
    flows: flows.map((f) => assetToRecord(f, selection)),
    signingAssets: signing.map((a) => assetToRecord(a, selection)),
    pkiReviews: reviews.map((r) => pkiReviewToRecord(r, selection)),
    actions: actions.map((a) => ({
      text: a.text,
      owner: selection.redactOwners ? "[redacted]" : a.owner || "",
      targetDate: a.targetDate || "",
      done: Boolean(a.done),
    })),
    unknowns,
    limitations: [
      "This brief reflects visitor-entered and self-reported information only.",
      "Names, notes, and evidence references can be sensitive even without private keys. Review before sending.",
      "Completing worksheet entries is not a security assessment or compliance finding.",
    ],
  };
}

const LINE = "-".repeat(64);

export function formatBriefingText(snapshot: ExportSnapshot): string {
  const out: string[] = [];
  out.push("HARVESTATTACK EVIDENCE BRIEF");
  out.push(LINE);
  out.push(snapshot.scopeStatement);
  out.push("");
  out.push(`Generated: ${snapshot.generatedAt}  Content version: ${snapshot.contentVersion}`);

  if (snapshot.scenario) {
    out.push("");
    out.push("LESSON SCENARIO (illustrative example, not an organizational fact)");
    out.push(`  Reference month: ${snapshot.scenario.referenceMonth}`);
    out.push(`  Capture: ${snapshot.scenario.captureAssumption}`);
    out.push(`  Cutover month: ${snapshot.scenario.cutoverLabel} (month ${snapshot.scenario.cutoverMonth})`);
    out.push(`  Confidentiality lifetime: ${snapshot.scenario.lifetimeMonths === "unknown" ? "unknown" : `${snapshot.scenario.lifetimeMonths} months`}`);
    out.push(`  Capability assumption: ${snapshot.scenario.attackAssumption}`);
    out.push(`  Planning margin (Z-X-Y): ${snapshot.scenario.planningMargin === "unknown" ? "unknown (inputs missing)" : `${snapshot.scenario.planningMargin} months`}`);
    out.push(`  ${snapshot.scenario.cohortExplanation}`);
    for (const limit of snapshot.scenario.limits) out.push(`  Limit: ${limit}`);
  }

  if (snapshot.flows.length || snapshot.signingAssets.length) {
    out.push("");
    out.push("WORKSHEET ENTRIES");
    for (const [i, asset] of [...snapshot.flows, ...snapshot.signingAssets].entries()) {
      out.push(`  ${i + 1}. ${asset.label} (${asset.purpose})`);
      out.push(`     Owner: ${asset.owner}`);
      out.push(`     Scope: ${asset.scope}`);
      out.push(`     Lifetime: ${asset.lifetimeMonths} months, basis: ${asset.lifetimeBasis}`);
      out.push(`     Known algorithms: ${asset.knownAlgorithms}`);
      out.push(`     Dependencies: ${asset.dependencies}`);
      const evidence = asset.evidence as Array<Record<string, unknown>>;
      if (evidence.length === 0) {
        out.push("     Evidence: none recorded");
      } else {
        for (const e of evidence) {
          out.push(`     Evidence [${e.level}] ${e.subject}${e.note ? `: ${e.note}` : ""}`);
          if (e.nextCheck) out.push(`       Next check: ${e.nextCheck}`);
        }
      }
      out.push(`     Next action: ${asset.nextAction}`);
    }
  }

  if (snapshot.pkiReviews.length) {
    out.push("");
    out.push("PRIVATE-PKI EVIDENCE REVIEW (not a compliance certificate)");
    for (const review of snapshot.pkiReviews) {
      out.push(`  Use case: ${review.label} (trust context: ${review.trustContext})`);
      for (const component of review.components as Array<Record<string, unknown>>) {
        out.push(`    Component: ${component.role} "${component.name}" evidence: ${component.evidenceLevel}`);
      }
      for (const requirement of review.requirements as Array<Record<string, unknown>>) {
        out.push(`    Requirement: ${requirement.authority} status: ${requirement.status} applicability: ${requirement.applicability} gap: ${requirement.gap}`);
      }
      out.push(`    Next test: ${review.nextTest}`);
    }
  }

  if (snapshot.unknowns.length) {
    out.push("");
    out.push("UNKNOWN AND MISSING EVIDENCE");
    for (const u of snapshot.unknowns) out.push(`  - ${u}`);
  }

  if (snapshot.actions.length) {
    out.push("");
    out.push("NEXT ACTIONS");
    for (const [i, action] of snapshot.actions.entries()) {
      out.push(`  ${i + 1}. ${action.text}${action.owner ? ` (owner: ${action.owner})` : ""}${action.targetDate ? ` [by ${action.targetDate}]` : ""}${action.done ? " [done]" : ""}`);
    }
  }

  out.push("");
  out.push("LIMITATIONS");
  for (const l of snapshot.limitations) out.push(`  - ${l}`);
  return out.join("\n");
}

export function formatBriefingMarkdown(snapshot: ExportSnapshot): string {
  const out: string[] = [];
  out.push("# HarvestAttack evidence brief");
  out.push("");
  out.push(snapshot.scopeStatement);
  out.push("");
  out.push(`Generated: ${snapshot.generatedAt} · Content version: \`${snapshot.contentVersion}\``);

  if (snapshot.scenario) {
    out.push("");
    out.push("## Lesson scenario (illustrative example)");
    out.push("");
    out.push(`- Reference month: ${snapshot.scenario.referenceMonth}`);
    out.push(`- Capture: ${snapshot.scenario.captureAssumption}`);
    out.push(`- Cutover: ${snapshot.scenario.cutoverLabel} (month ${snapshot.scenario.cutoverMonth})`);
    out.push(`- Confidentiality lifetime: ${snapshot.scenario.lifetimeMonths === "unknown" ? "unknown" : `${snapshot.scenario.lifetimeMonths} months`}`);
    out.push(`- Capability assumption: ${snapshot.scenario.attackAssumption}`);
    out.push(`- Planning margin (Z-X-Y): ${snapshot.scenario.planningMargin === "unknown" ? "unknown (inputs missing)" : `${snapshot.scenario.planningMargin} months`}`);
    out.push("");
    out.push(snapshot.scenario.cohortExplanation);
    out.push("");
    for (const limit of snapshot.scenario.limits) out.push(`- ${limit}`);
  }

  if (snapshot.flows.length || snapshot.signingAssets.length) {
    out.push("");
    out.push("## Worksheet entries");
    for (const asset of [...snapshot.flows, ...snapshot.signingAssets]) {
      out.push("");
      out.push(`### ${asset.label} (${asset.purpose})`);
      out.push(`- Scope: ${asset.scope}`);
      out.push(`- Lifetime: ${asset.lifetimeMonths} months, basis: ${asset.lifetimeBasis}`);
      out.push(`- Known algorithms: ${asset.knownAlgorithms}`);
      out.push(`- Dependencies: ${asset.dependencies}`);
      out.push(`- Next action: ${asset.nextAction}`);
    }
  }

  if (snapshot.pkiReviews.length) {
    out.push("");
    out.push("## Private-PKI evidence review");
    out.push("");
    out.push("> This is an evidence review record, not a compliance certificate.");
    for (const review of snapshot.pkiReviews) {
      out.push("");
      out.push(`### ${review.label} (trust context: ${review.trustContext})`);
      for (const component of review.components as Array<Record<string, unknown>>) {
        out.push(`- Component **${component.role}** "${component.name}": ${component.evidenceLevel}`);
      }
      for (const requirement of review.requirements as Array<Record<string, unknown>>) {
        out.push(`- Requirement **${requirement.authority}** (${requirement.status}): applicability ${requirement.applicability}, gap ${requirement.gap}`);
      }
      out.push(`- Next test: ${review.nextTest}`);
    }
  }

  if (snapshot.unknowns.length) {
    out.push("");
    out.push("## Unknown and missing evidence");
    for (const u of snapshot.unknowns) out.push(`- ${u}`);
  }

  if (snapshot.actions.length) {
    out.push("");
    out.push("## Next actions");
    for (const action of snapshot.actions) {
      out.push(`- [${action.done ? "x" : " "}] ${action.text}${action.owner ? ` (owner: ${action.owner})` : ""}${action.targetDate ? ` [by ${action.targetDate}]` : ""}`);
    }
  }

  out.push("");
  out.push("## Limitations");
  for (const l of snapshot.limitations) out.push(`- ${l}`);
  return out.join("\n");
}

export function formatBriefingJson(snapshot: ExportSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}
