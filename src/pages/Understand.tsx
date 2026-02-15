import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import EncryptionSelector from '@/components/simulator/EncryptionSelector';
import SimulationCanvas from '@/components/simulator/SimulationCanvas';
import TimeSlider from '@/components/simulator/TimeSlider';
import StatusDashboard from '@/components/simulator/StatusDashboard';
import StorageVault from '@/components/simulator/StorageVault';
import ScenarioPresets, { Scenario } from '@/components/simulator/ScenarioPresets';
import MythBusters from '@/components/simulator/MythBusters';
import WhosMigrating from '@/components/simulator/WhosMigrating';
import CostOfWaiting from '@/components/simulator/CostOfWaiting';
import { EncryptionType, encryptionTypes } from '@/lib/simulation-data';

export default function Understand() {
  const [encryptionType, setEncryptionType] = useState<EncryptionType>('RSA_2048');
  const [year, setYear] = useState(2026);
  const [isPlaying, setIsPlaying] = useState(false);
  const [messagesIntercepted, setMessagesIntercepted] = useState(0);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const handleMessageIntercepted = useCallback(() => {
    setMessagesIntercepted((prev) => prev + 1);
  }, []);

  const handleEncryptionChange = (type: EncryptionType) => {
    setEncryptionType(type);
    setYear(2026);
    setMessagesIntercepted(0);
    setIsPlaying(false);
    setActiveScenario(null);
  };

  const handleReset = () => {
    setYear(2026);
    setMessagesIntercepted(0);
    setIsPlaying(false);
  };

  const handleScenario = (scenario: Scenario) => {
    if (scenario.id === 'custom') {
      setActiveScenario('custom');
      return;
    }
    setActiveScenario(scenario.id);
    setEncryptionType(scenario.encryptionType);
    setMessagesIntercepted(0);
    if (scenario.autoPlay) {
      setYear(2026);
      setIsPlaying(true);
    } else {
      setYear(scenario.targetYear);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setYear((prev) => {
        if (prev >= 2050) {
          setIsPlaying(false);
          return 2050;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Understand the Threat
        </h1>
        <p className="mt-2 text-muted-foreground">
          See how "harvest now, decrypt later" works in real time. Pick an encryption method and watch what happens.
        </p>
      </div>

      {/* Year Display */}
      <div className="text-center">
        <span className="font-mono text-4xl font-bold text-foreground">{year}</span>
      </div>

      {/* Encryption Selector */}
      <EncryptionSelector selected={encryptionType} onChange={handleEncryptionChange} />

      {/* Scenario Presets */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold text-foreground">Scenarios</span>
          <span className="text-xs text-muted-foreground">Pick a preset or go custom</span>
        </div>
        <ScenarioPresets activeScenario={activeScenario} onSelectScenario={handleScenario} />
      </div>

      {/* Simulation Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SimulationCanvas
            encryptionType={encryptionType}
            year={year}
            isPlaying={isPlaying}
            onMessageIntercepted={handleMessageIntercepted}
          />
        </div>
        <div>
          <StorageVault
            encryptionType={encryptionType}
            year={year}
            messageCount={messagesIntercepted}
          />
        </div>
      </div>

      {/* Time Slider */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <TimeSlider
          year={year}
          onChange={setYear}
          isPlaying={isPlaying}
          onPlayToggle={() => setIsPlaying((p) => !p)}
          onReset={handleReset}
        />
      </div>

      {/* Status Dashboard */}
      <StatusDashboard
        year={year}
        encryptionType={encryptionType}
        messagesIntercepted={messagesIntercepted}
      />

      {/* Education Section */}
      <div className="border-t border-border pt-12 space-y-8">
        <h2 className="text-xl font-bold text-foreground text-center">What You Need to Know</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MythBusters />
          <WhosMigrating />
        </div>

        <CostOfWaiting currentYear={year} />

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
      </div>

      {/* CTA to Assess */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="text-center py-8"
      >
        <Link
          to="/assess"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Assess Your Risk
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
}
