import { Link } from "react-router-dom";
import { deriveScenario } from "@/domain/model";
import { CohortTimeline } from "@/components/lesson/CohortTimeline";
import { ClaimRef } from "@/components/ClaimRef";
import { CRYPTO_PURPOSE_LABELS, type CryptoPurpose } from "@/lib/contracts";
import { DEFAULT_SCENARIO } from "@/state/session";

// The home figure is a static slice of the lesson: default scenario, view month 0.
const figureResult = deriveScenario(DEFAULT_SCENARIO, 0);

const stackRows: { purpose: CryptoPurpose; question: string }[] = [
  {
    purpose: "key-establishment",
    question: "What was actually negotiated on this hop?",
  },
  {
    purpose: "symmetric-encryption",
    question: "Which cipher protected the data itself, and how long must it stay secret?",
  },
  {
    purpose: "signature",
    question: "Who signed this, and what can each verifier actually check today?",
  },
  {
    purpose: "key-custody",
    question: "Where do the private keys live, and who can use or export them?",
  },
];

const steps = [
  {
    title: "Traffic is recorded",
    body: "Someone with access to a network path or a data store can save copies of encrypted traffic. Each copy keeps the protection it had on the day it was made.",
  },
  {
    title: "Migration protects later transmissions",
    body: "Moving a connection to post-quantum key establishment (the step where two sides agree on the key that encrypts it) protects only traffic sent after the move. It cannot reach back and upgrade copies that were already saved.",
  },
  {
    title: "Evidence decides the next action",
    body: "Each system negotiates, signs, and stores different things, and each item must stay secret for a different length of time. The worksheet turns that into a short list of evidence to collect.",
  },
];

const exits = [
  {
    role: "New to the topic",
    label: "Walk through the illustrated lesson",
    to: "/understand",
  },
  {
    role: "I operate systems or services",
    label: "Open the actions",
    to: "/act",
  },
  {
    role: "I own a security program",
    label: "Open the evidence worksheet",
    to: "/assess",
  },
  {
    role: "I administer a private CA or PKI",
    label: "Read the private CA and PKI path",
    to: "/learn#private-pki",
  },
];

/**
 * The landing page. A plain statement of the problem, one static slice of the
 * lesson figure, a three-stage explanation, a protection-stack preview, two
 * sourced worked examples, and role-specific exits. No forecasts, scores, or
 * vendor walls.
 */
export default function Home() {
  return (
    <div className="container px-4 py-10 sm:px-6 sm:py-14">
      {/* Asymmetric editorial opening */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,33rem)] lg:gap-14">
        <header className="max-w-[68ch]">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            Harvest now, decrypt later
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Encrypted traffic can be recorded now and attacked later.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Someone with access to a network path can copy encrypted traffic and store it for
            years. If computers are ever built that can break today's public-key encryption, those
            stored copies could be opened. Post-quantum cryptography is the newer generation of
            encryption, designed to hold up against that kind of computer. This site explains the
            idea with one worked example, then helps you collect evidence about your own systems.
          </p>
          <p className="mt-5 max-w-[52ch] rounded-md bg-surface-2 p-3 text-sm leading-relaxed">
            This tool does not inspect this connection and does not detect interception. It exists
            to explain the scenario.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              to="/understand"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Explore the lesson
            </Link>
            <Link
              to="/assess"
              className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              Open the worksheet
            </Link>
          </div>
        </header>

        {/* Static copied-stream figure. Hidden from assistive tech; the
            sentence below is the plain-text equivalent. */}
        <div className="lg:pt-4">
          <div aria-hidden="true" className="w-full max-w-[33rem]">
            <CohortTimeline scenario={DEFAULT_SCENARIO} result={figureResult} viewMonth={0} />
          </div>
          <p className="mt-2 max-w-[33rem] text-xs leading-relaxed text-muted-foreground">
            One example stream from the lesson, copied every six months, switching from classical to
            hybrid protection at the cutover.
          </p>
        </div>
      </div>

      <div className="mt-14 space-y-14 sm:mt-16 sm:space-y-16">
        {/* Three stages as one continuous explanation */}
        <section aria-labelledby="how-heading" className="max-w-[68ch]">
          <h2 id="how-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            How the problem unfolds
          </h2>
          <ol className="ml-4 mt-6 space-y-8 border-l border-border pl-8">
            {steps.map((step, index) => (
              <li key={step.title} className="relative">
                <span className="absolute -left-[46px] top-0 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-white text-sm font-semibold">
                  {index + 1}
                </span>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1 leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Protection-stack preview */}
        <section aria-labelledby="stack-heading" className="max-w-3xl">
          <h2 id="stack-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            Four jobs, four questions
          </h2>
          <p className="mt-3 max-w-[68ch] leading-relaxed text-muted-foreground">
            A system runs four different cryptographic jobs: agree on a key, encrypt the data, sign
            and verify, and guard private keys. Support for one job never covers another, so each
            needs its own evidence. (A "hop" below is one leg of a connection, such as browser to
            CDN or CDN to server.)
          </p>
          <ul className="mt-6 divide-y divide-border rounded-lg border border-border bg-white">
            {stackRows.map((row) => (
              <li
                key={row.purpose}
                className="grid gap-1 p-4 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4"
              >
                <span className="text-sm font-semibold">
                  {CRYPTO_PURPOSE_LABELS[row.purpose]}
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground">
                  {row.question}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Two sourced worked examples instead of a vendor wall */}
        <section aria-labelledby="examples-heading" className="max-w-3xl">
          <h2 id="examples-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            What a capability does not prove
          </h2>
          <p className="mt-3 max-w-[68ch] leading-relaxed text-muted-foreground">
            Vendor announcements are real evidence, but only about the thing they name. Two
            examples:
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-white p-4">
              <h3 className="text-sm font-semibold">Hybrid key agreement in OpenSSL 3.5</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                OpenSSL 3.5 includes ML-KEM and enables hybrid post-quantum key agreement in TLS
                by default <ClaimRef id="openssl-3-5-mlkem" label="OpenSSL 3.5 release" />. That is
                a capability in a library. It does not tell you what any given service negotiated,
                because applications choose their own TLS stack and configuration.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-white p-4">
              <h3 className="text-sm font-semibold">ML-DSA signing in AWS KMS</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                AWS KMS documents ML-DSA key specifications for signing and verification{" "}
                <ClaimRef id="aws-kms-mldsa-signing" label="AWS KMS ML-DSA documentation" />. That
                is a signing capability for keys held in that service. It is not transport key
                establishment, so it says nothing about the protection negotiated on a connection.
              </p>
            </div>
          </div>
        </section>

        {/* Role-specific exits */}
        <section aria-labelledby="exits-heading" className="max-w-3xl">
          <h2 id="exits-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            Where do you want to start?
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {exits.map((exit) => (
              <li
                key={exit.to}
                className="rounded-lg border border-border bg-white p-4"
              >
                <p className="text-sm text-muted-foreground">{exit.role}</p>
                <Link
                  to={exit.to}
                  className="mt-1 inline-block text-sm font-medium text-link underline-offset-2 hover:underline"
                >
                  {exit.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
