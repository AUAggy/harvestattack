/**
 * Maintained primary-source registry. Sources are review inputs: a link here
 * is not a claim that a page was re-read today; each claim carries its own
 * checked date. See the rebuild plan §7.3 and §7.5.
 */

export type SourceType =
  | "standard"
  | "vendor-capability"
  | "announcement"
  | "policy"
  | "specification";

export interface Source {
  id: string;
  publisher: string;
  title: string;
  url: string;
  /** Section, page, or anchor the claim relies on. */
  reference: string;
  /** Publication or version date where available, ISO format. */
  versionDate?: string;
  /** Date the source was last opened and checked by a maintainer. */
  checkedDate: string;
  /** Any access limitation, e.g. a blocked document. */
  accessLimitation?: string;
}

export const sources: Record<string, Source> = {
  "fips-203": {
    id: "fips-203",
    publisher: "NIST",
    title: "FIPS 203: Module-Lattice-Based Key-Encapsulation Mechanism Standard (ML-KEM)",
    url: "https://csrc.nist.gov/pubs/fips/203/final",
    reference: "Final publication, August 2024",
    versionDate: "2024-08-13",
    checkedDate: "2026-10-15",
  },
  "fips-204": {
    id: "fips-204",
    publisher: "NIST",
    title: "FIPS 204: Module-Lattice-Based Digital Signature Standard (ML-DSA)",
    url: "https://csrc.nist.gov/pubs/fips/204/final",
    reference: "Final publication, August 2024",
    versionDate: "2024-08-13",
    checkedDate: "2026-10-15",
  },
  "fips-205": {
    id: "fips-205",
    publisher: "NIST",
    title: "FIPS 205: Stateless Hash-Based Digital Signature Standard (SLH-DSA)",
    url: "https://csrc.nist.gov/pubs/fips/205/final",
    reference: "Final publication, August 2024",
    versionDate: "2024-08-13",
    checkedDate: "2026-10-15",
  },
  "sp-800-227": {
    id: "sp-800-227",
    publisher: "NIST",
    title: "SP 800-227: Recommendations for Key-Encapsulation Mechanisms",
    url: "https://csrc.nist.gov/pubs/sp/800/227/final",
    reference: "Final publication",
    checkedDate: "2026-10-15",
  },
  "nist-pqc-faq": {
    id: "nist-pqc-faq",
    publisher: "NIST",
    title: "Post-Quantum Cryptography FAQs",
    url: "https://csrc.nist.gov/projects/post-quantum-cryptography/faqs",
    reference: "FAQ entries on symmetric cryptography and migration",
    checkedDate: "2026-10-15",
  },
  "hqc-selection": {
    id: "hqc-selection",
    publisher: "NIST",
    title: "NIST Selects HQC as Fifth Algorithm for Post-Quantum Encryption",
    url: "https://www.nist.gov/news-events/news/2025/03/nist-selects-hqc-fifth-algorithm-post-quantum-encryption",
    reference: "Selection announcement, March 2025",
    versionDate: "2025-03-11",
    checkedDate: "2026-10-15",
  },
  "openssl-3-5": {
    id: "openssl-3-5",
    publisher: "OpenSSL",
    title: "OpenSSL 3.5 release announcement",
    url: "https://openssl-library.org/post/2025-04-08-openssl-35-final-release/",
    reference: "Release notes: ML-KEM enabled by default in TLS",
    versionDate: "2025-04-08",
    checkedDate: "2026-10-15",
  },
  "openssh-pq": {
    id: "openssh-pq",
    publisher: "OpenSSH",
    title: "OpenSSH: Post-quantum cryptography",
    url: "https://www.openssh.com/pq.html",
    reference: "Maintained post-quantum explanation and hybrid kex names",
    checkedDate: "2026-10-15",
  },
  "aws-kms-mldsa": {
    id: "aws-kms-mldsa",
    publisher: "AWS",
    title: "AWS KMS Developer Guide: ML-DSA key specs",
    url: "https://docs.aws.amazon.com/kms/latest/developerguide/symm-asymm-choose-key-spec.html#key-spec-mldsa",
    reference: "Key spec table, ML-DSA entries",
    checkedDate: "2026-10-15",
  },
  "aws-kms-pq-tls": {
    id: "aws-kms-pq-tls",
    publisher: "AWS",
    title: "AWS KMS Developer Guide: Post-quantum TLS and tlsDetails telemetry",
    url: "https://docs.aws.amazon.com/kms/latest/developerguide/pqtls.html",
    reference: "PQ TLS section, including tlsDetails fields",
    checkedDate: "2026-10-15",
  },
  "aws-cloudhsm-mldsa": {
    id: "aws-cloudhsm-mldsa",
    publisher: "AWS",
    title: "AWS CloudHSM User Guide: Generating ML-DSA key pairs",
    url: "https://docs.aws.amazon.com/cloudhsm/latest/userguide/cloudhsm_cli-key-generate-asymmetric-pair-mldsa.html",
    reference: "CLI key generation page, SDK and mode constraints",
    checkedDate: "2026-10-15",
  },
  "aws-transfer-pq-ssh": {
    id: "aws-transfer-pq-ssh",
    publisher: "AWS",
    title: "AWS Transfer Family User Guide: Post-quantum security policies",
    url: "https://docs.aws.amazon.com/transfer/latest/userguide/post-quantum-security-policies.html",
    reference: "Post-quantum SSH security policy names and scope",
    checkedDate: "2026-10-15",
  },
  "ir-8547": {
    id: "ir-8547",
    publisher: "NIST",
    title: "NIST IR 8547 (initial public draft): Transition to Post-Quantum Cryptography Standards",
    url: "https://csrc.nist.gov/pubs/ir/8547/ipd",
    reference: "Draft transition tables, including the 112-bit and 128-bit categories",
    versionDate: "2024-11-12",
    checkedDate: "2026-10-15",
    accessLimitation: "Initial public draft; content may change before finalization.",
  },
  "nsm-10": {
    id: "nsm-10",
    publisher: "The White House (archived)",
    title: "National Security Memorandum 10 on Promoting United States Leadership in Quantum Computing",
    url: "https://bidenwhitehouse.archives.gov/briefing-room/statements-releases/2022/05/04/national-security-memorandum-on-promoting-united-states-leadership-in-quantum-computing-while-mitigating-risks-to-vulnerable-cryptographic-systems/",
    reference: "Section on migration of National Security Systems by 2035",
    versionDate: "2022-05-04",
    checkedDate: "2026-10-15",
  },
  "rfc-5280": {
    id: "rfc-5280",
    publisher: "IETF",
    title: "RFC 5280: Internet X.509 PKI Certificate and Certificate Revocation List (CRL) Profile",
    url: "https://www.rfc-editor.org/rfc/rfc5280",
    reference: "Certificate path validation and revocation sections",
    versionDate: "2008-05",
    checkedDate: "2026-10-15",
  },
  "rfc-6960": {
    id: "rfc-6960",
    publisher: "IETF",
    title: "RFC 6960: X.509 Internet Public Key Infrastructure Online Certificate Status Protocol (OCSP)",
    url: "https://www.rfc-editor.org/rfc/rfc6960",
    reference: "OCSP responder behavior",
    versionDate: "2013-06",
    checkedDate: "2026-10-15",
  },
  "nist-cmvp": {
    id: "nist-cmvp",
    publisher: "NIST",
    title: "Cryptographic Module Validation Program",
    url: "https://csrc.nist.gov/projects/cryptographic-module-validation-program",
    reference: "Program scope: validated modules, security policies, operating environments",
    checkedDate: "2026-10-15",
  },
};

export function getSource(id: string): Source {
  const found = sources[id];
  if (!found) throw new Error(`Unknown source id: ${id}`);
  return found;
}
