import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import MythBusters from '@/components/simulator/MythBusters';
import WhosMigrating from '@/components/simulator/WhosMigrating';
import CostOfWaiting from '@/components/simulator/CostOfWaiting';

export default function Learn() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          What You Need to Know
        </h1>
        <p className="mt-2 text-muted-foreground">
          Separate fact from fiction, see who's already acting, and understand the real cost of delay.
        </p>
      </div>

      {/* Myths + Who's Migrating */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MythBusters />
        <WhosMigrating />
      </div>

      {/* Cost of Waiting */}
      <CostOfWaiting />

      {/* Bitcoin/ECDSA Callout */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">&#8383;</span>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">
              The $2.4 Trillion Question: Digital Signatures
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Bitcoin and most cryptocurrencies use <strong className="text-foreground">ECDSA signatures</strong> that quantum computers will break. Every Bitcoin transaction is permanently public on the blockchain. When quantum computers arrive, addresses that have revealed their public key become vulnerable.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Why this matters to you:</strong> Your organization likely uses ECDSA signatures for code signing, SSH keys, API authentication, and TLS certificates. Same vulnerability.
            </p>
          </div>
        </div>
      </div>

      {/* CTA to Assess */}
      <div className="text-center py-8">
        <Link
          to="/assess"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Assess Your Risk
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
