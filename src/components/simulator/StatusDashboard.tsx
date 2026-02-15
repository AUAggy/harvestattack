import { EncryptionType, getEncryptionStatus, getQubitCount, encryptionTypes, getDecryptionProgress } from '@/lib/simulation-data';
import { Shield, Cpu, Mail, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface StatusDashboardProps {
  year: number;
  encryptionType: EncryptionType;
  messagesIntercepted: number;
}

export default function StatusDashboard({ year, encryptionType, messagesIntercepted }: StatusDashboardProps) {
  const status = getEncryptionStatus(encryptionType, year);
  const qubits = getQubitCount(year);
  const enc = encryptionTypes[encryptionType];
  const decrypted = status === 'broken' ? messagesIntercepted : 0;

  const timeUntilVulnerable = enc.vulnerableAt ? Math.max(0, enc.vulnerableAt - year) : null;

  const statusConfig = {
    secure: { label: 'SECURE', icon: <CheckCircle className="w-4 h-4" />, color: 'text-enc-mlkem', bg: 'bg-enc-mlkem/10 border-enc-mlkem/30' },
    vulnerable: { label: 'VULNERABLE', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-enc-x25519', bg: 'bg-enc-x25519/10 border-enc-x25519/30' },
    broken: { label: 'BROKEN', icon: <XCircle className="w-4 h-4" />, color: 'text-enc-rsa', bg: 'bg-enc-rsa/10 border-enc-rsa/30' },
  };

  const s = statusConfig[status];

  const cards = [
    {
      icon: <Cpu className="w-4 h-4 text-quantum" />,
      label: 'Quantum Computer',
      value: `${qubits.toLocaleString()} qubits`,
      sub: year <= 2030 ? 'Experimental' : year <= 2040 ? 'Growing rapidly' : 'Widespread',
    },
    {
      icon: <Shield className={`w-4 h-4 ${s.color}`} />,
      label: 'Encryption Status',
      value: s.label,
      sub: enc.shortName,
      highlight: s.bg,
    },
    {
      icon: <Mail className="w-4 h-4 text-transit" />,
      label: 'Intercepted',
      value: messagesIntercepted.toString(),
      sub: `${decrypted} decrypted`,
    },
    {
      icon: <Clock className="w-4 h-4 text-muted-foreground" />,
      label: 'Time to Break',
      value: timeUntilVulnerable === null ? '∞' : timeUntilVulnerable === 0 ? 'NOW' : `${timeUntilVulnerable}yr`,
      sub: timeUntilVulnerable === null ? 'Indefinitely secure' : timeUntilVulnerable === 0 ? 'Vulnerable now' : 'Until vulnerable',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`rounded-xl border p-3 transition-colors duration-300 ${
            card.highlight || 'bg-secondary border-border'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            {card.icon}
            <span className="text-xs text-muted-foreground font-medium">{card.label}</span>
          </div>
          <div className="font-mono text-lg font-bold text-foreground">{card.value}</div>
          <div className="text-xs text-muted-foreground">{card.sub}</div>
        </div>
      ))}
    </div>
  );
}
