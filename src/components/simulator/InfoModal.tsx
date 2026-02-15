import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Shield, Cpu, Lock, ExternalLink, BookOpen } from 'lucide-react';

interface InfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const tabs = [
  { id: 'threat', label: 'The Threat', icon: <Shield className="w-4 h-4" /> },
  { id: 'quantum', label: 'Quantum & Crypto', icon: <Cpu className="w-4 h-4" /> },
  { id: 'timeline', label: 'Timeline', icon: <Lock className="w-4 h-4" /> },
  { id: 'action', label: 'What to Do', icon: <BookOpen className="w-4 h-4" /> },
];

export default function InfoModal({ open, onOpenChange }: InfoModalProps) {
  const [activeTab, setActiveTab] = useState('threat');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Understanding the Quantum Threat
          </DialogTitle>
          <DialogDescription>
            Learn why "Harvest Now, Decrypt Later" is a real and urgent security concern.
          </DialogDescription>
        </DialogHeader>

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-border pb-0 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="overflow-y-auto max-h-[55vh] pr-1 space-y-4 text-sm text-muted-foreground leading-relaxed">
          {activeTab === 'threat' && (
            <>
              <Section title="What is 'Harvest Now, Decrypt Later'?">
                <p>
                  Adversaries (nation-states, criminal organizations, and other threat actors) are
                  <strong className="text-foreground"> recording encrypted internet traffic today</strong>.
                  They can't read it yet, but they're storing it, betting that future quantum computers
                  will be able to break the encryption.
                </p>
                <p className="mt-2">
                  This is called <strong className="text-foreground">"Harvest Now, Decrypt Later" (HNDL)</strong>,
                  also known as "Store Now, Decrypt Later" or retrospective decryption.
                </p>
              </Section>
              <Section title="Why Should You Care?">
                <ul className="list-disc list-inside space-y-1">
                  <li>Medical records have value for <strong className="text-foreground">decades</strong></li>
                  <li>State secrets remain classified for <strong className="text-foreground">25+ years</strong></li>
                  <li>Financial data, identity documents, and private communications all have long-term sensitivity</li>
                  <li>Data encrypted today with RSA or ECC <strong className="text-foreground">cannot be re-encrypted</strong> once captured</li>
                </ul>
              </Section>
              <Section title="Who Might Be Targeted?">
                <p>
                  Government agencies, healthcare organizations, financial institutions, defense contractors, 
                  critical infrastructure operators, and anyone handling data with long-term sensitivity.
                </p>
              </Section>
            </>
          )}

          {activeTab === 'quantum' && (
            <>
              <Section title="How Quantum Computers Break Encryption">
                <p>
                  Classical encryption like RSA and elliptic curve (X25519) relies on mathematical problems
                  that are hard for classical computers: factoring large numbers and computing
                  discrete logarithms.
                </p>
                <p className="mt-2">
                  <strong className="text-foreground">Shor's Algorithm</strong>, running on a sufficiently
                  powerful quantum computer, can solve these problems exponentially faster than any classical
                  algorithm. RSA-2048 and X25519 will eventually become breakable.
                </p>
              </Section>
              <Section title="Why RSA & X25519 Are Vulnerable">
                <p>
                  <strong className="text-enc-rsa">RSA-2048</strong>: Based on integer factorization. 
                  Requires ~2,000 logical qubits to break. Expected to be practically broken by ~2035.
                </p>
                <p className="mt-2">
                  <strong className="text-enc-x25519">X25519</strong>: Based on elliptic curve discrete log. 
                  Requires ~5,000 logical qubits. More resistant than RSA but still vulnerable. Expected ~2042.
                </p>
              </Section>
              <Section title="Why ML-KEM-768 Resists Quantum Attacks">
                <p>
                  <strong className="text-enc-mlkem">ML-KEM-768</strong> (formerly CRYSTALS-Kyber) is based
                  on lattice problems, specifically the Module Learning With Errors (MLWE) problem. No known
                  quantum algorithm can solve lattice problems efficiently.
                </p>
                <p className="mt-2">
                  The <strong className="text-foreground">hybrid approach</strong> (X25519 + ML-KEM-768) provides
                  defense-in-depth: both must be broken to decrypt, combining battle-tested classical security
                  with quantum resistance.
                </p>
              </Section>
            </>
          )}

          {activeTab === 'timeline' && (
            <>
              <Section title="Timeline Assumptions">
                <p>
                  This simulator's timeline is based on projections from NIST, NSA, and leading quantum
                  computing researchers. These are <strong className="text-foreground">conservative estimates</strong>.
                  Breakthroughs could accelerate the timeline.
                </p>
              </Section>
              <div className="space-y-2">
                {[
                  { year: '2026', event: 'Today. Quantum computers experimental (~100 logical qubits)', color: 'text-enc-mlkem' },
                  { year: '2030', event: 'Early quantum computers reach ~500 qubits', color: 'text-muted-foreground' },
                  { year: '2032', event: 'RSA-2048 becomes vulnerable to quantum attack', color: 'text-enc-x25519' },
                  { year: '2035', event: 'RSA-2048 practically broken. ~2,000 qubits achieved', color: 'text-enc-rsa' },
                  { year: '2038', event: 'X25519 becomes vulnerable', color: 'text-enc-x25519' },
                  { year: '2042', event: 'X25519 practically broken. ~5,000 qubits achieved', color: 'text-enc-rsa' },
                  { year: '2050', event: 'Advanced QC widespread. ML-KEM-768 still secure ✓', color: 'text-enc-mlkem' },
                ].map((m) => (
                  <div key={m.year} className="flex gap-3 items-start">
                    <span className="font-mono text-xs font-bold text-foreground w-10 shrink-0">{m.year}</span>
                    <span className={`text-xs ${m.color}`}>{m.event}</span>
                  </div>
                ))}
              </div>
              <Section title="Sources">
                <div className="flex flex-wrap gap-3">
                  <ResourceLink href="https://www.nist.gov/pqcrypto" label="NIST PQ Standards" />
                  <ResourceLink href="https://www.cisa.gov/quantum" label="CISA Quantum" />
                  <ResourceLink href="https://csrc.nist.gov/projects/post-quantum-cryptography" label="NIST CSRC" />
                </div>
              </Section>
            </>
          )}

          {activeTab === 'action' && (
            <>
              <Section title="For Individuals">
                <ul className="list-disc list-inside space-y-1">
                  <li>Use messaging apps with PQ support (Signal has ML-KEM)</li>
                  <li>Enable PQ-ready TLS in your browser (Chrome supports ML-KEM)</li>
                  <li>Choose services that prioritize PQ migration</li>
                </ul>
              </Section>
              <Section title="For Organizations">
                <ul className="list-disc list-inside space-y-1">
                  <li><strong className="text-foreground">Inventory</strong>: Audit all cryptographic assets and their sensitivity lifespans</li>
                  <li><strong className="text-foreground">Prioritize</strong>: Focus on data with long-term sensitivity first</li>
                  <li><strong className="text-foreground">Adopt hybrid</strong>: Deploy ML-KEM-768 + X25519 hybrid for TLS</li>
                  <li><strong className="text-foreground">Plan migration</strong>: Follow NIST SP 800-227 transition guidance</li>
                  <li><strong className="text-foreground">Test</strong>: Validate PQ implementations in staging before production</li>
                </ul>
              </Section>
              <Section title="About This Simulator">
                <p>
                  This is an educational tool designed to make the quantum threat tangible.
                  Timeline estimates are simplified projections, not predictions. The goal is to demonstrate
                  <strong className="text-foreground"> why we need quantum-resistant encryption today</strong>,
                  not to specify exactly when encryption will break.
                </p>
              </Section>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground mb-1">{title}</h4>
      {children}
    </div>
  );
}

function ResourceLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-xs text-primary hover:underline"
    >
      <ExternalLink className="w-3 h-3" />
      {label}
    </a>
  );
}
