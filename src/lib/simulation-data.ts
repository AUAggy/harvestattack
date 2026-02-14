export type EncryptionType = 'RSA_2048' | 'X25519' | 'MLKEM768_HYBRID';

export interface EncryptionInfo {
  id: EncryptionType;
  name: string;
  shortName: string;
  vulnerableAt: number | null;
  brokenAt: number | null;
  qubitRequirement: number;
  description: string;
  tooltip: string;
  colorClass: string;
  glowClass: string;
}

export const encryptionTypes: Record<EncryptionType, EncryptionInfo> = {
  RSA_2048: {
    id: 'RSA_2048',
    name: 'RSA-2048 (Legacy Encryption)',
    shortName: 'RSA-2048',
    vulnerableAt: 2032,
    brokenAt: 2035,
    qubitRequirement: 2000,
    description: 'Factoring-based encryption',
    tooltip: 'Widely used for decades. Based on factoring large numbers, a problem quantum computers can solve efficiently using Shor\'s algorithm. Estimated to break around 2035 (expert consensus, ±3-5 years uncertainty).',
    colorClass: 'text-enc-rsa',
    glowClass: 'glow-rsa',
  },
  X25519: {
    id: 'X25519',
    name: 'X25519 (Current Encryption)',
    shortName: 'X25519',
    vulnerableAt: 2038,
    brokenAt: 2042,
    qubitRequirement: 5000,
    description: 'Elliptic curve cryptography',
    tooltip: 'Modern elliptic curve cryptography. Much faster than RSA but still vulnerable to quantum attacks via Shor\'s algorithm. Estimated to break around 2042 (significant uncertainty).',
    colorClass: 'text-enc-x25519',
    glowClass: 'glow-x25519',
  },
  MLKEM768_HYBRID: {
    id: 'MLKEM768_HYBRID',
    name: 'ML-KEM-768 Hybrid (Quantum-Resistant)',
    shortName: 'ML-KEM-768',
    vulnerableAt: null,
    brokenAt: null,
    qubitRequirement: Infinity,
    description: 'Quantum-resistant hybrid',
    tooltip: 'Uses both X25519 (battle-tested) AND ML-KEM-768 (quantum-resistant). Based on lattice problems that even quantum computers are expected to struggle with. Both locks must be broken to decrypt. No known quantum attack.',
    colorClass: 'text-enc-mlkem',
    glowClass: 'glow-mlkem',
  },
};

/**
 * Qubit Progress Projections (2026-2050)
 *
 * IMPORTANT: These are ESTIMATES based on current industry roadmaps and expert consensus.
 * Actual progress may vary significantly.
 *
 * Sources:
 * - IBM Quantum Roadmap (2023): Target 4,000+ qubits by 2025
 * - IonQ predictions: 1,000+ qubits by 2028
 * - Google Quantum AI: Willow chip demonstrates error correction (2024)
 * - NIST PQC project conservative estimates
 *
 * Key Considerations:
 * - Cryptographically-Relevant Quantum Computers (CRQC) need MORE than just qubit count
 * - Error rates must be low (<10^-6 per gate operation)
 * - Coherence times must be long enough for Shor's algorithm
 * - Current consensus: CRQC likely between 2030-2040, with 2035 as median estimate
 *
 * Vulnerability Dates:
 * - RSA-2048: ~2,000 logical qubits (with error correction) → ~2035 estimated
 * - X25519 (ECDH): ~5,000 logical qubits → ~2042 estimated
 * - ML-KEM-768: No known quantum advantage (based on lattice problems)
 *
 * These projections are for EDUCATIONAL purposes. Do not treat as precise predictions.
 */
export const qubitProgress: Record<number, number> = {
  2026: 100,    // Current state (IBM System Two, Google Willow)
  2028: 200,    // Near-term projections
  2030: 500,    // Early CRQC candidates
  2032: 1000,   // RSA-2048 vulnerable threshold approaching
  2034: 1500,   //
  2035: 2000,   // RSA-2048 broken (median estimate)
  2037: 3000,   //
  2040: 5000,   // X25519 vulnerable threshold
  2045: 10000,  // Advanced QC
  2050: 20000,  // Future state (highly uncertain)
};

export function getQubitCount(year: number): number {
  const years = Object.keys(qubitProgress).map(Number).sort((a, b) => a - b);
  if (year <= years[0]) return qubitProgress[years[0]];
  if (year >= years[years.length - 1]) return qubitProgress[years[years.length - 1]];

  let lower = years[0], upper = years[years.length - 1];
  for (let i = 0; i < years.length - 1; i++) {
    if (year >= years[i] && year <= years[i + 1]) {
      lower = years[i];
      upper = years[i + 1];
      break;
    }
  }

  const t = (year - lower) / (upper - lower);
  const lowerVal = Math.log(qubitProgress[lower]);
  const upperVal = Math.log(qubitProgress[upper]);
  return Math.round(Math.exp(lowerVal + t * (upperVal - lowerVal)));
}

export function getEncryptionStatus(type: EncryptionType, year: number): 'secure' | 'vulnerable' | 'broken' {
  const enc = encryptionTypes[type];
  if (enc.brokenAt && year >= enc.brokenAt) return 'broken';
  if (enc.vulnerableAt && year >= enc.vulnerableAt) return 'vulnerable';
  return 'secure';
}

export function getDecryptionProgress(type: EncryptionType, year: number): number {
  const enc = encryptionTypes[type];
  if (!enc.vulnerableAt || !enc.brokenAt) return Math.min(year - 2026, 2) * 0.02; // ML-KEM: tiny progress
  if (year < 2026) return 0;
  if (year >= enc.brokenAt) return 100;
  if (year < enc.vulnerableAt - 2) return ((year - 2026) / (enc.vulnerableAt - 2 - 2026)) * 15;
  if (year < enc.vulnerableAt) return 15 + ((year - (enc.vulnerableAt - 2)) / 2) * 25;
  return 40 + ((year - enc.vulnerableAt) / (enc.brokenAt - enc.vulnerableAt)) * 60;
}

export const messageTypes = [
  { type: 'medical', text: 'Medical Records', icon: '🏥' },
  { type: 'financial', text: 'Bank Transaction', icon: '🏦' },
  { type: 'personal', text: 'Private Message', icon: '💬' },
  { type: 'business', text: 'Business Email', icon: '📧' },
  { type: 'sensitive', text: 'Confidential Doc', icon: '📄' },
  { type: 'identity', text: 'ID Verification', icon: '🪪' },
];

/**
 * Timeline Milestones
 *
 * These dates are ESTIMATES based on expert consensus. Use for educational purposes only.
 * The actual timeline depends on breakthroughs in quantum error correction and coherence.
 */
export const timelineMilestones = [
  { year: 2026, label: 'Today', description: 'Quantum computers experimental (~100 qubits)' },
  { year: 2030, label: 'Early QC', description: 'Early quantum computers (est. 500 qubits) - projections vary widely' },
  { year: 2032, label: 'RSA ⚠️', description: 'RSA-2048 may become vulnerable (conservative estimate)' },
  { year: 2035, label: 'RSA 🔴', description: 'RSA-2048 likely broken (median expert consensus - could be earlier/later)' },
  { year: 2038, label: 'X25519 ⚠️', description: 'X25519 may become vulnerable (estimate based on qubit projections)' },
  { year: 2042, label: 'X25519 🔴', description: 'X25519 likely broken (estimate - significant uncertainty)' },
  { year: 2050, label: 'Future', description: 'Advanced QC potentially widespread (highly uncertain). ML-KEM-768 expected to remain secure ✓' },
];
