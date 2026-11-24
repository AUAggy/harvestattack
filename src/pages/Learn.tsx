import { Link } from "react-router-dom";
import { ClaimRef } from "@/components/ClaimRef";

/**
 * Concepts (/learn). A single-column article with a local table of contents.
 * Lead with the protection stack, then forward secrecy and hybrids, then
 * signature verifiers, then an anchored private-PKI primer,
 * and a glossary. Volatile or external statements cite the claim registry
 * inline so the review status is one click away.
 */

interface SectionLink {
  id: string;
  label: string;
}

const SECTIONS: SectionLink[] = [
  { id: "protection-stack", label: "The protection stack" },
  { id: "forward-secrecy", label: "Forward secrecy does not erase recorded copies" },
  { id: "hybrids", label: "Supported hybrids and their conditions" },
  { id: "signatures", label: "Signatures and verifiers" },
  { id: "standards", label: "Standards status" },
  { id: "private-pki", label: "Private CA and PKI primer" },
  { id: "glossary", label: "Glossary" },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-20">
      <h2 id={`${id}-heading`} className="text-2xl font-bold tracking-tight">
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

/** Rows of the protection-stack comparison. Plain teaching examples, no vendor claims. */
const STACK_ROWS: { fn: string; example: string; question: string }[] = [
  {
    fn: "Establish a traffic key",
    example:
      "X25519 key agreement, or a supported hybrid that combines X25519 with ML-KEM.",
    question:
      "What was negotiated on this specific hop, between these two endpoints?",
  },
  {
    fn: "Encrypt application data",
    example: "AES-GCM or another symmetric cipher, and the key-management path around it.",
    question:
      "How is the data key established, wrapped, stored, rotated, and protected?",
  },
  {
    fn: "Authenticate or sign",
    example:
      "RSA, ECDSA, or EdDSA signatures today, with ML-DSA or SLH-DSA as the standardized alternatives.",
    question:
      "Which algorithm and format does the peer or verifier accept, and under what trust policy?",
  },
  {
    fn: "Protect private-key custody",
    example: "Software storage, a hardware security module, or a managed key service.",
    question:
      "Which hardware or software boundary, permissions, and lifecycle apply to the key?",
  },
];

function ProtectionStack() {
  return (
    <div className="max-w-full overflow-x-auto rounded-lg border border-border bg-white">
      <table className="w-full min-w-[42rem] text-left text-sm">
        <caption className="sr-only">
          The four jobs of a protection stack, with a teaching example and the
          evidence question to ask for each.
        </caption>
        <thead className="border-b border-border bg-surface-1">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              Function
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Teaching example
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Evidence question
            </th>
          </tr>
        </thead>
        <tbody>
          {STACK_ROWS.map((row) => (
            <tr key={row.fn} className="border-b border-border last:border-0 align-top">
              <th scope="row" className="px-4 py-3 font-semibold">
                {row.fn}
              </th>
              <td className="px-4 py-3 text-muted-foreground">{row.example}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.question}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The synthetic trust-path figure: a certificate hierarchy beside a separate
 * application connection. Plain HTML boxes so it reads well with a screen
 * reader, followed by a visible text equivalent.
 */
function TrustPathFigure() {
  return (
    <figure className="rounded-lg border border-border bg-white p-4">
      <figcaption className="text-sm font-semibold">
        A synthetic example. Certificate path on the left, one application connection on the right.
      </figcaption>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Certificate path
          </p>
          <ul className="mt-3 space-y-3 text-sm">
            <li className="rounded-md border-l-4 border-primary bg-surface-1 p-3">
              <p className="font-mono text-xs font-semibold">Root CA certificate</p>
              <p className="mt-1 text-muted-foreground">
                Trust anchor. Self-signed: its issuer signature comes from the root's own
                signing key. A relying party accepts it by policy, not by proof.
              </p>
            </li>
            <li className="ml-6 rounded-md border-l-4 border-border bg-white p-3">
              <p className="font-mono text-xs font-semibold">Intermediate CA certificate</p>
              <p className="mt-1 text-muted-foreground">
                Issuer signature made with the root CA signing key. Carries the
                intermediate's own subject public key.
              </p>
            </li>
            <li className="ml-12 rounded-md border-l-4 border-border bg-white p-3">
              <p className="font-mono text-xs font-semibold">Leaf certificate</p>
              <p className="mt-1 text-muted-foreground">
                Issuer signature made with the intermediate CA signing key. Carries the
                service's subject public key.
              </p>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Application connection (separate mechanism)
          </p>
          <ul className="mt-3 space-y-3 text-sm">
            <li className="rounded-md bg-surface-1 p-3">
              <p className="font-semibold">Client, acting as the relying party</p>
              <p className="mt-1 text-muted-foreground">
                Validates the path from the leaf to a trust anchor it accepts, then checks
                the server's handshake signature.
              </p>
            </li>
            <li className="rounded-md border border-dashed border-border bg-white p-3">
              <p className="font-semibold">Negotiated key establishment</p>
              <p className="mt-1 text-muted-foreground">
                For example X25519, or a supported hybrid such as{" "}
                <span className="font-mono text-xs">X25519MLKEM768</span>. This step, not
                the certificate, produces the traffic key.
              </p>
            </li>
            <li className="rounded-md bg-surface-1 p-3">
              <p className="font-semibold">Server</p>
              <p className="mt-1 text-muted-foreground">
                Signs the handshake with the private key matching the leaf subject public
                key, and sends the certificate chain.
              </p>
            </li>
          </ul>
        </div>
      </div>
      <p className="mt-4 rounded-md bg-surface-2 p-3 text-sm leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">Text equivalent.</span> The root CA
        certificate is the trust anchor and signs itself. The root CA signing key signs the
        intermediate CA certificate. The intermediate CA signing key signs the leaf
        certificate, which carries the service's subject public key. In a separate step, the
        client and server negotiate key establishment, and the server signs the handshake
        with the private key matching that subject public key. The client validates the path
        to an anchor it accepts and checks the signature. Path validation and key
        establishment are independent mechanisms.
      </p>
    </figure>
  );
}

interface GlossaryEntry {
  term: string;
  definition: string;
}

const GLOSSARY: GlossaryEntry[] = [
  {
    term: "Post-quantum cryptography (PQC)",
    definition:
      "Algorithms designed so that known quantum attacks do not defeat them. They run on ordinary computers.",
  },
  {
    term: "Cryptographically relevant quantum computer (CRQC)",
    definition:
      "A quantum computer able to run practical attacks against real keys. None is publicly demonstrated against deployed key sizes.",
  },
  {
    term: "Key establishment",
    definition:
      "The process two parties use to arrive at shared secret keying material over an open channel.",
  },
  {
    term: "KEM (key encapsulation mechanism)",
    definition:
      "A construction where one party encapsulates a shared secret to a public key. ML-KEM is the standardized example.",
  },
  {
    term: "Symmetric encryption",
    definition:
      "Shared-key ciphers such as AES that encrypt bulk data. The hard part is getting the shared key to both sides.",
  },
  {
    term: "Hybrid (key establishment)",
    definition:
      "Two independent components combined so the result holds as long as either component holds, such as X25519MLKEM768.",
  },
  {
    term: "Forward secrecy",
    definition:
      "Session keys are ephemeral, so a later compromise of long-term keys does not reveal past session keys. It does not remove recorded public material.",
  },
  {
    term: "Signature",
    definition:
      "A value produced with a private key that verifiers check against the matching public key, binding data to that key.",
  },
  {
    term: "Issuer signature vs subject key",
    definition:
      "The issuer signature is the CA's statement about a certificate. The subject key is the key carried inside it. Different keys, different jobs.",
  },
  {
    term: "Relying party",
    definition:
      "The application or device that decides whether to trust a certificate or signature.",
  },
  {
    term: "Trust anchor",
    definition:
      "A certificate, usually a root, that a relying party accepts without further validation. Path validation starts there.",
  },
  {
    term: "Confidentiality lifetime",
    definition:
      "How long protected data must stay secret. It sets how far ahead the protection question reaches.",
  },
];

/**
 * The Concepts page. One h1, one h2 per section, anchored to the table of
 * contents. No accordions around essential teaching; a details element is
 * used only once, for optional depth.
 */
export default function Learn() {
  return (
    <div className="container px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-[74ch]">
        <header>
          <p className="text-sm font-medium uppercase tracking-wide text-primary">Concepts</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            What protects a connection, piece by piece
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            The lesson shows one scenario moving through time. This page explains the parts
            underneath it: the jobs inside a protection stack, what a hybrid covers and what
            it does not, how signature verification constrains a migration, and how
            certificate trust works in a private PKI. Read it in any order.
          </p>
        </header>

        {/* Local table of contents. Navigation only, so it can hide on small screens. */}
        <nav
          aria-label="On this page"
          className="mt-8 hidden rounded-lg border border-border bg-white p-4 sm:block"
        >
          <p className="text-sm font-semibold">On this page</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-link underline decoration-dotted underline-offset-2 hover:decoration-solid"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-12">
          {/* ------------------------------------------------ 1. Protection stack */}
          <Section id="protection-stack" title="The protection stack">
            <p>
              Almost every secure connection runs four different jobs at once. Each job needs
              its own kind of algorithm. A tool built for one job does not automatically do
              another, and each job fails in its own way.
            </p>
            <ProtectionStack />
            <p>
              The third column is the practical one. For any real hop, asset, or signing
              key, the useful question is not "is it quantum-safe" in the abstract. It is
              what was actually negotiated, what actually encrypts the data, what
              verifiers actually accept, and where the private keys actually live. Those
              are things you can check.
            </p>
            <div className="rounded-lg border border-border bg-surface-1 p-4 text-sm leading-relaxed">
              <p className="font-semibold">Two common mix-ups</p>
              <p className="mt-2">
                An ML-KEM key does not replace AES for encrypting backups. ML-KEM
                establishes keys. AES, or another symmetric cipher, encrypts the data
                itself, and that includes backup contents.
              </p>
              <p className="mt-2">
                Not all API tokens use signatures. An opaque bearer token is a secret
                string the server checks. HMAC authentication uses a shared secret key.
                Public-key signatures are a third construction, with a public and a
                private key. Before planning anything, work out which one a system
                actually uses, because each migrates differently.
              </p>
            </div>
          </Section>

          {/* ------------------------------------------------ 2. Forward secrecy */}
          <Section id="forward-secrecy" title="Forward secrecy does not erase recorded copies">
            <p>
              A typical connection creates a fresh session key for each session and throws
              it away when the session ends. This property is called forward secrecy. It
              is valuable: if a long-term signing key leaks next year, it does not hand
              over the session keys of every past session.
            </p>
            <p>
              Ephemeral is not the same as unrecorded. The handshake carries public
              values, and a listener can record those values together with the encrypted
              traffic. Under the assumed future attack, the attacker works on that
              recorded public material to recover the session key. The key was generated
              ephemerally, but the attack does not care; it runs on whatever was captured.
              This is exactly why the lesson is built around recorded copies.
            </p>
            <p>
              The same reasoning explains why recovering a signing key does not decrypt
              every recorded session. A signing key produces signatures. It does not store
              the session keys of past ephemeral exchanges. Stealing it enables forgery
              and impersonation from that point on, while each recorded session's
              confidentiality still depends on its own recorded key-establishment
              material.
            </p>
            <p>
              A useful framing is{" "}
              <strong className="font-semibold text-foreground">selected sessions</strong>:
              an attack applies to the sessions whose recorded material the attacker
              holds. It is not a single switch that flips every session at once. Which
              sessions those are is an evidence question about storage and collection, not
              an assumption.
            </p>
            <p className="text-sm text-muted-foreground">
              The lesson models this with cohorts of recorded copies on one illustrative
              path.{" "}
              <Link
                to="/understand"
                className="text-link underline decoration-dotted underline-offset-2 hover:decoration-solid"
              >
                Open the lesson
              </Link>{" "}
              to move through it in time.
            </p>
          </Section>

          {/* ------------------------------------------------ 3. Hybrids */}
          <Section id="hybrids" title="Supported hybrids and their conditions">
            <p>
              A hybrid such as TLS{" "}
              <span className="font-mono text-xs">X25519MLKEM768</span> establishes one
              traffic key from two independent components: the classical X25519 exchange
              and an ML-KEM encapsulation. Both contribute to the result. NIST's
              recommendations for key encapsulation cover this kind of combined use{" "}
              <ClaimRef id="sp800-227-kem" label="SP 800-227" />. An attacker who could
              defeat the classical component would still face the second, and the other
              way around.
            </p>
            <p>
              The mechanism is the easy part. Three conditions sit around it. First,
              negotiation: both endpoints must offer and accept the hybrid for a given
              connection. Second, downgrade behavior: the protocol's protections have to
              stop an attacker from forcing a weaker choice. That is one reason to check
              what a connection actually negotiated instead of trusting what a library claims.
              Third, software support: the implementation has to exist in every relevant
              product on the path.
            </p>
            <p>
              For example, OpenSSL 3.5 includes ML-KEM and enables hybrid ML-KEM key
              agreement in TLS by default, while an application still chooses its own TLS
              stack, negotiation, and provider configuration{" "}
              <ClaimRef id="openssl-3-5-mlkem" label="OpenSSL 3.5" />. SSH has an
              equivalent hybrid for key exchange, and host and user authentication there
              remain separate signature operations{" "}
              <ClaimRef id="openssh-hybrid-kex" label="OpenSSH" />.
            </p>
            <div className="rounded-lg border border-border bg-surface-1 p-4 text-sm leading-relaxed">
              <p className="font-semibold">What a hybrid does not do</p>
              <p className="mt-2">
                A hybrid protects key establishment only. It is not a signature algorithm,
                and it does not change how stored data or backups are encrypted. Those are
                separate rows of the stack above, with separate migrations.
              </p>
            </div>
          </Section>

          {/* ------------------------------------------------ 4. Signatures */}
          <Section id="signatures" title="Signatures and verifiers">
            <p>
              Signatures answer a different question from encryption: who is on the other
              end, and can this data be trusted as coming from them. In TLS, the server
              signs parts of the handshake with its private key, and the client verifies
              that signature against the certificate chain. Code signing, document
              signing, and SSH host keys follow the same shape.
            </p>
            <p>
              Migration for signatures is mostly a promise about other people's software.
              The useful questions are: who must verify, meaning which clients, servers,
              and devices; for how long, meaning whether a signature is checked once or
              re-verified for years, as signed firmware or archived logs are; and which
              formats those verifiers accept.
            </p>
            <p>
              Long-lived verifiers set the pace. A device that receives updates slowly
              will keep accepting old formats and rejecting new ones for a long time. A
              new signing key, even a post-quantum one, is not enough if the verifiers
              cannot accept it. A signature must stay verifiable for as long as anyone
              relies on it.
            </p>
            <p>
              The standardized building blocks exist. NIST finalized FIPS 204, which
              specifies ML-DSA, a lattice-based signature scheme{" "}
              <ClaimRef id="fips-204-final" label="FIPS 204" />, and FIPS 205, which
              specifies SLH-DSA, a stateless hash-based scheme with different size
              trade-offs <ClaimRef id="fips-205-final" label="FIPS 205" />. Standards do
              not deploy verifiers. Checking which verifiers exist on your paths is the
              evidence work.
            </p>
          </Section>

          {/* ------------------------------------------------ 5. Standards */}
          <Section id="standards" title="Standards status">
            <p>
              A short factual baseline, because most planning confusion starts here.
            </p>
            <dl className="space-y-4 rounded-lg border border-border bg-white p-4 text-sm leading-relaxed">
              <div>
                <dt className="font-semibold">FIPS 203, 204, and 205: final</dt>
                <dd className="mt-1 text-muted-foreground">
                  NIST finalized these in August 2024. They specify ML-KEM for key
                  establishment <ClaimRef id="fips-203-final" label="FIPS 203" />, ML-DSA
                  for signatures <ClaimRef id="fips-204-final" label="FIPS 204" />, and
                  SLH-DSA for signatures <ClaimRef id="fips-205-final" label="FIPS 205" />.
                </dd>
              </div>
              <div>
                <dt className="font-semibold">HQC: selected, not final</dt>
                <dd className="mt-1 text-muted-foreground">
                  NIST selected HQC in March 2025 as a fifth algorithm for post-quantum
                  encryption, with a draft standard expected later. Selection is not a
                  final FIPS standard, and no product support follows from it{" "}
                  <ClaimRef id="hqc-selected-not-final" label="HQC selection" />.
                </dd>
              </div>
              <div>
                <dt className="font-semibold">SP 800-227: KEM guidance</dt>
                <dd className="mt-1 text-muted-foreground">
                  NIST published recommendations for using key-encapsulation mechanisms,
                  including hybrid use. It is guidance on construction and use, not a
                  deployment instruction <ClaimRef id="sp800-227-kem" label="SP 800-227" />.
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Transition drafts: drafts</dt>
                <dd className="mt-1 text-muted-foreground">
                  NIST IR 8547 is an initial public draft about transitioning between
                  algorithm generations. Drafts are not requirements, and it does not set
                  a deadline for the private sector{" "}
                  <ClaimRef id="ir8547-draft-transition" label="IR 8547" />.
                </dd>
              </div>
            </dl>
            <p>
              Final standards make a migration possible. They do not make it finished.
              Products, protocols, and verifiers still have to adopt and interoperate,
              and that is precisely what the evidence exercises are for.
            </p>
          </Section>

          {/* ------------------------------------------------ 6. Private PKI primer */}
          <Section id="private-pki" title="Private CA and PKI primer">
            <p>
              A private CA issues certificates for your own systems: service-to-service
              TLS, device enrollment, internal APIs. Five ideas keep causing confusion,
              and they are easier to hold onto as five separate things.
            </p>
            <p>
              First, a definition. A{" "}
              <strong className="font-semibold text-foreground">relying party</strong> is
              the application or device that decides whether to trust a certificate or
              signature. In a private PKI that is often your own service or client
              library, not a browser.
            </p>
            <TrustPathFigure />
            <dl className="space-y-4 text-sm leading-relaxed">
              <div className="rounded-lg border border-border bg-white p-4">
                <dt className="font-semibold">(a) The CA signing key and issuer signatures</dt>
                <dd className="mt-1 text-muted-foreground">
                  Each certificate carries an issuer signature made with the parent CA's
                  signing key. Protecting those signing keys, in software, an HSM, or a
                  managed key service, is its own custody question with its own lifecycle.
                </dd>
              </div>
              <div className="rounded-lg border border-border bg-white p-4">
                <dt className="font-semibold">(b) The subject public key inside the certificate</dt>
                <dd className="mt-1 text-muted-foreground">
                  This is the key the certificate holder will use. For a TLS server
                  certificate it is typically a signing key used during the handshake. It
                  is not the CA's key, and it is not the traffic key.
                </dd>
              </div>
              <div className="rounded-lg border border-border bg-white p-4">
                <dt className="font-semibold">(c) The application's authentication signature</dt>
                <dd className="mt-1 text-muted-foreground">
                  During the handshake, the server signs transcript material with the
                  private key matching the leaf subject public key. The peer verifies it.
                  This signature authenticates; it does not establish the traffic key.
                </dd>
              </div>
              <div className="rounded-lg border border-border bg-white p-4">
                <dt className="font-semibold">(d) Negotiated key establishment</dt>
                <dd className="mt-1 text-muted-foreground">
                  The client and server negotiate a key-establishment method, classical or
                  hybrid. This step produces the traffic key and is independent of which
                  signature algorithm authenticated the connection.
                </dd>
              </div>
              <div className="rounded-lg border border-border bg-white p-4">
                <dt className="font-semibold">(e) Trust-anchor acceptance by the relying party</dt>
                <dd className="mt-1 text-muted-foreground">
                  A chain is trusted because a relying party accepts its root. In private
                  PKI, distributing and pinning that root is your own policy decision,
                  made per application and enforced per relying party.
                </dd>
              </div>
            </dl>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Three separate migration choices</h3>
              <p>
                Issuing a certificate with a post-quantum subject key, signing
                certificates with a post-quantum algorithm, and negotiating hybrid key
                establishment are three different choices. Each has its own compatibility
                requirements, its own peers that must accept it, and its own failure
                mode. Doing one does not do the others.
              </p>
              <h3 className="text-lg font-semibold">
                A self-signed root is not a security verdict
              </h3>
              <p>
                Inspecting a root's self-signature tells you almost nothing about the
                path. Whether the hierarchy holds depends on the relying party's policy
                and the path processing it actually performs. Path building and
                validation, including revocation handling, are defined procedures{" "}
                <ClaimRef id="rfc5280-path-validation" label="RFC 5280" />, and status can
                be checked with protocols such as OCSP{" "}
                <ClaimRef id="rfc6960-ocsp" label="OCSP" />. Those specifications predate
                post-quantum algorithms, and their algorithm identifiers are separate,
                still-developing work.
              </p>
              <h3 className="text-lg font-semibold">
                A future signing-key attack is forgery, not retroactive decryption
              </h3>
              <p>
                If signing keys ever fall to a future attack, the consequence is
                forged certificates and impersonation. It is not automatic decryption of
                every past session that used ephemeral key establishment under those
                certificates. Authentication and confidentiality fail differently, and on
                different schedules.
              </p>
              <h3 className="text-lg font-semibold">Key generation is not deployment</h3>
              <p>
                Generating a post-quantum key pair is the first step of a long list:
                supported algorithm identifiers and encodings, certificate profiles,
                issuance and status services, enrollment integrations, and finally
                relying-party acceptance. A key that no verifier or protocol can process
                is a test artifact, not a migration.
              </p>
              <h3 className="text-lg font-semibold">
                Private PKI follows its own trust agreements
              </h3>
              <p>
                Browser root-program rules, public certificate roadmaps, and public-CA
                experiments are not requirements for a private hierarchy. A private PKI is
                governed by its actual trust agreements, policies, and application
                requirements. If any part of your trust context becomes public, that part
                needs its own separate review.
              </p>
              <h3 className="text-lg font-semibold">Custody is a supporting boundary</h3>
              <p>
                Where private keys live is a separate question from every point above.
                Module validation, where it is claimed, attaches to a specific product,
                version, mode, and operating environment{" "}
                <ClaimRef id="cmvp-module-validation" label="CMVP" />. It does not
                certify a deployment or change what a connection negotiates.
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              If this describes systems you run, the worksheet has a structured private-CA
              review, and the actions page includes a certificate lifecycle exercise.{" "}
              <Link
                to="/assess#private-pki"
                className="text-link underline decoration-dotted underline-offset-2 hover:decoration-solid"
              >
                Open the private-CA review
              </Link>{" "}
              or{" "}
              <Link
                to="/act"
                className="text-link underline decoration-dotted underline-offset-2 hover:decoration-solid"
              >
                see the evidence exercises
              </Link>
              .
            </p>
          </Section>

          {/* ------------------------------------------------ 7. Glossary */}
          <Section id="glossary" title="Glossary">
            <p className="text-muted-foreground">
              Short definitions, in the sense this site uses them.
            </p>
            <dl className="space-y-4 rounded-lg border border-border bg-white p-4 text-sm leading-relaxed">
              {GLOSSARY.map((entry) => (
                <div key={entry.term}>
                  <dt className="font-semibold">{entry.term}</dt>
                  <dd className="mt-1 text-muted-foreground">{entry.definition}</dd>
                </div>
              ))}
            </dl>
          </Section>

          {/* ------------------------------------------------ Exit block */}
          <section
            aria-labelledby="concepts-next-heading"
            className="rounded-lg border border-border bg-white p-4"
          >
            <h2 id="concepts-next-heading" className="text-sm font-semibold">
              Where to go next
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Concepts are the background. The worksheet and the exercises are where the
              evidence about your own systems gets collected.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                to="/assess"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Open the worksheet
              </Link>
              <Link
                to="/act"
                className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                Try an evidence exercise
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
