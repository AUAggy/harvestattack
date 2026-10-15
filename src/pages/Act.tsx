/**
 * Actions (/act) per rebuild plan §8.3 and §9.2-9.3. Four exercises with
 * sanitized or synthetic sample data, a copyable vendor question list, and
 * the deployment decision framework. Correct answers produce an explanation
 * and an optional worksheet action; wrong answers are a chance to explain a
 * distinction. Answers stay in this browser, are never scored in aggregate,
 * and never classify the visitor. Nothing on this page runs a command, inspects
 * a connection, or contacts a system.
 */
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ClaimRef } from "@/components/ClaimRef";
import { deriveScenario, known, type ScenarioInputs } from "@/domain/model";
import { copyText } from "@/lib/browser";
import {
  CRYPTO_PURPOSE_LABELS,
  purposesCompatible,
  type CryptoPurpose,
  type WorksheetAction,
} from "@/lib/contracts";
import { nextLocalId, useSession } from "@/state/session";

// ---------------------------------------------------------------------------
// Sample data. Everything here is fictional and labelled as such.
// ---------------------------------------------------------------------------

const NEGOTIATION_ARTIFACT = `Fictional sample data for practice. Not a real connection.

TLS 1.3 handshake summary (fictional):
  negotiated version:       TLS 1.3
  key agreement:            x25519mlkem768 key share
  cipher:                   AES_256_GCM
  certificate signature:    rsa2048_pkcs1_sha256

SSH negotiation (fictional):
  kex:                      mlkem768x25519-sha256
  host key:                 ssh-ed25519`;

const PKI_SCENARIO = `Synthetic scenario for practice. No real CA, product, or organization.

Hierarchy (fictional):
  root CA:            RSA-4096, self-signed trust anchor
  issuing CA:         RSA-4096, signs with SHA-256
  leaf certificate:
    subject key:          ML-DSA-65 (post-quantum)
    issuer signature:     RSA-4096 with SHA-256 (classical)
    issuance result:      success, certificate deployed

Observation (fictional):
  one representative relying party, an older internal client build,
  cannot validate the certificate path`;

const VENDOR_QUESTIONS = `Post-quantum capability questions

1. Purpose: Which cryptographic purpose does this cover: key establishment, signatures, symmetric encryption, or key custody?
2. Product, version, and mode: Exactly which product, version, and configuration mode does the capability apply to?
3. Protocol identifiers: Which protocol identifiers are actually negotiated (for example a TLS named group, an SSH kex name, or a signature algorithm identifier)?
4. Integration requirements: Which SDK, provider, firmware, or library versions are required on each side, including our counterparts?
5. Verifier support: Which clients, counterparties, or verifiers must also support this, and who owns updating them?
6. Validation boundary: If a validation statement is claimed, which exact module, version, mode, and operating environment does it cover?
7. Telemetry: Which log fields show what was actually negotiated (for example tlsDetails.keyExchange), and what does an absent field mean?
8. Downgrade controls: How does negotiation fall back, what is logged on a fallback, and how can we tell a fallback from a success?
9. Support lifecycle: How long is the capability supported, and how are changes or deprecations announced?
10. Documented limitations: Which constraints, exclusions, and known interoperability gaps are documented?`;

/** The lesson's fixture-style inputs (plan 9.2, item 3). Never re-derived here. */
const MIGRATION_INPUTS: ScenarioInputs = {
  migrationStartMonth: 0,
  migrationDurationMonths: 24,
  confidentialityLifetimeMonths: known(120),
  attackAssumption: { kind: "assumed", month: 60 },
  assumeCapture: true,
  includeHistoricalCohorts: false,
  horizonMonths: 240,
};

// ---------------------------------------------------------------------------
// Shared exercise pieces
// ---------------------------------------------------------------------------

function ArtifactBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="mt-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <pre
        aria-label={label}
        className="mt-2 select-text overflow-x-auto rounded-md bg-surface-2 p-3 font-mono text-xs leading-relaxed"
      >
        {text}
      </pre>
    </div>
  );
}

interface QuestionOption {
  id: string;
  text: string;
}

interface ExerciseQuestionProps {
  checkId: string;
  prompt: string;
  options: QuestionOption[];
  correctId: string;
  correctNote: ReactNode;
  wrongNote: ReactNode;
  /** Set on questions whose correct answer produces a worksheet action. */
  actionText?: string;
}

/**
 * One optional multiple-choice question. The answer is stored in the local
 * session (never sent anywhere), feedback is announced politely, and a correct
 * answer may offer a worksheet action. No aggregate score exists anywhere.
 */
function ExerciseQuestion({
  checkId,
  prompt,
  options,
  correctId,
  correctNote,
  wrongNote,
  actionText,
}: ExerciseQuestionProps) {
  const { state, dispatch } = useSession();
  const answer = state.comprehension[checkId] ?? null;
  const [added, setAdded] = useState(false);
  const isCorrect = answer === correctId;

  const addAction = () => {
    if (!actionText || added) return;
    const action: WorksheetAction = { localId: nextLocalId("action"), text: actionText };
    dispatch({ type: "add-action", action });
    setAdded(true);
  };

  return (
    <fieldset className="mt-5">
      <legend className="text-sm font-medium">{prompt}</legend>
      <div className="mt-2 space-y-2 text-sm">
        {options.map((option) => (
          <label key={option.id} className="flex items-start gap-2">
            <input
              type="radio"
              name={checkId}
              checked={answer === option.id}
              onChange={() => dispatch({ type: "answer-check", checkId, answer: option.id })}
              className="mt-1"
            />
            <span>{option.text}</span>
          </label>
        ))}
      </div>
      {answer && (
        <div aria-live="polite">
          <p className="mt-3 rounded-md bg-surface-2 p-3 text-sm leading-relaxed">
            <strong className="font-semibold">{isCorrect ? "Right." : "Not quite."}</strong>{" "}
            {isCorrect ? correctNote : wrongNote}
          </p>
        </div>
      )}
      {answer && isCorrect && actionText && (
        <button
          type="button"
          onClick={addAction}
          disabled={added}
          className="mt-2 rounded-md border border-border bg-white px-3 py-2 text-sm font-medium hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {added ? "Action added to the worksheet" : "Add as action"}
        </button>
      )}
    </fieldset>
  );
}

function PrivacyNote() {
  return (
    <p className="mt-4 text-xs text-muted-foreground">
      Optional and local. Answers are never scored in aggregate and never classify you or your
      organization. A wrong answer is only a chance to explain a distinction.
    </p>
  );
}

/** Honest purpose check, derived from the worksheet contracts rather than prose. */
function PurposeFit({ purpose }: { purpose: CryptoPurpose }) {
  const fits = purposesCompatible("key-establishment", purpose);
  return (
    <p className="mt-3 text-xs text-muted-foreground">
      If the requirement is {CRYPTO_PURPOSE_LABELS["key-establishment"].toLowerCase()}:{" "}
      {fits
        ? "this capability addresses that purpose."
        : "this capability does not address that purpose."}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Act() {
  // The migration exercise derives its answer from the same model as the
  // lesson, so the exercise can never disagree with the teaching.
  const migrationResult = useMemo(() => deriveScenario(MIGRATION_INPUTS, 0), []);
  const overlapMonths = migrationResult.cohorts
    .filter((c) => c.preArrivalOverlap === "yes")
    .map((c) => c.cohort.transmittedMonth);
  const overlapList = overlapMonths.map((m) => `month ${m}`).join(", ");
  const migrationCorrectId = String(migrationResult.overlapCount);

  const migrationOptions: QuestionOption[] = [
    { id: "0", text: "None. Once the cutover completes, every recorded copy is protected." },
    { id: "2", text: "2. Only the cohorts transmitted closest to the cutover." },
    {
      id: migrationCorrectId,
      text: `${migrationCorrectId}. The classical cohorts whose confidentiality windows reach past month 60.`,
    },
    { id: "all", text: "All cohorts transmitted before month 60, including the hybrid ones." },
  ];

  const migrationCorrectNote = `The overlapping cohorts are transmitted at ${overlapList}. Each was recorded with classical protection before the month 24 cutover, and each has a 120 month confidentiality window that reaches past month 60. The cutover changed transmissions from month 24 onward only; it did not rewrite the copies already recorded.`;

  const migrationWrongNote = `Not quite. Migration changes the protection of transmissions from the cutover onward. It never erases or upgrades the copies an attacker already holds: in the attacker's copy, the cohorts at ${overlapList} keep the classical protection they were recorded with, and under these assumptions they are still inside their confidentiality windows at month 60.`;

  const [copyMessage, setCopyMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const handleCopy = async () => {
    const result = await copyText(VENDOR_QUESTIONS);
    setCopyMessage(
      result.ok
        ? { ok: true, text: "Copied. The question list is on your clipboard." }
        : { ok: false, text: result.error ?? "The copy failed." },
    );
  };

  return (
    <div className="container px-4 py-8 sm:px-6">
      <header className="max-w-[72ch]">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Actions</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Exercises and next steps</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Four short exercises, a copyable vendor question list, and a deployment decision
          framework. Every artifact on this page is sanitized or synthetic sample data: nothing
          here inspects your connection or your systems, and no command is run for you. Answers
          are optional, stay in your browser, and are never scored or used to classify you.
          Actions you add are collected in the worksheet.
        </p>
      </header>

      <nav aria-label="On this page" className="mt-6 max-w-[72ch] rounded-lg border border-border bg-white p-4">
        <h2 className="text-sm font-semibold">On this page</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          <li>
            <a className="text-link underline underline-offset-2" href="#exercise-negotiation">
              Verify a connection
            </a>
          </li>
          <li>
            <a className="text-link underline underline-offset-2" href="#exercise-aws">
              Ask a vendor: capability versus use
            </a>
          </li>
          <li>
            <a className="text-link underline underline-offset-2" href="#exercise-migration">
              Plan a pilot: migration timing
            </a>
          </li>
          <li>
            <a className="text-link underline underline-offset-2" href="#exercise-pki">
              Inventory a verifier
            </a>
          </li>
          <li>
            <a className="text-link underline underline-offset-2" href="#vendor-questions">
              Prepare a request
            </a>
          </li>
          <li>
            <a className="text-link underline underline-offset-2" href="#decision-framework">
              Deployment decision framework
            </a>
          </li>
        </ol>
      </nav>

      <div className="mt-8 max-w-[74ch] space-y-8">
        {/* -------------------------------------------------------------- */}
        {/* 1. Negotiation exercise */}
        {/* -------------------------------------------------------------- */}
        <section
          id="exercise-negotiation"
          aria-labelledby="exercise-negotiation-heading"
          className="rounded-lg border border-border bg-white p-6"
        >
          <h2 id="exercise-negotiation-heading" className="text-xl font-semibold tracking-tight">
            Verify a connection
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Negotiation evidence answers one question per hop: what did this connection actually
            agree on? Read the two fictional lines below, then answer. On a real connection, the
            same fields are what to look for: the negotiated key agreement identifier, the cipher,
            and the certificate or host key signature algorithm. Observation tools belong to your
            platform, in versions you control, against systems you are authorized to test.
          </p>

          <ArtifactBlock label="Sample negotiation lines (fictional)" text={NEGOTIATION_ARTIFACT} />

          <div className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
            <p>
              Two sources behind the sample fields: OpenSSL 3.5 includes ML-KEM and enables hybrid
              ML-KEM key agreement in TLS by default, while applications still choose their own TLS
              stack and configuration, so confirming use means observing the connection
              <ClaimRef id="openssl-3-5-mlkem" label=" (OpenSSL 3.5)" />. OpenSSH documents the
              hybrid <span className="font-mono text-xs">mlkem768x25519-sha256</span> key exchange;
              which methods a specific server enables, and what it negotiates, require local
              observation
              <ClaimRef id="openssh-hybrid-kex" label=" (OpenSSH)" />.
            </p>
            <p>
              Vendor policies can be product-scoped: AWS Transfer Family, for example, documents
              post-quantum SSH security policies for its own SFTP endpoints only
              <ClaimRef id="aws-transfer-pq-ssh" label=" (AWS Transfer Family)" />. That is a
              statement about those endpoints, not about SSH elsewhere.
            </p>
          </div>

          <ExerciseQuestion
            checkId="act-neg-keyagree"
            prompt="Which field establishes key agreement?"
            options={[
              { id: "version", text: "TLS 1.3, the negotiated protocol version." },
              { id: "cipher", text: "AES_256_GCM, the negotiated cipher." },
              {
                id: "keyshare",
                text: "The x25519mlkem768 key share (TLS) and the mlkem768x25519-sha256 kex (SSH).",
              },
            ]}
            correctId="keyshare"
            correctNote={
              <>
                Key agreement is the{" "}
                <span className="font-mono text-xs">x25519mlkem768</span> key share in the TLS line
                and <span className="font-mono text-xs">mlkem768x25519-sha256</span> in the SSH
                line. Both are hybrids: a classical algorithm (X25519) combined with ML-KEM, the
                standardized post-quantum key-encapsulation mechanism
                <ClaimRef id="fips-203-final" label=" (FIPS 203)" />.
              </>
            }
            wrongNote={
              <>
                TLS 1.3 is a protocol version and AES_256_GCM is symmetric encryption of the
                traffic. Neither is key agreement, and neither is by itself evidence that a
                connection used a post-quantum key exchange. Look for the negotiated key agreement
                identifier instead.
              </>
            }
            actionText="Record the negotiated key agreement identifier for one real connection hop you are authorized to observe."
          />

          <ExerciseQuestion
            checkId="act-neg-auth"
            prompt="Which field authenticates the peer?"
            options={[
              { id: "keyshare", text: "The key share, because both sides contributed to it." },
              {
                id: "signature",
                text: "The rsa2048_pkcs1_sha256 certificate signature (TLS) and the ssh-ed25519 host key (SSH).",
              },
              { id: "cipher", text: "AES_256_GCM, because only the real server holds the traffic keys." },
            ]}
            correctId="signature"
            correctNote={
              <>
                These fields are signatures on the peer's identity: the TLS certificate signature
                (here <span className="font-mono text-xs">rsa2048_pkcs1_sha256</span>, a classical
                RSA signature) and the SSH host key (
                <span className="font-mono text-xs">ssh-ed25519</span>, also classical).
                Authentication and key agreement are separate questions: a post-quantum key share
                does not make the peer signature post-quantum, and a certificate or host key never
                establishes the key agreement itself.
              </>
            }
            wrongNote={
              <>
                Key agreement produces a shared secret; it does not prove who is on the other end.
                Authentication comes from a signature the peer makes over the connection: the
                certificate signature in TLS, the host key signature in SSH. Traffic keys are held
                by both sides, so holding them proves nothing about identity.
              </>
            }
            actionText="Record which signature authenticates the peer on the same hop, and whether it is classical or post-quantum."
          />

          <ExerciseQuestion
            checkId="act-neg-hops"
            prompt="What remains unknown about a second hop, such as browser to CDN versus CDN to origin?"
            options={[
              {
                id: "nothing",
                text: "Nothing. A hybrid on the browser-to-CDN hop proves the whole path is hybrid.",
              },
              {
                id: "second-hop",
                text: "Whether the CDN-to-origin hop negotiated hybrid key agreement. These two lines say nothing about that hop.",
              },
              {
                id: "version-only",
                text: "Only the second hop's protocol version, which the browser forces to match the first hop.",
              },
            ]}
            correctId="second-hop"
            correctNote={
              <>
                Each hop is a separate TLS or SSH negotiation between different endpoints. Many
                deployments terminate TLS at the CDN, so a browser-to-CDN result does not describe
                CDN-to-origin at all. Observe each hop on its own and record the evidence per hop.
              </>
            }
            wrongNote={
              <>
                Every hop negotiates independently with its own endpoints and configuration.
                Evidence from one connection never describes another hop, and clients do not force
                matching parameters across hops. This is exactly why negotiation evidence is
                recorded per hop in the worksheet.
              </>
            }
            actionText="Record negotiation evidence for every hop separately, including the second hop behind the CDN."
          />

          <PrivacyNote />
        </section>

        {/* -------------------------------------------------------------- */}
        {/* 2. AWS capability versus use */}
        {/* -------------------------------------------------------------- */}
        <section
          id="exercise-aws"
          aria-labelledby="exercise-aws-heading"
          className="rounded-lg border border-border bg-white p-6"
        >
          <h2 id="exercise-aws-heading" className="text-xl font-semibold tracking-tight">
            Ask a vendor: capability versus use
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Two documented AWS capabilities, compared. Both are real vendor capability statements;
            neither describes your application traffic until you observe it.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold">KMS: post-quantum TLS to KMS endpoints</h3>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                {CRYPTO_PURPOSE_LABELS["key-establishment"]}
              </p>
              <p className="mt-2 text-sm leading-relaxed">
                AWS KMS documents post-quantum TLS for calls to KMS endpoints and a{" "}
                <span className="font-mono text-xs">tlsDetails</span> field in some logs. Where{" "}
                <span className="font-mono text-xs">tlsDetails.keyExchange</span> is missing from a
                log record, the negotiated key agreement is unknown from that record. Missing means
                unknown, never classical
                <ClaimRef id="aws-kms-pq-tls-telemetry" label=" (AWS KMS PQ TLS)" />.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Scope: transport to KMS endpoints. It does not describe your own application
                traffic or stored encryption.
              </p>
              <PurposeFit purpose="key-establishment" />
            </div>

            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold">CloudHSM: ML-DSA key generation</h3>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                {CRYPTO_PURPOSE_LABELS["key-custody"]}
              </p>
              <p className="mt-2 text-sm leading-relaxed">
                AWS CloudHSM documents generating ML-DSA key pairs with the CloudHSM CLI, with SDK,
                cluster hardware, FIPS mode, and provider constraints recorded in its release
                documentation. An HSM protects key custody; it does not change what a connection
                negotiates
                <ClaimRef id="aws-cloudhsm-mldsa" label=" (CloudHSM ML-DSA)" />.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                For the algorithm itself: AWS KMS documents ML-DSA key specs for signing and
                verification, a signing capability rather than transport key establishment
                <ClaimRef id="aws-kms-mldsa-signing" label=" (KMS ML-DSA key specs)" />.
              </p>
              <PurposeFit purpose="key-custody" />
            </div>
          </div>

          <p className="mt-4 rounded-md bg-surface-2 p-3 text-sm leading-relaxed">
            <strong className="font-semibold">The teaching point.</strong> Documented support,
            local configuration, and observed use are three different levels of evidence: a vendor
            page documents a capability, your own configuration shows it is set up, and only
            observation of a real connection or verification shows it was used. The worksheet
            records which level you actually have.
          </p>

          <ExerciseQuestion
            checkId="act-aws-purpose"
            prompt="A team enables CloudHSM ML-DSA signing. What does that tell them about their application traffic's key agreement?"
            options={[
              {
                id: "traffic-pq",
                text: "Their application traffic now uses post-quantum key agreement.",
              },
              {
                id: "nothing",
                text: "Nothing about key agreement. Signing and key establishment are different purposes.",
              },
              {
                id: "recorded-safe",
                text: "Their recorded traffic can no longer be attacked later.",
              },
            ]}
            correctId="nothing"
            correctNote={
              <>
                Purposes differ. ML-DSA is a lattice-based digital signature scheme
                <ClaimRef id="fips-204-final" label=" (FIPS 204)" />. A capability for one purpose
                never satisfies a requirement for another, so signing and key custody evidence says
                nothing about what a connection negotiates. To learn key agreement, look at
                negotiated key agreement evidence such as{" "}
                <span className="font-mono text-xs">tlsDetails.keyExchange</span> or a local
                observation.
              </>
            }
            wrongNote={
              <>
                Signing and key establishment are different purposes, and the worksheet treats them
                as non-interchangeable. Enabling ML-DSA signing does not change what application
                traffic negotiates for key agreement, and it does not change the protection of
                traffic that was already recorded. Key agreement evidence has to come from key
                agreement: negotiated identifiers, telemetry, or observation.
              </>
            }
            actionText="Record each capability you plan to rely on at its evidence level: documented, configured, or observed."
          />

          <PrivacyNote />
        </section>

        {/* -------------------------------------------------------------- */}
        {/* 3. Migration timing exercise */}
        {/* -------------------------------------------------------------- */}
        <section
          id="exercise-migration"
          aria-labelledby="exercise-migration-heading"
          className="rounded-lg border border-border bg-white p-6"
        >
          <h2 id="exercise-migration-heading" className="text-xl font-semibold tracking-tight">
            Plan a pilot: migration timing
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            This is the lesson's illustrative model, with the same fixed example: migration starts
            at month 0 and cuts over after 24 months, cohorts are marked every 6 months, each
            cohort has a 120 month confidentiality lifetime, and a hypothetical attack capability
            is assumed at month 60. Capture is assumed. Cohorts are illustrative items, not
            measured traffic, and the capability month is an assumption, never a forecast.
          </p>

          <ExerciseQuestion
            checkId="act-migration-count"
            prompt="Under these assumptions, how many recorded cohorts still fall in the overlap at month 60: transmitted before the capability arrives, classical in the attacker's copy, and still inside their confidentiality window?"
            options={migrationOptions}
            correctId={migrationCorrectId}
            correctNote={migrationCorrectNote}
            wrongNote={migrationWrongNote}
            actionText="Record the confidentiality lifetime and its basis for the flow you plan to migrate; the overlap depends on it."
          />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              to="/understand"
              className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              Open the lesson
            </Link>
            <p className="text-xs text-muted-foreground">
              The answer comes from the same model as the lesson timeline, so this exercise cannot
              disagree with it.
            </p>
          </div>

          <PrivacyNote />
        </section>

        {/* -------------------------------------------------------------- */}
        {/* 4. Private-PKI exercise */}
        {/* -------------------------------------------------------------- */}
        <section
          id="exercise-pki"
          aria-labelledby="exercise-pki-heading"
          className="rounded-lg border border-border bg-white p-6"
        >
          <h2 id="exercise-pki-heading" className="text-xl font-semibold tracking-tight">
            Inventory a verifier
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            A synthetic certificate lifecycle. The leaf uses an ML-DSA subject key, specified by
            FIPS 204<ClaimRef id="fips-204-final" label=" (FIPS 204)" />, while the issuer
            signature stays classical. Issuance and acceptance are different events, and the
            scenario separates them.
          </p>

          <ArtifactBlock label="Synthetic scenario" text={PKI_SCENARIO} />

          <ExerciseQuestion
            checkId="act-pki-acceptance"
            prompt="Does successful issuance prove that the rejecting relying party will accept the path?"
            options={[
              {
                id: "yes",
                text: "Yes. Issuance succeeded, so the path validates everywhere.",
              },
              {
                id: "no",
                text: "No. Acceptance is decided by each relying party when it parses and validates the path.",
              },
              {
                id: "depends",
                text: "It depends entirely on the subject key algorithm.",
              },
            ]}
            correctId="no"
            correctNote={
              <>
                The CA builds and signs the certificate; each relying party then parses it, builds
                a path to a trust anchor, checks constraints and status, and applies its own policy
                and algorithm support. RFC 5280 defines those path rules
                <ClaimRef id="rfc5280-path-validation" label=" (RFC 5280)" />, and the rejecting
                client shows they can disagree with a successful issuance.
              </>
            }
            wrongNote={
              <>
                Issuance and acceptance are different events. The CA builds and signs the
                certificate; each relying party separately parses it, builds the path, checks
                constraints and status, and applies its own policy and algorithm support. The
                rejecting client is direct evidence that acceptance is not guaranteed by issuance.
              </>
            }
          />

          <ExerciseQuestion
            checkId="act-pki-keyagree"
            prompt="Does the post-quantum subject key protect the TLS key agreement on this connection?"
            options={[
              {
                id: "yes",
                text: "Yes. A post-quantum subject key protects the connection.",
              },
              {
                id: "no",
                text: "No. Key establishment is negotiated separately from certificate signatures.",
              },
              {
                id: "issuer-only",
                text: "Only if the issuer signature is also post-quantum.",
              },
            ]}
            correctId="no"
            correctNote={
              <>
                These are two separate choices. The certificate binds a subject key for signatures;
                what the connection negotiated for key agreement is a different question, answered
                by the negotiated key exchange. A post-quantum subject key does not select or
                upgrade the connection's key agreement, and a classical issuer signature does not
                by itself downgrade it.
              </>
            }
            wrongNote={
              <>
                The certificate and the connection are separate questions. In a modern TLS
                handshake, key agreement uses separately negotiated key shares, while certificate
                keys sign. Neither the subject key algorithm nor the issuer signature algorithm
                decides what key agreement the connection used.
              </>
            }
          />

          <ExerciseQuestion
            checkId="act-pki-nexttest"
            prompt="What is the next isolated test?"
            options={[
              {
                id: "reissue",
                text: "Reissue the certificate with a classical subject key and try again.",
              },
              {
                id: "path-validation",
                text: "Run path validation for this certificate on the rejecting relying party and record where it fails.",
              },
              {
                id: "migrate-all",
                text: "Migrate the whole trust store to new roots at once.",
              },
            ]}
            correctId="path-validation"
            correctNote={
              <>
                One component, one operation. Path validation on the failing client shows whether
                the failure is algorithm support, path building, status checking, trust
                distribution, or policy, and the result becomes recorded evidence that a targeted
                fix can use.
              </>
            }
            wrongNote={
              <>
                Changing two things at once, such as the algorithm and the trust store, hides which
                change mattered. Isolate the failing operation on the failing component first, then
                change one variable at a time and record what each change did.
              </>
            }
            actionText="Run a path validation test on the rejecting relying party and record where the path fails."
          />

          <ExerciseQuestion
            checkId="act-pki-module"
            prompt="The team confirms the algorithm is standardized and the CA host runs in FIPS mode. What do you know about the actual cryptographic module boundary in use?"
            options={[
              {
                id: "validated",
                text: "The module is validated: a final standard plus FIPS mode prove validation.",
              },
              {
                id: "unknown",
                text: "Unknown. Algorithm standardization and a FIPS mode setting do not identify the module boundary.",
              },
              {
                id: "not-applicable",
                text: "Module boundaries do not apply to private PKI.",
              },
            ]}
            correctId="unknown"
            correctNote={
              <>
                Validation attaches to a specific product, version, mode, and operating
                environment, and an algorithm record is not interchangeable with a module
                validation record
                <ClaimRef id="cmvp-module-validation" label=" (CMVP)" />. Until someone records the
                actual module, version, mode, and environment, unknown is the accurate answer.
              </>
            }
            wrongNote={
              <>
                A standardized algorithm and a FIPS mode setting do not identify which cryptographic
                module performed which operation, on what version, in what mode and environment.
                Validation attaches to that specific boundary, so the accurate answer is unknown
                until the boundary is recorded.
              </>
            }
            actionText="Record the module boundary in use: product, version, mode, and operating environment."
          />

          <p className="mt-4 text-xs text-muted-foreground">
            This scenario is synthetic and generic. No CA product is named, and nothing here
            declares any product or deployment compliant.
          </p>
          <PrivacyNote />
        </section>

        {/* -------------------------------------------------------------- */}
        {/* 5. Vendor questions */}
        {/* -------------------------------------------------------------- */}
        <section
          id="vendor-questions"
          aria-labelledby="vendor-questions-heading"
          className="rounded-lg border border-border bg-white p-6"
        >
          <h2 id="vendor-questions-heading" className="text-xl font-semibold tracking-tight">
            Prepare a request: questions for a vendor
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            A plain question list you can send as-is. Each question asks for a fact a vendor can
            answer precisely, and each answer maps to a worksheet evidence record.
          </p>

          <pre
            aria-label="Vendor question list, selectable text"
            className="mt-4 select-text whitespace-pre-wrap rounded-md bg-surface-2 p-4 font-sans text-sm leading-relaxed"
          >
            {VENDOR_QUESTIONS}
          </pre>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Copy the questions
            </button>
            {copyMessage && (
              <p
                aria-live="polite"
                className={`text-sm ${copyMessage.ok ? "text-muted-foreground" : "text-destructive"}`}
              >
                {copyMessage.text}
              </p>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            The text above stays selectable, so you can copy it manually if the clipboard is
            unavailable.
          </p>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* 6. Decision framework */}
        {/* -------------------------------------------------------------- */}
        <section
          id="decision-framework"
          aria-labelledby="decision-framework-heading"
          className="rounded-lg border border-border bg-white p-6"
        >
          <h2 id="decision-framework-heading" className="text-xl font-semibold tracking-tight">
            Deployment decision framework
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Eight steps that separate confidentiality deployment from signing and verifier
            planning. Neither is promised to be quick, and no step is universal.
          </p>

          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
            <li>Define one flow, signing asset, or scoped private PKI use case, and name its owner.</li>
            <li>
              Identify its purpose, its lifetime where relevant, the hops or verifiers involved,
              applicable requirements, third parties, and which evidence is still missing.
            </li>
            <li>
              Confirm documented support and constraints in the exact client, server, runtime, and
              provider combination you run.
            </li>
            <li>Test the supported protocol or signature format in an isolated, representative environment.</li>
            <li>
              Observe negotiation, interoperability, performance, downgrade and fallback behavior,
              and verifier acceptance.
            </li>
            <li>
              Define the pilot scope, coverage target, success criteria, stop and rollback
              conditions, and who owns the rollback decision.
            </li>
            <li>
              Deploy in stages that fit your environment, keep the compatibility evidence you
              gathered, and review what remains uncovered.
            </li>
            <li>Keep observing the supported use in production, and maintain a review and change process.</li>
          </ol>

          <div className="mt-4 rounded-md bg-surface-2 p-3 text-sm leading-relaxed">
            <p>
              <strong className="font-semibold">One honest note on rollback.</strong> Rolling back
              to classical-only operation changes confidentiality exposure. It can be necessary for
              availability under an approved policy, and it should be recorded as a decision with
              an owner and a follow-up. A rollback is not a security-neutral success, and it should
              never be treated as an invisible step.
            </p>
            <p className="mt-2">
              No universal rollout percentage appears here because none would be honest: stages and
              coverage depend on your environment, your verifiers, and your stop conditions.
            </p>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* Exit */}
        {/* -------------------------------------------------------------- */}
        <section aria-labelledby="act-exit-heading" className="rounded-lg border border-border bg-white p-6">
          <h2 id="act-exit-heading" className="text-lg font-semibold">
            Take this to the worksheet
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Actions you added on this page are waiting in the worksheet's action list, next to your
            flows, signing assets, and PKI reviews. The worksheet is where sanitized evidence about
            your own systems belongs.
          </p>
          <Link
            to="/assess"
            className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Record this in the worksheet
          </Link>
        </section>
      </div>
    </div>
  );
}
