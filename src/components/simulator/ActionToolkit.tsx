import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Mail, CheckSquare, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const executiveEmail = `Subject: Quantum-Safe Encryption Migration - Planning Needed

Hi [CTO/CISO name],

I've completed a quantum computing cryptography risk assessment for our infrastructure. We should begin planning our migration.

THE THREAT (Harvest Attacks - Happening NOW)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sophisticated adversaries are recording our encrypted traffic TODAY to decrypt it when quantum computers arrive (estimated ~2035). This is not a future threat—the harvesting is happening now.

Our data has been transmitting over vulnerable channels since [YEAR] ([X] years of harvested traffic).

KEY FACTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Current Risk: [HIGH/CRITICAL] (harvest attacks active now)
• Historical Exposure: [X] years of data already recorded
• Migration Complexity: Depends on infrastructure scope
• Estimated Timeline: 12-18+ months (varies by organization)

WHAT I NEED FROM YOU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Approval to engage qualified PQC migration consultants for accurate scoping
2. Budget for vendor assessment and quotes
3. Legal Coordination: Review breach notification requirements
4. Vendor Coordination: Verify CA PQC support timeline

WHY NOW?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Every day we delay is another day of data being harvested. Once encrypted data is recorded, it cannot be un-recorded. Organizations in our sector are already migrating (see: Google, Cloudflare, U.S. Government).

Can we discuss this in this week's planning meeting?

[Your name]
[Your title]

---
Additional Resources:
• NIST PQC Standards: https://www.nist.gov/pqcrypto
• CISA Quantum Guidance: https://www.cisa.gov/quantum
• Interactive Threat Visualization: [Link to this simulator]
`;

const migrationPhases = [
  {
    phase: 1,
    name: 'Foundation & Assessment',
    tasks: [
      'Audit current certificate inventory and TLS configurations',
      'Identify CA PQC support timeline (DigiCert ready now, Let\'s Encrypt Q3 2026)',
      'Upgrade to OpenSSL 3.4+ with ML-KEM-768 support',
      'Document historical exposure (years of harvested data)',
    ],
  },
  {
    phase: 2,
    name: 'Testing & Validation',
    tasks: [
      'Set up isolated test environment with ML-KEM-768',
      'Test with representative client devices and browsers',
      'Performance baseline: measure handshake latency impact',
      'Validate compatibility with existing infrastructure',
    ],
  },
  {
    phase: 3,
    name: 'Pilot Rollout',
    tasks: [
      'Enable hybrid X25519+ML-KEM-768 on 5-10% of traffic',
      'Monitor error rates, latency, compatibility',
      'Implement automated rollback if errors spike',
      'Gather user feedback and performance metrics',
    ],
  },
  {
    phase: 4,
    name: 'Production Migration',
    tasks: [
      'Gradual rollout: 10% → 25% → 50% → 100%',
      'Update all certificates to PQC-capable CAs',
      'Deprecate ECDHE-only configurations',
      'Update documentation, runbooks, and monitoring dashboards',
    ],
  },
];

const caSupport = [
  { name: 'DigiCert', status: 'Available Now', color: 'text-green-400', detail: 'Full ML-KEM support in production' },
  { name: 'Sectigo', status: 'Beta', color: 'text-blue-400', detail: 'Public beta available for testing' },
  { name: 'GlobalSign', status: 'Q2 2026', color: 'text-yellow-400', detail: 'Expected general availability' },
  { name: "Let's Encrypt", status: 'Q3 2026', color: 'text-yellow-400', detail: 'Timeline announced by ISRG' },
  { name: 'Internal CA', status: 'Depends', color: 'text-muted-foreground', detail: 'Check your PKI software vendor' },
];

const resources = [
  {
    title: 'NIST Post-Quantum Cryptography',
    url: 'https://www.nist.gov/pqcrypto',
    description: 'Official PQC standards and algorithms',
  },
  {
    title: 'CISA Quantum Readiness',
    url: 'https://www.cisa.gov/quantum',
    description: 'U.S. government guidance on quantum preparedness',
  },
  {
    title: 'NSA CNSA 2.0',
    url: 'https://media.defense.gov/2022/Sep/07/2003071834/-1/-1/0/CSA_CNSA_2.0_ALGORITHMS_.PDF',
    description: 'NSA quantum-resistant algorithm requirements',
  },
  {
    title: 'Cloudflare PQ Blog',
    url: 'https://blog.cloudflare.com/post-quantum-tunnel/',
    description: 'Technical deep-dive on PQ deployment at scale',
  },
  {
    title: 'OpenSSL 3.x Documentation',
    url: 'https://www.openssl.org/',
    description: 'Implementation guide for ML-KEM support',
  },
];

export default function ActionToolkit() {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(executiveEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-surface-2/30 rounded-2xl border border-border p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">Action Toolkit</h3>
      </div>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="email" className="text-xs">
            <Mail className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="phases" className="text-xs">
            <CheckSquare className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Phases</span>
          </TabsTrigger>
          <TabsTrigger value="ca" className="text-xs">CA Support</TabsTrigger>
          <TabsTrigger value="resources" className="text-xs">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">
              Copy-paste ready email to send to executives for budget approval
            </p>
            <Button
              onClick={handleCopyEmail}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <div className="bg-surface-0 rounded-lg border border-border p-4 font-mono text-xs leading-relaxed overflow-x-auto">
            <pre className="whitespace-pre-wrap text-muted-foreground">{executiveEmail}</pre>
          </div>
          <p className="text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> Replace [placeholders] with your organization's specific data. Reference the simulator above to calculate your exact exposure.
          </p>
        </TabsContent>

        <TabsContent value="phases" className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Standard migration framework (timeline varies by organization)
          </p>
          {migrationPhases.map((phase) => (
            <div key={phase.phase} className="bg-surface-1 rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-0.5 rounded">
                  Phase {phase.phase}
                </span>
                <h4 className="font-semibold text-sm text-foreground">{phase.name}</h4>
              </div>
              <ul className="space-y-1.5">
                {phase.tasks.map((task, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-primary" />
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
            <p className="text-xs text-muted-foreground mb-2">
              <strong className="text-foreground">Need help with migration?</strong>
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              Contact a qualified cryptography consultant or your infrastructure vendor for:
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground ml-4">
              <li>• Infrastructure assessment and risk analysis</li>
              <li>• Accurate timeline and cost estimates</li>
              <li>• Implementation support and testing</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="ca" className="space-y-3">
          <p className="text-sm text-muted-foreground mb-4">
            Certificate Authority PQC Support Status (as of February 2026)
          </p>
          {caSupport.map((ca, idx) => (
            <div key={idx} className="bg-surface-1 rounded-lg border border-border p-4">
              <div className="flex items-start justify-between mb-1">
                <span className="font-semibold text-sm text-foreground">{ca.name}</span>
                <span className={`text-xs font-mono ${ca.color}`}>{ca.status}</span>
              </div>
              <p className="text-xs text-muted-foreground">{ca.detail}</p>
            </div>
          ))}
          <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
            <p className="text-xs text-muted-foreground">
              ⚠️ <strong className="text-foreground">If your CA doesn't support PQC yet:</strong> Consider switching to DigiCert or Sectigo for immediate migration. Waiting for Let's Encrypt delays you until Q3 2026 minimum.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-3">
          <p className="text-sm text-muted-foreground mb-4">
            Official guidance and technical resources
          </p>
          {resources.map((resource, idx) => (
            <a
              key={idx}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-surface-1 rounded-lg border border-border p-4 hover:border-primary/50 hover:bg-surface-2 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {resource.title}
                    </span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-muted-foreground">{resource.description}</p>
                </div>
              </div>
            </a>
          ))}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
