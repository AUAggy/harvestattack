import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Check, Download, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EncryptionType, encryptionTypes } from '@/lib/simulation-data';

interface Props {
  encryptionType: EncryptionType;
  year: number;
  messagesIntercepted: number;
}

export default function ShareExport({ encryptionType, year, messagesIntercepted }: Props) {
  const [copied, setCopied] = useState(false);

  const encryption = encryptionTypes[encryptionType];
  const vulnerable = encryption.vulnerableAt && year >= encryption.vulnerableAt;
  const broken = encryption.brokenAt && year >= encryption.brokenAt;

  const status = broken
    ? '🚨 BROKEN'
    : vulnerable
    ? '⚠️ VULNERABLE'
    : '✅ SECURE';

  const shareText = `🔐 Quantum Threat Visualization

Encryption: ${encryption.name}
Year: ${year}
Status: ${status}
Messages Harvested: ${messagesIntercepted.toLocaleString()}

${broken ? '❌ This encryption is completely broken by quantum computers.' : ''}
${vulnerable && !broken ? '⚠️ This encryption is vulnerable but not yet fully broken.' : ''}
${!vulnerable ? '✅ This encryption remains secure against quantum attacks.' : ''}

Understand the "Harvest Now, Decrypt Later" threat:
${window.location.origin}

#QuantumSafety #PostQuantumCrypto #CyberSecurity`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent('Quantum Computing Threat - See This Visualization');
    const body = encodeURIComponent(shareText);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleDownloadScenario = () => {
    const blob = new Blob([shareText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantum-threat-scenario-${year}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">Share This Scenario</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Help others understand the quantum threat by sharing this simulation with your team, executives, or colleagues.
      </p>

      <div className="bg-surface-0 rounded-lg border border-border p-4 mb-4">
        <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
          {shareText}
        </pre>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          onClick={handleCopy}
          variant="outline"
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Text
            </>
          )}
        </Button>

        <Button
          onClick={handleEmailShare}
          variant="outline"
          className="gap-2"
        >
          <Mail className="w-4 h-4" />
          Email
        </Button>

        <Button
          onClick={handleDownloadScenario}
          variant="outline"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>

      <div className="mt-6 p-4 bg-surface-1 rounded-lg border border-border">
        <p className="text-xs text-muted-foreground text-center">
          💡 <strong className="text-foreground">Tip:</strong> Share this with executives to explain why PQC migration budget is needed. The visualization makes the abstract threat concrete and urgent.
        </p>
      </div>
    </motion.div>
  );
}
