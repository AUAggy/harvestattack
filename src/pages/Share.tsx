/**
 * Briefing page (rebuild plan sections 8.3 "Briefing" and 9.4).
 *
 * A document preview, not a decorative sharing card. Selection and redaction
 * come before generation, the preview invalidates when the underlying session
 * or selection changes, and every export operates on the generated snapshot.
 * Nothing leaves the browser except what the visitor copies, downloads, or
 * hands to their own mail client.
 */
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  buildSnapshot,
  formatBriefingJson,
  formatBriefingMarkdown,
  formatBriefingText,
  type ExportSelection,
  type ExportSnapshot,
} from "@/lib/briefing";
import { copyText, downloadText } from "@/lib/browser";
import type { PkiReview, WorksheetAction, WorksheetAsset } from "@/lib/contracts";
import { useSession, type SessionState } from "@/state/session";

const EMAIL_MAX_CHARS = 1800;
const PUBLIC_LESSON_URL = "https://harvestattack.com/understand";

type BriefFormat = "text" | "markdown" | "json";

const FORMAT_LABELS: Record<BriefFormat, string> = {
  text: "Text",
  markdown: "Markdown",
  json: "JSON",
};

const FORMAT_EXTENSIONS: Record<BriefFormat, string> = {
  text: "txt",
  markdown: "md",
  json: "json",
};

type IdListKey = "flowIds" | "signingAssetIds" | "pkiReviewIds" | "actionIds";

interface AdapterStatus {
  kind: "idle" | "ok" | "error";
  message: string;
}

const IDLE_STATUS: AdapterStatus = { kind: "idle", message: "" };

const PRIMARY_BUTTON =
  "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40";
const SECONDARY_BUTTON =
  "rounded-md border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40";
const TAB_ACTIVE = "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground";
const TAB_IDLE = "rounded-md border border-border bg-white px-3 py-1.5 text-sm font-medium hover:bg-secondary";
const LINK_CLASS = "font-medium text-primary underline underline-offset-2 hover:text-primary/90";

/** Stable fingerprint of everything the snapshot depends on. */
function fingerprintOf(selection: ExportSelection, state: SessionState): string {
  return JSON.stringify([
    selection,
    state.scenario,
    state.flows,
    state.signingAssets,
    state.pkiReviews,
    state.actions,
  ]);
}

function assetListLabel(asset: WorksheetAsset): string {
  if (asset.label.trim()) return asset.label;
  return asset.kind === "signing-asset" ? "Unlabeled signing asset" : "Unlabeled confidentiality flow";
}

function pkiListLabel(review: PkiReview): string {
  return review.label.trim() || "Unlabeled PKI use case";
}

function actionListLabel(action: WorksheetAction): string {
  return action.text.trim() || "Unlabeled action";
}

export default function Share() {
  const { state } = useSession();

  // Selection is local to this page and starts from what the session holds.
  const [selection, setSelection] = useState<ExportSelection>(() => ({
    includeScenario: true,
    flowIds: state.flows.map((flow) => flow.localId),
    signingAssetIds: state.signingAssets.map((asset) => asset.localId),
    pkiReviewIds: state.pkiReviews.map((review) => review.localId),
    actionIds: state.actions.map((action) => action.localId),
    redactOwners: false,
    redactEvidenceNotes: false,
  }));

  const [preview, setPreview] = useState<ExportSnapshot | null>(null);
  const [previewGeneratedAt, setPreviewGeneratedAt] = useState<string | null>(null);
  const [previewFingerprint, setPreviewFingerprint] = useState<string | null>(null);
  const [format, setFormat] = useState<BriefFormat>("text");
  const [status, setStatus] = useState<AdapterStatus>(IDLE_STATUS);
  const [linkStatus, setLinkStatus] = useState<AdapterStatus>(IDLE_STATUS);

  const currentFingerprint = useMemo(() => fingerprintOf(selection, state), [selection, state]);
  const stale = preview !== null && previewFingerprint !== currentFingerprint;
  // Every export acts on the generated snapshot, so it must exist and be current.
  const canExport = preview !== null && !stale;

  const nothingSelected =
    !selection.includeScenario &&
    selection.flowIds.length === 0 &&
    selection.signingAssetIds.length === 0 &&
    selection.pkiReviewIds.length === 0 &&
    selection.actionIds.length === 0;

  const rawText = useMemo(() => (preview ? formatBriefingText(preview) : ""), [preview]);
  const rawMarkdown = useMemo(() => (preview ? formatBriefingMarkdown(preview) : ""), [preview]);
  const rawJson = useMemo(() => (preview ? formatBriefingJson(preview) : ""), [preview]);
  const raw = format === "text" ? rawText : format === "markdown" ? rawMarkdown : rawJson;

  // Pure string building; no browser API runs during render.
  const mailtoHref = useMemo(() => {
    if (!rawText || rawText.length >= EMAIL_MAX_CHARS) return "";
    return `mailto:?subject=${encodeURIComponent("Post-quantum evidence brief")}&body=${encodeURIComponent(rawText)}`;
  }, [rawText]);
  const emailAvailable = canExport && mailtoHref !== "";
  const emailTooLong = canExport && rawText.length >= EMAIL_MAX_CHARS;

  const toggleId = (key: IdListKey, id: string) => {
    setSelection((prev) => {
      const list = prev[key];
      return list.includes(id)
        ? { ...prev, [key]: list.filter((item) => item !== id) }
        : { ...prev, [key]: [...list, id] };
    });
  };

  const generatePreview = () => {
    const generatedAt = new Date().toISOString();
    setPreview(buildSnapshot(state, selection, generatedAt));
    setPreviewGeneratedAt(generatedAt);
    setPreviewFingerprint(fingerprintOf(selection, state));
    setStatus(IDLE_STATUS);
  };

  const copyBrief = async () => {
    if (!canExport) return;
    const result = await copyText(raw);
    setStatus(
      result.ok
        ? { kind: "ok", message: `Copied the ${FORMAT_LABELS[format]} brief.` }
        : { kind: "error", message: result.error ?? "The clipboard write failed." },
    );
  };

  const copyPublicLink = async () => {
    const result = await copyText(PUBLIC_LESSON_URL);
    setLinkStatus(
      result.ok
        ? { kind: "ok", message: "Copied the public lesson link." }
        : { kind: "error", message: result.error ?? "The clipboard write failed." },
    );
  };

  const downloadAs = (briefFormat: BriefFormat) => {
    if (!canExport) return;
    const text = briefFormat === "text" ? rawText : briefFormat === "markdown" ? rawMarkdown : rawJson;
    const filename = `harvestattack-briefing.${FORMAT_EXTENSIONS[briefFormat]}`;
    const result = downloadText(filename, text);
    setStatus(
      result.ok
        ? { kind: "ok", message: `Downloaded ${filename}.` }
        : { kind: "error", message: result.error ?? "The download failed." },
    );
  };

  const openPrintView = () => {
    if (!canExport) return;
    window.print();
  };

  return (
    <div className="container px-4 py-8 sm:px-6">
      <header className="max-w-[72ch]">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Briefing</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          A brief you generate from your own selections
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Choose the scenario and records to include, generate the preview, then copy, download, or
          print it. The preview is a document you can hand to someone else. This page is not a scan
          or an assessment of anything.
        </p>
      </header>

      {/* Scope header: the boundary of the whole page, stated before anything else */}
      <div className="mt-6 rounded-lg border border-border bg-white p-4">
        <h2 className="text-sm font-semibold">Scope of this page</h2>
        <p className="mt-1 text-sm leading-relaxed">
          The site inspected nothing: it did not observe any network, scan any system, or verify any
          claim in the preview. Everything below is built from what you enter and select, in this
          browser.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* Selection rail: visible in normal reading, removed from printouts */}
        <aside aria-labelledby="selection-heading" className="print:hidden">
          <div className="rounded-lg border border-border bg-white p-4">
            <h2 id="selection-heading" className="text-sm font-semibold">
              What the brief contains
            </h2>

            <fieldset className="mt-4">
              <legend className="text-sm font-semibold">Lesson scenario</legend>
              <label className="mt-2 flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selection.includeScenario}
                  onChange={() =>
                    setSelection((prev) => ({ ...prev, includeScenario: !prev.includeScenario }))
                  }
                  className="mt-1"
                />
                <span>Include the illustrative lesson scenario, its assumptions, and its limits.</span>
              </label>
            </fieldset>

            <fieldset className="mt-5">
              <legend className="text-sm font-semibold">Confidentiality flows ({state.flows.length})</legend>
              {state.flows.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">None recorded yet.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {state.flows.map((flow) => (
                    <label key={flow.localId} className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selection.flowIds.includes(flow.localId)}
                        onChange={() => toggleId("flowIds", flow.localId)}
                        className="mt-1"
                      />
                      <span>{assetListLabel(flow)}</span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            <fieldset className="mt-5">
              <legend className="text-sm font-semibold">Signing assets ({state.signingAssets.length})</legend>
              {state.signingAssets.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">None recorded yet.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {state.signingAssets.map((asset) => (
                    <label key={asset.localId} className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selection.signingAssetIds.includes(asset.localId)}
                        onChange={() => toggleId("signingAssetIds", asset.localId)}
                        className="mt-1"
                      />
                      <span>{assetListLabel(asset)}</span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            <fieldset className="mt-5">
              <legend className="text-sm font-semibold">Private-PKI reviews ({state.pkiReviews.length})</legend>
              {state.pkiReviews.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">None recorded yet.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {state.pkiReviews.map((review) => (
                    <label key={review.localId} className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selection.pkiReviewIds.includes(review.localId)}
                        onChange={() => toggleId("pkiReviewIds", review.localId)}
                        className="mt-1"
                      />
                      <span>{pkiListLabel(review)}</span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            <fieldset className="mt-5">
              <legend className="text-sm font-semibold">Next actions ({state.actions.length})</legend>
              {state.actions.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">None recorded yet.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {state.actions.map((action) => (
                    <label key={action.localId} className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selection.actionIds.includes(action.localId)}
                        onChange={() => toggleId("actionIds", action.localId)}
                        className="mt-1"
                      />
                      <span>{actionListLabel(action)}</span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            <fieldset className="mt-5">
              <legend className="text-sm font-semibold">Redaction</legend>
              <label className="mt-2 flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selection.redactOwners}
                  onChange={() => setSelection((prev) => ({ ...prev, redactOwners: !prev.redactOwners }))}
                  className="mt-1"
                />
                <span>
                  Redact owners
                  <span className="block text-muted-foreground">
                    Replaces every owner name in the brief with [redacted].
                  </span>
                </span>
              </label>
              <label className="mt-2 flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selection.redactEvidenceNotes}
                  onChange={() =>
                    setSelection((prev) => ({ ...prev, redactEvidenceNotes: !prev.redactEvidenceNotes }))
                  }
                  className="mt-1"
                />
                <span>
                  Redact evidence notes
                  <span className="block text-muted-foreground">
                    Keeps each evidence level and replaces the note text with [redacted].
                  </span>
                </span>
              </label>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Names, notes, and evidence references can be sensitive even when they contain no
                private key. Review the preview before sending it to anyone.
              </p>
            </fieldset>

            <div className="mt-6 border-t border-border pt-4">
              <button type="button" onClick={generatePreview} className={`${PRIMARY_BUTTON} w-full sm:w-auto`}>
                Generate preview
              </button>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                The brief is built in this browser from the selections above. The site never receives
                your entries.
              </p>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          {/* Document preview */}
          <section aria-labelledby="preview-heading">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 id="preview-heading" className="text-xl font-semibold tracking-tight">
                Generated preview
              </h2>
              {preview && (
                <p className="text-xs text-muted-foreground">
                  Content version: {preview.contentVersion} · Generated: {preview.generatedAt}
                </p>
              )}
            </div>

            {stale && (
              <div role="status" className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
                <p className="font-medium">Settings changed. Regenerate the preview.</p>
                {previewGeneratedAt && (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    The text below was generated at {previewGeneratedAt}. Copy and download stay
                    disabled until you press Generate preview again.
                  </p>
                )}
              </div>
            )}

            {!preview ? (
              <div className="mt-3 rounded-lg border border-border bg-white p-6">
                <p className="text-sm leading-relaxed">
                  No preview yet. Choose what the brief contains, then press Generate preview.
                  Nothing is sent anywhere: the brief is built in this browser.
                </p>
                {nothingSelected && (
                  <div className="mt-4 border-t border-border pt-4">
                    <h3 className="text-sm font-semibold">What a generated brief contains</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
                      <li>The scope statement: the site inspected nothing and verified nothing.</li>
                      <li>
                        The illustrative lesson scenario, when included, with its assumptions and
                        model limits.
                      </li>
                      <li>Each selected worksheet entry with its evidence levels, unknowns, and next action.</li>
                      <li>
                        Each selected private-PKI review as an evidence record, not a compliance
                        certificate.
                      </li>
                      <li>Recorded unknowns, limitations, the content version, and the generation time.</li>
                    </ul>
                    <p className="mt-3 text-sm leading-relaxed">
                      To add content, read <Link className={LINK_CLASS} to="/understand">the lesson</Link>{" "}
                      and record assets or reviews in{" "}
                      <Link className={LINK_CLASS} to="/assess">the worksheet</Link>. A brief with
                      only the scope statement and limitations can still be generated, and it is
                      honest about containing nothing else.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-3">
                <div role="group" aria-label="Brief format" className="flex flex-wrap gap-2">
                  {(["text", "markdown", "json"] as BriefFormat[]).map((briefFormat) => (
                    <button
                      key={briefFormat}
                      type="button"
                      aria-pressed={format === briefFormat}
                      onClick={() => setFormat(briefFormat)}
                      className={format === briefFormat ? TAB_ACTIVE : TAB_IDLE}
                    >
                      {FORMAT_LABELS[briefFormat]}
                    </button>
                  ))}
                </div>
                <pre
                  className={`mt-4 max-h-[40rem] overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-white p-4 leading-relaxed sm:p-6 print:max-h-none print:overflow-visible print:border-0 print:p-0 ${
                    format === "json" ? "font-mono text-sm" : "font-sans text-base"
                  }`}
                >
                  {raw}
                </pre>
              </div>
            )}
          </section>

          {/* Export actions */}
          <section
            aria-labelledby="export-heading"
            className="print:hidden mt-6 rounded-lg border border-border bg-white p-4"
          >
            <h2 id="export-heading" className="text-sm font-semibold">
              Export this brief
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button type="button" onClick={copyBrief} disabled={!canExport} className={SECONDARY_BUTTON}>
                Copy to clipboard
              </button>
              <button
                type="button"
                onClick={() => downloadAs("text")}
                disabled={!canExport}
                className={SECONDARY_BUTTON}
              >
                Download as .txt
              </button>
              <button
                type="button"
                onClick={() => downloadAs("markdown")}
                disabled={!canExport}
                className={SECONDARY_BUTTON}
              >
                Download as .md
              </button>
              <button
                type="button"
                onClick={() => downloadAs("json")}
                disabled={!canExport}
                className={SECONDARY_BUTTON}
              >
                Download as .json
              </button>
              <button type="button" onClick={openPrintView} disabled={!canExport} className={SECONDARY_BUTTON}>
                Open print view
              </button>
              {emailAvailable && (
                <a href={mailtoHref} className={`${SECONDARY_BUTTON} inline-flex items-center`}>
                  Open in email client
                </a>
              )}
              {emailTooLong && (
                <span className="text-sm text-muted-foreground">
                  This brief is long for email. Copy or download it instead.
                </span>
              )}
            </div>
            {emailAvailable && (
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Opening your mail app sends this text through your own mail service.
              </p>
            )}
            <p
              aria-live="polite"
              role="status"
              className={`mt-2 text-sm ${status.kind === "error" ? "text-red-700" : "text-muted-foreground"}`}
            >
              {status.message}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              The preview is the document: the printout shows the generated brief without the
              controls on this page.
            </p>
          </section>

          {/* Public link, kept separate from worksheet exports */}
          <section
            aria-labelledby="public-link-heading"
            className="print:hidden mt-6 rounded-lg border border-border bg-white p-4"
          >
            <h2 id="public-link-heading" className="text-sm font-semibold">
              Share the public lesson
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Default share links point to public lessons; no worksheet content ever enters a URL.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded bg-surface-2 px-2 py-1 font-mono text-sm">{PUBLIC_LESSON_URL}</span>
              <button type="button" onClick={copyPublicLink} className={SECONDARY_BUTTON}>
                Copy link
              </button>
            </div>
            <p
              aria-live="polite"
              role="status"
              className={`mt-2 text-sm ${linkStatus.kind === "error" ? "text-red-700" : "text-muted-foreground"}`}
            >
              {linkStatus.message}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
