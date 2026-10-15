import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  CRYPTO_PURPOSE_LABELS,
  EVIDENCE_LEVEL_LABELS,
  PKI_ROLE_LABELS,
  suggestionsForAsset,
  suggestionsForPkiReview,
  type Applicability,
  type AssetKind,
  type CryptoPurpose,
  type EvidenceLevel,
  type EvidenceRecord,
  type GapState,
  type PkiComponent,
  type PkiComponentRole,
  type PkiReview,
  type RequirementMapping,
  type RequirementStatus,
  type Suggestion,
  type TrustContext,
  type WorksheetAsset,
} from "@/lib/contracts";
import {
  emptyFlow,
  emptyPkiComponent,
  emptyPkiReview,
  emptyRequirement,
  emptySigningAsset,
  nextLocalId,
  useSession,
} from "@/state/session";

/**
 * The worksheet (/assess). A bounded local inventory: confidentiality flows,
 * signing assets, and private CA or PKI reviews. Everything stays in the
 * visitor's browser unless exported. Unknown is explicit; there is no score,
 * no readiness measure, and no compliance verdict on this page.
 */

type Path = "confidentiality-flow" | "signing-asset" | "private-pki";

const PURPOSE_OPTIONS = (Object.keys(CRYPTO_PURPOSE_LABELS) as CryptoPurpose[]).map((p) => ({
  value: p,
  label: CRYPTO_PURPOSE_LABELS[p],
}));

const EVIDENCE_LEVEL_OPTIONS = (Object.keys(EVIDENCE_LEVEL_LABELS) as EvidenceLevel[]).map((l) => ({
  value: l,
  label: EVIDENCE_LEVEL_LABELS[l],
}));

const ROLE_OPTIONS = (Object.keys(PKI_ROLE_LABELS) as PkiComponentRole[]).map((r) => ({
  value: r,
  label: PKI_ROLE_LABELS[r],
}));

const TRUST_CONTEXT_OPTIONS: { value: TrustContext; label: string }[] = [
  { value: "private", label: "Private trust only" },
  { value: "public", label: "Public trust (public CAs)" },
  { value: "mixed", label: "Mixed private and public" },
  { value: "unknown", label: "Unknown" },
];

const REQUIREMENT_STATUS_OPTIONS: { value: RequirementStatus; label: string }[] = [
  { value: "final", label: "Final standard or policy" },
  { value: "draft", label: "Draft, not yet binding" },
  { value: "stale", label: "Stale; re-check before relying on it" },
  { value: "unknown", label: "Unknown" },
];

const APPLICABILITY_OPTIONS: { value: Applicability; label: string }[] = [
  { value: "applies", label: "Applies to this use case" },
  { value: "does-not-apply", label: "Does not apply" },
  { value: "unresolved", label: "Unresolved; a policy or system owner must confirm" },
];

const GAP_OPTIONS: { value: GapState; label: string }[] = [
  { value: "none-identified", label: "No gap identified" },
  { value: "gap-identified", label: "Gap identified" },
  { value: "needs-evidence", label: "Needs evidence" },
  { value: "unknown", label: "Unknown" },
];

function emptyEvidence(defaultPurpose: CryptoPurpose): EvidenceRecord {
  return {
    localId: nextLocalId("ev"),
    subject: "",
    purpose: defaultPurpose,
    level: "unknown",
    note: "",
    nextCheck: "",
  };
}

// ---------------------------------------------------------------------------
// Field primitives. Every input is controlled, labelled, and has help where
// the field is subtle.
// ---------------------------------------------------------------------------

const inputClass =
  "mt-1 block w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-foreground";

function TextField({
  id,
  label,
  help,
  requiredHint,
  invalid,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  help?: string;
  requiredHint?: boolean;
  invalid?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  const helpId = help ? `${id}-help` : undefined;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {requiredHint ? <span className="font-normal text-muted-foreground"> (required)</span> : null}
      </label>
      {help ? (
        <p id={helpId} className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {help}
        </p>
      ) : null}
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={helpId}
        aria-invalid={invalid || undefined}
        className={inputClass}
      />
    </div>
  );
}

function TextAreaField({
  id,
  label,
  help,
  requiredHint,
  invalid,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  id: string;
  label: string;
  help?: string;
  requiredHint?: boolean;
  invalid?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const helpId = help ? `${id}-help` : undefined;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {requiredHint ? <span className="font-normal text-muted-foreground"> (required)</span> : null}
      </label>
      {help ? (
        <p id={helpId} className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {help}
        </p>
      ) : null}
      <textarea
        id={id}
        name={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={helpId}
        aria-invalid={invalid || undefined}
        className={inputClass}
      />
    </div>
  );
}

function SelectField<T extends string>({
  id,
  label,
  help,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  help?: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  const helpId = help ? `${id}-help` : undefined;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {help ? (
        <p id={helpId} className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {help}
        </p>
      ) : null}
      <select
        id={id}
        name={id}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        aria-describedby={helpId}
        className={inputClass}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function NumberField({
  id,
  label,
  help,
  value,
  onChange,
}: {
  id: string;
  label: string;
  help?: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) {
  const helpId = help ? `${id}-help` : undefined;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {help ? (
        <p id={helpId} className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {help}
        </p>
      ) : null}
      <input
        id={id}
        name={id}
        type="number"
        min={0}
        step={1}
        inputMode="numeric"
        value={value ?? ""}
        onChange={(event) => {
          const raw = event.target.value;
          if (raw.trim() === "") {
            onChange(undefined);
            return;
          }
          const parsed = Number(raw);
          if (!Number.isNaN(parsed) && parsed >= 0) {
            onChange(Math.floor(parsed));
          }
        }}
        aria-describedby={helpId}
        className={`${inputClass} max-w-40`}
      />
    </div>
  );
}

function RowRemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary"
    >
      Remove row
    </button>
  );
}

// ---------------------------------------------------------------------------
// Record card: summary line, expand to edit, remove with two-click confirm.
// ---------------------------------------------------------------------------

function RecordCard({
  id,
  title,
  meta,
  expanded,
  onToggle,
  onRemove,
  children,
}: {
  id: string;
  title: string;
  meta: string[];
  expanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  children: ReactNode;
}) {
  const [confirming, setConfirming] = useState(false);
  const regionId = `${id}-detail`;
  return (
    <article className="rounded-lg border border-border bg-white">
      <div className="flex flex-wrap items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <ul className="mt-1 space-y-0.5 text-sm text-muted-foreground">
            {meta.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={regionId}
            className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            {expanded ? "Close" : "Open and edit"}
          </button>
          {confirming ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setConfirming(false);
                  onRemove();
                }}
                className="rounded-md border border-destructive/50 bg-white px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
              >
                Confirm remove
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-secondary"
              >
                Keep
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary"
            >
              Remove
            </button>
          )}
        </div>
      </div>
      {expanded ? (
        <div id={regionId} className="border-t border-border p-4">
          {children}
        </div>
      ) : null}
    </article>
  );
}

// ---------------------------------------------------------------------------
// Suggestions panel: Known, Unknown, and the deterministic next-evidence list.
// ---------------------------------------------------------------------------

function SuggestionsPanel({
  knownItems,
  unknownItems,
  suggestions,
  recordActionAdded,
  onAddRecordAction,
  onAddSuggestion,
  addedKeys,
  status,
}: {
  knownItems: string[];
  unknownItems: string[];
  suggestions: Suggestion[];
  recordActionAdded: boolean;
  onAddRecordAction: () => void;
  onAddSuggestion: (key: string, text: string) => void;
  addedKeys: Set<string>;
  status: string;
}) {
  return (
    <aside aria-label="Known, unknown, and next evidence to collect" className="text-sm">
      <h4 className="text-sm font-semibold text-foreground">Known</h4>
      {knownItems.length === 0 ? (
        <p className="mt-1 text-muted-foreground">Nothing recorded yet.</p>
      ) : (
        <ul className="mt-1 list-disc space-y-1 pl-5">
          {knownItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      <h4 className="mt-4 text-sm font-semibold text-foreground">Unknown</h4>
      {unknownItems.length === 0 ? (
        <p className="mt-1 text-muted-foreground">No open unknowns recorded in this form.</p>
      ) : (
        <ul className="mt-1 list-disc space-y-1 pl-5">
          {unknownItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      <h4 className="mt-4 text-sm font-semibold text-foreground">Next evidence to collect</h4>
      {suggestions.length === 0 ? (
        <p className="mt-1 text-muted-foreground">
          The visible rules produced no suggestion for the fields as they are now.
        </p>
      ) : (
        <ul className="mt-1 space-y-2">
          {suggestions.map((suggestion) => {
            const key = suggestion.text;
            const added = addedKeys.has(key);
            return (
              <li key={key} className="rounded-md border border-border bg-surface-1 p-2">
                <p className="leading-relaxed">{suggestion.text}</p>
                <button
                  type="button"
                  disabled={added}
                  onClick={() => onAddSuggestion(key, suggestion.text)}
                  className="mt-2 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {added ? "Added to actions" : "Add as action"}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4 border-t border-border pt-3">
        <button
          type="button"
          disabled={recordActionAdded}
          onClick={onAddRecordAction}
          className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {recordActionAdded ? "Added to actions" : "Add as action"}
        </button>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Adds this record itself to the action list on the Actions page.
        </p>
      </div>
      <p aria-live="polite" className="sr-only">
        {status}
      </p>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Confidentiality flow and signing asset records (WorksheetAsset).
// ---------------------------------------------------------------------------

function EvidenceRows({
  asset,
  onPatch,
}: {
  asset: WorksheetAsset;
  onPatch: (patch: Partial<WorksheetAsset>) => void;
}) {
  const defaultPurpose: CryptoPurpose =
    asset.kind === "signing-asset" ? "signature" : "key-establishment";
  const setRows = (rows: EvidenceRecord[]) => onPatch({ evidence: rows });
  const updateRow = (localId: string, patch: Partial<EvidenceRecord>) =>
    setRows(asset.evidence.map((row) => (row.localId === localId ? { ...row, ...patch } : row)));

  return (
    <fieldset className="mt-6 rounded-md border border-border p-3">
      <legend className="px-1 text-sm font-semibold">Evidence rows</legend>
      <p className="text-xs leading-relaxed text-muted-foreground">
        One row per hop, service, or component. Record what you actually know; leave the level at
        unknown when you know nothing yet.
      </p>
      {asset.evidence.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No evidence rows yet.</p>
      ) : (
        <ul className="mt-3 space-y-4">
          {asset.evidence.map((row) => (
            <li
              key={row.localId}
              aria-label={`Evidence row ${row.localId}`}
              className="space-y-3 rounded-md bg-surface-1 p-3"
            >
              <TextField
                id={`${asset.localId}-ev-${row.localId}-subject`}
                label="Subject"
                help="Which hop, service, or component is this about? Use a safe label."
                value={row.subject}
                onChange={(subject) => updateRow(row.localId, { subject })}
                placeholder="For example: application to object storage"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectField
                  id={`${asset.localId}-ev-${row.localId}-purpose`}
                  label="Purpose"
                  help="A capability for one purpose never covers another."
                  value={row.purpose}
                  onChange={(purpose) => updateRow(row.localId, { purpose })}
                  options={PURPOSE_OPTIONS}
                />
                <SelectField
                  id={`${asset.localId}-ev-${row.localId}-level`}
                  label="Evidence level"
                  value={row.level}
                  onChange={(level) => updateRow(row.localId, { level })}
                  options={EVIDENCE_LEVEL_OPTIONS}
                />
              </div>
              <TextAreaField
                id={`${asset.localId}-ev-${row.localId}-note`}
                label="Sanitized note"
                help="No credentials, no private keys, no real certificates, no sensitive hostnames."
                value={row.note}
                onChange={(note) => updateRow(row.localId, { note })}
                rows={2}
              />
              <TextField
                id={`${asset.localId}-ev-${row.localId}-next-check`}
                label="Next check"
                help="What would you check next when the level is unknown or partial?"
                value={row.nextCheck ?? ""}
                onChange={(nextCheck) => updateRow(row.localId, { nextCheck })}
              />
              <RowRemoveButton
                onClick={() => setRows(asset.evidence.filter((r) => r.localId !== row.localId))}
                label={`Remove evidence row for ${row.subject || "unnamed subject"}`}
              />
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => setRows([...asset.evidence, emptyEvidence(defaultPurpose)])}
        className="mt-3 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-secondary"
      >
        Add evidence row
      </button>
    </fieldset>
  );
}

function AssetEditor({
  asset,
  onPatch,
}: {
  asset: WorksheetAsset;
  onPatch: (patch: Partial<WorksheetAsset>) => void;
}) {
  const isSigning = asset.kind === "signing-asset";
  return (
    <div className="space-y-4">
      <TextField
        id={`${asset.localId}-label`}
        label="Safe label"
        requiredHint
        help={
          isSigning
            ? "A neutral name for this signing asset, e.g. 'Firmware release signing'. No real key identifiers."
            : "A neutral name for this flow, e.g. 'Partner API gateway'. No sensitive hostnames."
        }
        value={asset.label}
        onChange={(label) => onPatch({ label })}
      />
      <TextField
        id={`${asset.localId}-owner`}
        label="Owner"
        help={
          isSigning
            ? "A role is enough, e.g. 'Release engineering'. Optional, but unowned findings often stay unfixed. Includes the replacement owner when keys rotate."
            : "A role is enough, e.g. 'Platform team'. Optional, but unowned findings often stay unfixed."
        }
        value={asset.owner}
        onChange={(owner) => onPatch({ owner })}
      />
      <SelectField
        id={`${asset.localId}-purpose`}
        label="Cryptographic purpose"
        help="Key establishment protects confidentiality. Signatures prove identity. One does not substitute for the other."
        value={asset.purpose}
        onChange={(purpose) => onPatch({ purpose })}
        options={PURPOSE_OPTIONS}
      />
      <TextField
        id={`${asset.localId}-scope`}
        label={isSigning ? "Verifier population" : "Endpoints and hops"}
        help={
          isSigning
            ? "Who and what must verify these signatures: applications, devices, libraries, partners. Include offline or embedded verifiers."
            : "Name the hops in order, e.g. 'Application to storage via a gateway'. Use roles, not hostnames."
        }
        value={asset.scope}
        onChange={(scope) => onPatch({ scope })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          id={`${asset.localId}-lifetime`}
          label={isSigning ? "Required verification lifetime (months)" : "Confidentiality lifetime (months)"}
          help={
            isSigning
              ? "How long signatures must stay verifiable. Leave blank if you do not know yet."
              : "How long the data must stay confidential after transmission. Leave blank if you do not know yet."
          }
          value={asset.lifetimeMonths}
          onChange={(lifetimeMonths) => onPatch({ lifetimeMonths })}
        />
        <TextField
          id={`${asset.localId}-lifetime-basis`}
          label="Lifetime basis"
          help="What the number rests on: a policy, a contract, a retention rule, or your own estimate."
          value={asset.lifetimeBasis}
          onChange={(lifetimeBasis) => onPatch({ lifetimeBasis })}
        />
      </div>
      <TextAreaField
        id={`${asset.localId}-algorithms`}
        label="Known algorithms"
        help="What you know is in use today, with versions or modes if you know them. Leave blank if unknown."
        placeholder="For example: TLS 1.3 with X25519, RSA-2048 certificates. Leave blank if unknown."
        value={asset.knownAlgorithms}
        onChange={(knownAlgorithms) => onPatch({ knownAlgorithms })}
        rows={2}
      />
      <TextAreaField
        id={`${asset.localId}-dependencies`}
        label={isSigning ? "Trust store and verifier update path" : "Dependencies"}
        help={
          isSigning
            ? "How verifiers receive new trust anchors or policy, and who controls that update. A new ML-DSA key is not enough when existing verifiers cannot accept it."
            : "Anything else that carries or protects the same data: inner or message-layer encryption, key management services, partner-controlled systems."
        }
        value={asset.dependencies}
        onChange={(dependencies) => onPatch({ dependencies })}
      />
      <EvidenceRows asset={asset} onPatch={onPatch} />
      <TextAreaField
        id={`${asset.localId}-next-action`}
        label="Next action"
        help="The single next test or question that would remove the biggest unknown."
        value={asset.nextAction}
        onChange={(nextAction) => onPatch({ nextAction })}
        rows={2}
      />
    </div>
  );
}

function assetKnownUnknown(asset: WorksheetAsset): { known: string[]; unknown: string[] } {
  const known: string[] = [];
  const unknown: string[] = [];
  const push = (label: string, value: string) => {
    const trimmed = value.trim();
    if (trimmed) known.push(`${label}: ${trimmed}`);
    else unknown.push(`${label}: not recorded`);
  };
  push("Label", asset.label);
  push("Owner", asset.owner);
  push(asset.kind === "signing-asset" ? "Verifier population" : "Endpoints and hops", asset.scope);
  if (asset.lifetimeMonths !== undefined) {
    known.push(`${asset.kind === "signing-asset" ? "Verification lifetime" : "Confidentiality lifetime"}: ${asset.lifetimeMonths} months`);
  } else {
    unknown.push("Lifetime in months: not recorded");
  }
  push("Lifetime basis", asset.lifetimeBasis);
  push("Known algorithms", asset.knownAlgorithms);
  push(
    asset.kind === "signing-asset" ? "Trust store and verifier update path" : "Dependencies",
    asset.dependencies,
  );
  push("Next action", asset.nextAction);
  if (asset.evidence.length === 0) {
    unknown.push("Evidence rows: none recorded yet");
  }
  for (const row of asset.evidence) {
    const subject = row.subject.trim() || "Unnamed evidence row";
    if (row.level === "unknown") {
      unknown.push(`${subject}: needs evidence`);
    } else {
      known.push(`${subject}: ${EVIDENCE_LEVEL_LABELS[row.level]}`);
    }
  }
  return { known, unknown };
}

function AssetSection({ kind }: { kind: AssetKind }) {
  const { state, dispatch } = useSession();
  const [openId, setOpenId] = useState<string | null>(null);
  const [addedRecordIds, setAddedRecordIds] = useState<Set<string>>(new Set());
  const [addedKeys, setAddedKeys] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState("");

  const isSigning = kind === "signing-asset";
  const records = isSigning ? state.signingAssets : state.flows;
  const headingId = isSigning ? "signing-heading" : "flow-heading";
  const heading = isSigning ? "Signing assets" : "Confidentiality flows";
  const noun = isSigning ? "signing asset" : "confidentiality flow";

  const create = () => {
    const asset = isSigning ? emptySigningAsset() : emptyFlow();
    dispatch(isSigning ? { type: "add-signing-asset", asset } : { type: "add-flow", asset });
    setOpenId(asset.localId);
  };

  const remove = (localId: string) => {
    dispatch(isSigning ? { type: "remove-signing-asset", localId } : { type: "remove-flow", localId });
    if (openId === localId) setOpenId(null);
  };

  const update = (localId: string, patch: Partial<WorksheetAsset>) =>
    dispatch(isSigning ? { type: "update-signing-asset", localId, patch } : { type: "update-flow", localId, patch });

  const addRecordAction = (asset: WorksheetAsset) => {
    const text = asset.nextAction.trim()
      ? `${asset.label.trim() || `Untitled ${noun}`}: ${asset.nextAction.trim()}`
      : `Continue evidence collection for the ${noun} "${asset.label.trim() || "untitled"}".`;
    dispatch({
      type: "add-action",
      action: { localId: nextLocalId("action"), text, linkedAssetId: asset.localId },
    });
    setAddedRecordIds(new Set(addedRecordIds).add(asset.localId));
    setStatus("Action added to the list.");
  };

  const addSuggestion = (asset: WorksheetAsset, key: string, text: string) => {
    dispatch({
      type: "add-action",
      action: { localId: nextLocalId("action"), text, linkedAssetId: asset.localId },
    });
    setAddedKeys(new Set(addedKeys).add(`${asset.localId}|${key}`));
    setStatus("Action added to the list.");
  };

  const useLessonAssumptions = () => {
    const flow = emptyFlow();
    flow.label = "Lesson assumptions (illustrative example)";
    flow.lifetimeMonths =
      state.scenario.confidentialityLifetimeMonths.kind === "known"
        ? state.scenario.confidentialityLifetimeMonths.value
        : undefined;
    flow.lifetimeBasis = "Copied from the lesson example. Replace with your own evidence.";
    flow.knownAlgorithms =
      "Lesson example: classical before cutover, hybrid (such as X25519MLKEM768) after.";
    flow.nextAction = "Replace the illustrative assumptions with this flow's real endpoints and evidence.";
    dispatch({ type: "add-flow", asset: flow });
    setOpenId(flow.localId);
    setStatus("Lesson example flow added. It is labelled as an educational example.");
  };

  return (
    <section aria-labelledby={headingId} className="mt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id={headingId} className="text-2xl font-bold tracking-tight">
          {heading}
        </h2>
        <div className="flex flex-wrap gap-2">
          {!isSigning && (
            <button
              type="button"
              onClick={useLessonAssumptions}
              className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-secondary"
            >
              Use lesson assumptions in a new flow
            </button>
          )}
          <button
            type="button"
            onClick={create}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            New {noun}
          </button>
        </div>
      </div>
      <p className="mt-2 max-w-[72ch] text-sm leading-relaxed text-muted-foreground">
        {isSigning
          ? "Signatures that must keep verifying for years: code signing, documents, firmware, device identity. The verifier population and its update path drive the replacement plan."
          : "One connection whose data must stay confidential for a set time, such as backups, archives, or an API link. The lifetime and the hops drive what evidence to collect."}
      </p>

      {records.length === 0 ? (
        <p className="mt-4 rounded-lg border border-border bg-white p-4 text-sm leading-relaxed text-muted-foreground">
          No {noun} records yet. Select New {noun} above to start one. A safe label is enough; you
          can leave anything you do not know blank.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {records.map((asset) => {
            const expanded = openId === asset.localId;
            const { known, unknown } = assetKnownUnknown(asset);
            const evidenceUnknown = asset.evidence.filter((e) => e.level === "unknown").length;
            const meta = [
              asset.owner.trim() ? `Owner: ${asset.owner.trim()}` : "Owner: not recorded",
              asset.lifetimeMonths !== undefined
                ? `Lifetime: ${asset.lifetimeMonths} months`
                : "Lifetime: not recorded",
              `${asset.evidence.length} evidence row${asset.evidence.length === 1 ? "" : "s"}, ${evidenceUnknown} unknown`,
            ];
            return (
              <RecordCard
                key={asset.localId}
                id={asset.localId}
                title={asset.label.trim() || `Untitled ${noun}`}
                meta={meta}
                expanded={expanded}
                onToggle={() => setOpenId(expanded ? null : asset.localId)}
                onRemove={() => remove(asset.localId)}
              >
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                  <div className="min-w-0">
                    <AssetEditor asset={asset} onPatch={(patch) => update(asset.localId, patch)} />
                  </div>
                  <SuggestionsPanel
                    knownItems={known}
                    unknownItems={unknown}
                    suggestions={suggestionsForAsset(asset)}
                    recordActionAdded={addedRecordIds.has(asset.localId)}
                    onAddRecordAction={() => addRecordAction(asset)}
                    onAddSuggestion={(key, text) => addSuggestion(asset, key, text)}
                    addedKeys={
                      new Set(
                        [...addedKeys]
                          .filter((k) => k.startsWith(`${asset.localId}|`))
                          .map((k) => k.slice(asset.localId.length + 1)),
                      )
                    }
                    status={status}
                  />
                </div>
              </RecordCard>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Private CA / PKI review records (PkiReview).
// ---------------------------------------------------------------------------

function ComponentRows({
  review,
  onPatch,
}: {
  review: PkiReview;
  onPatch: (patch: Partial<PkiReview>) => void;
}) {
  const setRows = (rows: PkiComponent[]) => onPatch({ components: rows });
  const updateRow = (localId: string, patch: Partial<PkiComponent>) =>
    setRows(review.components.map((row) => (row.localId === localId ? { ...row, ...patch } : row)));

  return (
    <fieldset className="mt-6 rounded-md border border-border p-3">
      <legend className="px-1 text-sm font-semibold">Lifecycle components</legend>
      <p className="text-xs leading-relaxed text-muted-foreground">
        A bounded list, not a topology: hierarchy, profiles, enrollment, status, relying parties,
        trust distribution. Record deployment metadata manually. Never paste real keys or
        certificates.
      </p>
      {review.components.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No components recorded yet.</p>
      ) : (
        <ul className="mt-3 space-y-4">
          {review.components.map((row) => (
            <li key={row.localId} className="space-y-3 rounded-md bg-surface-1 p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectField
                  id={`${review.localId}-comp-${row.localId}-role`}
                  label="Role"
                  value={row.role}
                  onChange={(role) => updateRow(row.localId, { role })}
                  options={ROLE_OPTIONS}
                />
                <TextField
                  id={`${review.localId}-comp-${row.localId}-name`}
                  label="Name"
                  help="A safe label, e.g. 'Issuing CA (software)'. Real names are optional."
                  value={row.name}
                  onChange={(name) => updateRow(row.localId, { name })}
                />
              </div>
              <TextField
                id={`${review.localId}-comp-${row.localId}-purpose`}
                label="Purpose in this use case"
                value={row.purpose}
                onChange={(purpose) => updateRow(row.localId, { purpose })}
              />
              <TextAreaField
                id={`${review.localId}-comp-${row.localId}-algorithms`}
                label="Algorithms, formats, versions, modes"
                help="What you know this component supports today. Leave blank if unknown."
                value={row.algorithms}
                onChange={(algorithms) => updateRow(row.localId, { algorithms })}
                rows={2}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectField
                  id={`${review.localId}-comp-${row.localId}-level`}
                  label="Evidence level"
                  value={row.evidenceLevel}
                  onChange={(evidenceLevel) => updateRow(row.localId, { evidenceLevel })}
                  options={EVIDENCE_LEVEL_OPTIONS}
                />
                <TextField
                  id={`${review.localId}-comp-${row.localId}-update-owner`}
                  label="Update owner"
                  help="Who can change or upgrade this component."
                  value={row.updateOwner}
                  onChange={(updateOwner) => updateRow(row.localId, { updateOwner })}
                />
              </div>
              <TextAreaField
                id={`${review.localId}-comp-${row.localId}-note`}
                label="Sanitized evidence note"
                help="No credentials, no private keys, no real certificates."
                value={row.evidenceNote}
                onChange={(evidenceNote) => updateRow(row.localId, { evidenceNote })}
                rows={2}
              />
              <RowRemoveButton
                onClick={() => setRows(review.components.filter((r) => r.localId !== row.localId))}
                label={`Remove component ${row.name || PKI_ROLE_LABELS[row.role]}`}
              />
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => setRows([...review.components, emptyPkiComponent(review.localId)])}
        className="mt-3 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-secondary"
      >
        Add component
      </button>
    </fieldset>
  );
}

function RequirementRows({
  review,
  onPatch,
}: {
  review: PkiReview;
  onPatch: (patch: Partial<PkiReview>) => void;
}) {
  const setRows = (rows: RequirementMapping[]) => onPatch({ requirements: rows });
  const updateRow = (localId: string, patch: Partial<RequirementMapping>) =>
    setRows(review.requirements.map((row) => (row.localId === localId ? { ...row, ...patch } : row)));

  return (
    <fieldset className="mt-6 rounded-md border border-border p-3">
      <legend className="px-1 text-sm font-semibold">Requirement mappings</legend>
      <p className="text-xs leading-relaxed text-muted-foreground">
        One row per standard, regulation, or internal policy you are tracking. Applicability stays
        unresolved until someone responsible confirms it. This site records your answers; it does
        not verify them.
      </p>
      {review.requirements.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No requirements recorded yet.</p>
      ) : (
        <ul className="mt-3 space-y-4">
          {review.requirements.map((row) => {
            const basisRequired = row.applicability !== "unresolved";
            const basisMissing = basisRequired && row.applicabilityBasis.trim() === "";
            return (
              <li key={row.localId} className="space-y-3 rounded-md bg-surface-1 p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    id={`${review.localId}-req-${row.localId}-authority`}
                    label="Authority or internal policy"
                    requiredHint
                    value={row.authority}
                    onChange={(authority) => updateRow(row.localId, { authority })}
                  />
                  <TextField
                    id={`${review.localId}-req-${row.localId}-version`}
                    label="Version and section"
                    help="e.g. 'v1.2, section 4.1'. Leave blank if unknown."
                    value={row.versionSection}
                    onChange={(versionSection) => updateRow(row.localId, { versionSection })}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <SelectField
                    id={`${review.localId}-req-${row.localId}-status`}
                    label="Status of the requirement"
                    value={row.status}
                    onChange={(status) => updateRow(row.localId, { status })}
                    options={REQUIREMENT_STATUS_OPTIONS}
                  />
                  <SelectField
                    id={`${review.localId}-req-${row.localId}-applicability`}
                    label="Applicability"
                    value={row.applicability}
                    onChange={(applicability) => updateRow(row.localId, { applicability })}
                    options={APPLICABILITY_OPTIONS}
                  />
                </div>
                <TextAreaField
                  id={`${review.localId}-req-${row.localId}-basis`}
                  label="Applicability basis"
                  requiredHint={basisRequired}
                  invalid={basisMissing}
                  help={
                    basisRequired
                      ? "Required when you record applies or does not apply. State the reason in your own words."
                      : "Needed once applicability is decided. While unresolved, leave this blank."
                  }
                  value={row.applicabilityBasis}
                  onChange={(applicabilityBasis) => updateRow(row.localId, { applicabilityBasis })}
                  rows={2}
                />
                <TextField
                  id={`${review.localId}-req-${row.localId}-boundary`}
                  label="Boundary covered"
                  help="Which operation, component, and deployment boundary this requirement covers."
                  value={row.boundary}
                  onChange={(boundary) => updateRow(row.localId, { boundary })}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextAreaField
                    id={`${review.localId}-req-${row.localId}-evidence`}
                    label="Supporting or conflicting evidence"
                    help="Sanitized. Reference the evidence rows or notes you already hold."
                    value={row.evidenceNote}
                    onChange={(evidenceNote) => updateRow(row.localId, { evidenceNote })}
                    rows={2}
                  />
                  <SelectField
                    id={`${review.localId}-req-${row.localId}-gap`}
                    label="Gap state"
                    value={row.gap}
                    onChange={(gap) => updateRow(row.localId, { gap })}
                    options={GAP_OPTIONS}
                  />
                </div>
                <fieldset className="rounded-md border border-border p-3">
                  <legend className="px-1 text-xs font-semibold">Reviewer decision</legend>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Your note is stored as visitor-entered and unverified by this site.
                  </p>
                  <div className="mt-3 space-y-3">
                    <TextAreaField
                      id={`${review.localId}-req-${row.localId}-reviewer-note`}
                      label="Reviewer note"
                      value={row.reviewerNote}
                      onChange={(reviewerNote) => updateRow(row.localId, { reviewerNote })}
                      rows={2}
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <TextField
                        id={`${review.localId}-req-${row.localId}-reviewer-role`}
                        label="Reviewer role"
                        help="e.g. 'PKI operator' or 'Compliance lead'."
                        value={row.reviewerRole}
                        onChange={(reviewerRole) => updateRow(row.localId, { reviewerRole })}
                      />
                      <TextField
                        id={`${review.localId}-req-${row.localId}-reviewed-on`}
                        label="Reviewed on"
                        type="date"
                        value={row.reviewedOn}
                        onChange={(reviewedOn) => updateRow(row.localId, { reviewedOn })}
                      />
                    </div>
                  </div>
                </fieldset>
                <TextField
                  id={`${review.localId}-req-${row.localId}-next-action`}
                  label="Next action for this requirement"
                  help="e.g. 'Ask the policy owner whether this section covers enclave deployments.'"
                  value={row.nextAction}
                  onChange={(nextAction) => updateRow(row.localId, { nextAction })}
                />
                <RowRemoveButton
                  onClick={() => setRows(review.requirements.filter((r) => r.localId !== row.localId))}
                  label={`Remove requirement ${row.authority || "unnamed"}`}
                />
              </li>
            );
          })}
        </ul>
      )}
      <button
        type="button"
        onClick={() => setRows([...review.requirements, emptyRequirement(review.localId)])}
        className="mt-3 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-secondary"
      >
        Add requirement
      </button>
    </fieldset>
  );
}

function PkiReviewEditor({
  review,
  onPatch,
}: {
  review: PkiReview;
  onPatch: (patch: Partial<PkiReview>) => void;
}) {
  return (
    <div className="space-y-4">
      <TextField
        id={`${review.localId}-label`}
        label="Safe label"
        requiredHint
        help="A neutral name for the use case, e.g. 'Internal service certificates'."
        value={review.label}
        onChange={(label) => onPatch({ label })}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField
          id={`${review.localId}-trust`}
          label="Trust context"
          help="Private trust adds internal requirements. Public trust adds external ones. Choose unknown if unsure."
          value={review.trustContext}
          onChange={(trustContext) => onPatch({ trustContext })}
          options={TRUST_CONTEXT_OPTIONS}
        />
        <TextField
          id={`${review.localId}-owner`}
          label="Owner"
          help="Who is responsible for this use case. Unknown ownership becomes an action, not an assumed capability."
          value={review.owner}
          onChange={(owner) => onPatch({ owner })}
        />
      </div>
      <TextField
        id={`${review.localId}-purpose`}
        label="Purpose"
        help="What the certificates are for, e.g. 'Mutual TLS between internal services'."
        value={review.purpose}
        onChange={(purpose) => onPatch({ purpose })}
      />
      <TextField
        id={`${review.localId}-relying-parties`}
        label="Relying party group"
        help="Who must accept and validate these certificates: applications, devices, partner systems."
        value={review.relyingPartyGroup}
        onChange={(relyingPartyGroup) => onPatch({ relyingPartyGroup })}
      />
      <TextAreaField
        id={`${review.localId}-exclusions`}
        label="Explicit exclusions"
        help="What this review deliberately leaves out, so the scope stays honest."
        value={review.exclusions}
        onChange={(exclusions) => onPatch({ exclusions })}
        rows={2}
      />
      <ComponentRows review={review} onPatch={onPatch} />
      <RequirementRows review={review} onPatch={onPatch} />
      <TextAreaField
        id={`${review.localId}-next-test`}
        label="Next test"
        help="One isolated compatibility test, such as path validation with a representative relying party."
        value={review.nextTest}
        onChange={(nextTest) => onPatch({ nextTest })}
        rows={2}
      />
    </div>
  );
}

function pkiKnownUnknown(review: PkiReview): { known: string[]; unknown: string[] } {
  const known: string[] = [];
  const unknown: string[] = [];
  const push = (label: string, value: string) => {
    const trimmed = value.trim();
    if (trimmed) known.push(`${label}: ${trimmed}`);
    else unknown.push(`${label}: not recorded`);
  };
  push("Label", review.label);
  if (review.trustContext === "unknown") {
    unknown.push("Trust context: not chosen");
  } else {
    const option = TRUST_CONTEXT_OPTIONS.find((o) => o.value === review.trustContext);
    known.push(`Trust context: ${option ? option.label : review.trustContext}`);
  }
  push("Owner", review.owner);
  push("Purpose", review.purpose);
  push("Relying party group", review.relyingPartyGroup);
  push("Exclusions", review.exclusions);
  push("Next test", review.nextTest);
  if (review.components.length === 0) {
    unknown.push("Lifecycle components: none recorded yet");
  }
  for (const component of review.components) {
    const name = component.name.trim() || PKI_ROLE_LABELS[component.role];
    if (component.evidenceLevel === "unknown") {
      unknown.push(`${name}: needs evidence`);
    } else {
      known.push(`${name}: ${EVIDENCE_LEVEL_LABELS[component.evidenceLevel]}`);
    }
  }
  if (review.requirements.length === 0) {
    unknown.push("Requirement mappings: none recorded yet");
  }
  for (const requirement of review.requirements) {
    const name = requirement.authority.trim() || "Unnamed requirement";
    if (requirement.applicability === "unresolved") {
      unknown.push(`${name}: applicability unresolved`);
    } else {
      const option = APPLICABILITY_OPTIONS.find((o) => o.value === requirement.applicability);
      known.push(`${name}: ${option ? option.label.toLowerCase() : requirement.applicability}`);
    }
  }
  return { known, unknown };
}

function PkiSection() {
  const { state, dispatch } = useSession();
  const [openId, setOpenId] = useState<string | null>(null);
  const [addedRecordIds, setAddedRecordIds] = useState<Set<string>>(new Set());
  const [addedKeys, setAddedKeys] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState("");

  const records = state.pkiReviews;

  const create = () => {
    const review = emptyPkiReview();
    dispatch({ type: "add-pki-review", review });
    setOpenId(review.localId);
  };

  const remove = (localId: string) => {
    dispatch({ type: "remove-pki-review", localId });
    if (openId === localId) setOpenId(null);
  };

  const update = (localId: string, patch: Partial<PkiReview>) =>
    dispatch({ type: "update-pki-review", localId, patch });

  const addRecordAction = (review: PkiReview) => {
    const text = review.nextTest.trim()
      ? `${review.label.trim() || "Untitled PKI review"}: ${review.nextTest.trim()}`
      : `Continue the PKI review "${review.label.trim() || "untitled"}": plan the next isolated compatibility test.`;
    dispatch({
      type: "add-action",
      action: { localId: nextLocalId("action"), text, linkedPkiReviewId: review.localId },
    });
    setAddedRecordIds(new Set(addedRecordIds).add(review.localId));
    setStatus("Action added to the list.");
  };

  const addSuggestion = (review: PkiReview, key: string, text: string) => {
    dispatch({
      type: "add-action",
      action: { localId: nextLocalId("action"), text, linkedPkiReviewId: review.localId },
    });
    setAddedKeys(new Set(addedKeys).add(`${review.localId}|${key}`));
    setStatus("Action added to the list.");
  };

  return (
    <section aria-labelledby="pki-heading" className="mt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="pki-heading" className="text-2xl font-bold tracking-tight">
          Private CA and PKI reviews
        </h2>
        <button
          type="button"
          onClick={create}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New PKI review
        </button>
      </div>
      <p className="mt-2 max-w-[72ch] text-sm leading-relaxed text-muted-foreground">
        One certificate use case at a time: trust context, lifecycle components, applicable
        requirements, and the next isolated test. No attack date or data lifetime is needed here.
      </p>

      {records.length === 0 ? (
        <p className="mt-4 rounded-lg border border-border bg-white p-4 text-sm leading-relaxed text-muted-foreground">
          No PKI reviews yet. Select New PKI review above and start with a neutral label such as
          'Internal service certificates'. Everything else can stay unknown until you have evidence.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {records.map((review) => {
            const expanded = openId === review.localId;
            const { known, unknown } = pkiKnownUnknown(review);
            const meta = [
              `Trust context: ${TRUST_CONTEXT_OPTIONS.find((o) => o.value === review.trustContext)?.label ?? review.trustContext}`,
              review.owner.trim() ? `Owner: ${review.owner.trim()}` : "Owner: not recorded",
              `${review.components.length} component${review.components.length === 1 ? "" : "s"}, ${review.requirements.length} requirement${review.requirements.length === 1 ? "" : "s"}`,
            ];
            return (
              <RecordCard
                key={review.localId}
                id={review.localId}
                title={review.label.trim() || "Untitled PKI review"}
                meta={meta}
                expanded={expanded}
                onToggle={() => setOpenId(expanded ? null : review.localId)}
                onRemove={() => remove(review.localId)}
              >
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                  <div className="min-w-0">
                    <PkiReviewEditor review={review} onPatch={(patch) => update(review.localId, patch)} />
                  </div>
                  <SuggestionsPanel
                    knownItems={known}
                    unknownItems={unknown}
                    suggestions={suggestionsForPkiReview(review)}
                    recordActionAdded={addedRecordIds.has(review.localId)}
                    onAddRecordAction={() => addRecordAction(review)}
                    onAddSuggestion={(key, text) => addSuggestion(review, key, text)}
                    addedKeys={
                      new Set(
                        [...addedKeys]
                          .filter((k) => k.startsWith(`${review.localId}|`))
                          .map((k) => k.slice(review.localId.length + 1)),
                      )
                    }
                    status={status}
                  />
                </div>
              </RecordCard>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const PATH_OPTIONS: { value: Path; title: string; description: string }[] = [
  {
    value: "confidentiality-flow",
    title: "Review a confidentiality flow",
    description: "One connection whose data must stay confidential for a set time.",
  },
  {
    value: "signing-asset",
    title: "Review a signing asset",
    description: "Signatures that must keep verifying for years.",
  },
  {
    value: "private-pki",
    title: "Review a private CA or PKI use case",
    description: "One certificate use case: lifecycle, requirements, and tests.",
  },
];

export default function Assess() {
  const { state, dispatch } = useSession();
  const [path, setPath] = useState<Path>("confidentiality-flow");
  const [clearConfirming, setClearConfirming] = useState(false);

  // The #private-pki deep link preselects the PKI path. Read once on mount.
  useEffect(() => {
    if (window.location.hash === "#private-pki") {
      setPath("private-pki");
    }
  }, []);

  const totalRecords = state.flows.length + state.signingAssets.length + state.pkiReviews.length;

  const clearAll = () => {
    dispatch({ type: "clear-all-local-work" });
    setClearConfirming(false);
  };

  return (
    <div className="container px-4 py-8 sm:px-6">
      <header className="max-w-[72ch]">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Worksheet</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          Record what you know, and what you do not
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          A bounded inventory for one flow, one signing asset, or one certificate use case at a
          time. The site supplies the structure; it never inspects your systems or checks your
          answers.
        </p>
      </header>

      {/* Scope and privacy */}
      <section aria-labelledby="privacy-heading" className="mt-8 rounded-lg border border-border bg-white p-4">
        <h2 id="privacy-heading" className="text-xl font-bold tracking-tight">
          Scope and privacy
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>Everything you type stays in your browser unless you export it yourself.</li>
          <li>Reloading or closing the browser clears the worksheet unless you enable saving below.</li>
          <li>Enter no secrets, no private keys, and no real certificates. Safe labels are enough.</li>
        </ul>
        <div className="mt-4 rounded-md bg-surface-2 p-3">
          <label htmlFor="save-consent" className="flex items-start gap-2 text-sm font-medium">
            <input
              id="save-consent"
              type="checkbox"
              checked={state.saveOnThisDevice}
              onChange={(event) =>
                dispatch({ type: "set-save-consent", enabled: event.target.checked })
              }
              className="mt-1"
            />
            <span>Save this worksheet on this device</span>
          </label>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            When enabled, your entries are stored in this browser's local storage, which is
            unencrypted. Anyone with access to this device and browser profile can read them.
            Turning this off removes the stored copy.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {clearConfirming ? (
              <>
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-md border border-destructive/50 bg-white px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                >
                  Confirm: clear all local work
                </button>
                <button
                  type="button"
                  onClick={() => setClearConfirming(false)}
                  className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                >
                  Keep my work
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setClearConfirming(true)}
                className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary"
              >
                Clear all local work
              </button>
            )}
            <span className="text-xs text-muted-foreground">
              Removes every record and action, including any stored copy.
            </span>
          </div>
        </div>
      </section>

      {/* Choose a path */}
      <section aria-labelledby="path-heading" className="mt-8">
        <h2 id="path-heading" className="text-xl font-bold tracking-tight">
          Choose a path
        </h2>
        <fieldset className="mt-3">
          <legend className="text-sm text-muted-foreground">
            You can switch at any time. Records are kept per path.
          </legend>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {PATH_OPTIONS.map((option) => (
              <label
                key={option.value}
                htmlFor={`path-${option.value}`}
                className={`cursor-pointer rounded-lg border bg-white p-4 ${
                  path === option.value ? "border-primary ring-1 ring-primary" : "border-border"
                }`}
              >
                <span className="flex items-start gap-2">
                  <input
                    id={`path-${option.value}`}
                    type="radio"
                    name="worksheet-path"
                    value={option.value}
                    checked={path === option.value}
                    onChange={() => setPath(option.value)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{option.title}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {/* Empty state */}
      {totalRecords === 0 && (
        <section aria-labelledby="empty-heading" className="mt-8 rounded-lg border border-border bg-white p-4">
          <h2 id="empty-heading" className="text-sm font-semibold">
            Your worksheet is empty
          </h2>
          <p className="mt-2 max-w-[72ch] text-sm leading-relaxed text-muted-foreground">
            Nothing is recorded yet, and nothing leaves this browser. A suggested first step:
            choose Review a confidentiality flow above, then select New confidentiality flow and
            describe one connection whose data must stay confidential for years. Leave unknown
            fields blank; the worksheet turns them into the next evidence to collect.
          </p>
        </section>
      )}

      {path === "private-pki" ? <PkiSection /> : <AssetSection kind={path} />}

      {/* Exits */}
      <section aria-labelledby="exit-heading" className="mt-10 rounded-lg border border-border bg-white p-4">
        <h2 id="exit-heading" className="text-sm font-semibold">
          Continue
        </h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            to="/share"
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            Preview the briefing
          </Link>
          <Link
            to="/act"
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            Turn evidence into actions
          </Link>
        </div>
      </section>
    </div>
  );
}
