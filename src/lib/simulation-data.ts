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
    tooltip: 'Widely used for decades. Based on factoring large numbers, a problem quantum computers can solve efficiently using Shor\'s algorithm. Expected to break around 2035.',
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
    tooltip: 'Modern elliptic curve cryptography. Much faster than RSA but still vulnerable to quantum attacks via Shor\'s algorithm. Expected to break around 2042.',
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
    tooltip: 'Uses both X25519 (battle-tested) AND ML-KEM-768 (quantum-resistant). Based on lattice problems that even quantum computers struggle with. Both locks must be broken to decrypt.',
    colorClass: 'text-enc-mlkem',
    glowClass: 'glow-mlkem',
  },
};

export const qubitProgress: Record<number, number> = {
  2026: 100,
  2028: 200,
  2030: 500,
  2032: 1000,
  2034: 1500,
  2035: 2000,
  2037: 3000,
  2040: 5000,
  2045: 10000,
  2050: 20000,
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

export const timelineMilestones = [
  { year: 2026, label: 'Today', description: 'Quantum computers experimental (~100 qubits)' },
  { year: 2030, label: 'Early QC', description: 'Early quantum computers (500 qubits)' },
  { year: 2032, label: 'RSA ⚠️', description: 'RSA-2048 becomes vulnerable' },
  { year: 2035, label: 'RSA 🔴', description: 'RSA-2048 practically broken' },
  { year: 2038, label: 'X25519 ⚠️', description: 'X25519 becomes vulnerable' },
  { year: 2042, label: 'X25519 🔴', description: 'X25519 practically broken' },
  { year: 2050, label: 'Future', description: 'Advanced QC widespread. ML-KEM-768 still secure ✓' },
];
