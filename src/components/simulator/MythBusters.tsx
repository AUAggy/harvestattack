import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const myths = [
  {
    myth: '"We can just wait until quantum computers arrive, then migrate."',
    reality: 'Adversaries are recording NOW. Your 2026 data will be decrypted in 2035. Migration takes 12-24 months. If you start in 2035, data from 2026-2037 is compromised.',
    icon: '⏰',
  },
  {
    myth: '"This only affects governments and banks."',
    reality: 'Healthcare (HIPAA 50-year retention), legal firms (attorney-client privilege), R&D companies (patent-pending IP), and anyone with long-lived secrets faces this threat.',
    icon: '🏥',
  },
  {
    myth: '"ML-KEM is unproven and risky."',
    reality: 'NIST standardized it in 2024 after 8 years of public cryptanalysis. The hybrid approach (X25519 + ML-KEM) means you\'re protected even if lattice crypto breaks.',
    icon: '🔬',
  },
  {
    myth: '"Quantum computers don\'t exist yet, so there\'s no rush."',
    reality: 'Correct, but the attack is already underway (the harvesting phase). Think of it like someone photographing your house locks today to break in 10 years from now.',
    icon: '📸',
  },
  {
    myth: '"We\'ll just upgrade when it becomes a problem."',
    reality: 'By then, years of your data will already be harvested. You can\'t un-record traffic. The damage is done the moment adversaries capture it.',
    icon: '💾',
  },
  {
    myth: '"This is just about encrypted traffic, not our other systems."',
    reality: 'Quantum computers threaten BOTH encryption (TLS) AND digital signatures (code signing, SSH, cryptocurrency). Bitcoin\'s $2.4T market cap sits on ECDSA signatures that quantum computers will break. Your code signing certificates, API tokens, and SSH keys likely use the same vulnerable signatures.',
    icon: '₿',
  },
];

export default function MythBusters() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <h3 className="text-lg font-bold text-foreground">Common Misconceptions</h3>
      </div>
      <div className="space-y-4">
        {myths.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
            className="border-l-4 border-destructive/50 pl-4 py-2 hover:border-destructive transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-destructive mb-1">
                  ❌ {item.myth}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  ✅ {item.reality}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 p-4 bg-card rounded-lg border border-border">
        <p className="text-xs text-muted-foreground text-center">
          <strong className="text-foreground">Bottom line:</strong> The threat is happening <strong className="text-foreground">right now</strong>, not in the future. Waiting is losing.
        </p>
      </div>
    </motion.div>
  );
}
