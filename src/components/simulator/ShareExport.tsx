import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Check, Download, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const shareText = `Our encrypted data may already be compromised

Adversaries are recording encrypted internet traffic today, storing it until quantum computers can break the encryption. This is called a "harvest now, decrypt later" attack.

RSA-2048, the encryption protecting most web traffic, VPNs, and email, is estimated to break around 2035. Every year of data transmitted before we migrate to quantum-resistant encryption becomes decryptable once that happens.

Google, Apple, Signal, Cloudflare, and Zoom have already migrated. NIST finalized post-quantum cryptography standards in 2024. The U.S. government mandates migration by 2033.

What to do next:
1. Identify systems transmitting data that must stay confidential past 2035
2. Check whether your TLS certificates, VPNs, and key exchanges use RSA or ECDSA
3. Contact your certificate authority about post-quantum support (DigiCert supports it now)
4. Begin testing hybrid key exchange (ML-KEM-768 + X25519) in non-production environments

References:
- NIST PQC Standards: https://www.nist.gov/pqcrypto
- CISA Quantum Guidance: https://www.cisa.gov/quantum
- NSA CNSA 2.0: https://media.defense.gov/2025/May/30/2003728741/-1/-1/0/CSA_CNSA_2.0_ALGORITHMS.PDF`;

export default function ShareExport() {
  const [copied, setCopied] = useState(false);

  const siteUrl = window.location.origin;

  const fullShareText = `${shareText}

Interactive simulation: ${siteUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullShareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent('Our encrypted data may already be compromised');
    const body = encodeURIComponent(fullShareText);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleDownload = () => {
    const blob = new Blob([fullShareText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quantum-threat-briefing.txt';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    // Delay cleanup to allow download to start
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card border border-border rounded-lg p-6 max-w-3xl mx-auto"
    >
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">Share With Your Team</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Forward this briefing to colleagues, executives, or your security team. It explains the threat, names who has already acted, and lists concrete next steps.
      </p>

      <div className="bg-secondary/50 rounded-lg border border-border p-4 mb-6">
        <pre className="text-sm text-foreground whitespace-pre-wrap break-all font-mono leading-relaxed">
          {fullShareText}
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
          onClick={handleDownload}
          variant="outline"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>
    </motion.div>
  );
}
