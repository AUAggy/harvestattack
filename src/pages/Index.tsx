import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import EncryptionSelector from '@/components/simulator/EncryptionSelector';
import SimulationCanvas from '@/components/simulator/SimulationCanvas';
import TimeSlider from '@/components/simulator/TimeSlider';
import StatusDashboard from '@/components/simulator/StatusDashboard';
import StorageVault from '@/components/simulator/StorageVault';
import ScenarioPresets, { Scenario } from '@/components/simulator/ScenarioPresets';
import InfoModal from '@/components/simulator/InfoModal';
import GuidedTour from '@/components/simulator/GuidedTour';
import MythBusters from '@/components/simulator/MythBusters';
import WhosMigrating from '@/components/simulator/WhosMigrating';
import CostOfWaiting from '@/components/simulator/CostOfWaiting';
import SelfAssessment from '@/components/simulator/SelfAssessment';
import ActionToolkit from '@/components/simulator/ActionToolkit';
import ShareExport from '@/components/simulator/ShareExport';
import { EncryptionType, encryptionTypes } from '@/lib/simulation-data';
import { Zap, HelpCircle, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [encryptionType, setEncryptionType] = useState<EncryptionType>('RSA_2048');
  const [year, setYear] = useState(2026);
  const [isPlaying, setIsPlaying] = useState(false);
  const [messagesIntercepted, setMessagesIntercepted] = useState(0);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [showTour, setShowTour] = useState(() => {
    return !localStorage.getItem('harvest-tour-completed');
  });

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

  // Auto-play
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
    <div className="min-h-screen bg-background">
      {/* Guided Tour */}
      {showTour && <GuidedTour onComplete={() => setShowTour(false)} />}

      {/* Info Modal */}
      <InfoModal open={infoOpen} onOpenChange={setInfoOpen} />

      {/* Header */}
      <header className="border-b border-border bg-surface-0/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">
                  Harvest Now, Decrypt Later
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  The Quantum Threat Visualized
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setInfoOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface-3 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Learn More</span>
              </button>
              <button
                onClick={() => setShowTour(true)}
                className="p-2 rounded-lg bg-surface-2 border border-border text-muted-foreground hover:text-foreground hover:bg-surface-3 transition-colors"
                title="Restart guided tour"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              <div className="font-mono text-3xl font-bold text-foreground">{year}</div>
            </div>
          </div>
          <div data-tour="encryption-selector">
            <EncryptionSelector selected={encryptionType} onChange={handleEncryptionChange} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Scenario Presets */}
        <div className="bg-surface-2/30 rounded-2xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-foreground">🎬 Scenarios</span>
            <span className="text-xs text-muted-foreground">Pick a preset or go custom</span>
          </div>
          <ScenarioPresets activeScenario={activeScenario} onSelectScenario={handleScenario} />
        </div>

        {/* Simulation Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2" data-tour="simulation-canvas">
            <SimulationCanvas
              encryptionType={encryptionType}
              year={year}
              isPlaying={isPlaying}
              onMessageIntercepted={handleMessageIntercepted}
            />
          </div>
          <div data-tour="storage-vault">
            <StorageVault
              encryptionType={encryptionType}
              year={year}
              messageCount={messagesIntercepted}
            />
          </div>
        </div>

        {/* Time Slider */}
        <div className="bg-surface-2/30 rounded-2xl border border-border p-4 sm:p-6" data-tour="time-slider">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-semibold text-foreground">⏱️ Time Machine</span>
            <span className="text-xs text-muted-foreground">Drag to travel through time</span>
          </div>
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

        {/* Cryptocurrency Context */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-yellow-500/10 border-l-4 border-yellow-500 rounded-lg p-6"
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl flex-shrink-0">₿</span>
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-2">
                The $2.4 Trillion Question: Digital Signatures
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Bitcoin and most cryptocurrencies use <strong className="text-foreground">ECDSA signatures</strong> that quantum
                computers will break. Unlike this simulator's focus on encrypted <em>traffic</em>,
                cryptocurrency faces a different threat: <strong className="text-foreground">signature forgery</strong>.
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                Every Bitcoin transaction is permanently public on the blockchain. When quantum computers
                arrive, addresses that have revealed their public key become vulnerable to theft.
                You can't "rotate" blockchain history.
              </p>
              <div className="bg-surface-1 rounded p-3 border border-border">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Why this matters to you:</strong> Your organization
                  likely uses ECDSA signatures for code signing, SSH keys, API authentication, and TLS
                  certificates. Same vulnerability. If quantum breaks Bitcoin, it breaks those too.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Clear Call to Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-destructive/20 to-primary/20 border-2 border-primary rounded-2xl p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-foreground mb-3">
            {messagesIntercepted > 0
              ? `${messagesIntercepted.toLocaleString()} Message${messagesIntercepted !== 1 ? 's' : ''} Already Harvested`
              : 'Your Data Is Being Harvested Right Now'}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            {year >= (encryptionTypes[encryptionType].brokenAt || 9999)
              ? `${encryptionTypes[encryptionType].shortName} is broken. Every message harvested since 2026 is now decryptable.`
              : 'Adversaries are recording encrypted traffic today to decrypt later. What should you do?'}
          </p>
          <Button
            size="lg"
            onClick={() => {
              document.getElementById('readiness-guide')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-lg px-8 py-6"
          >
            Get Your Readiness Assessment →
          </Button>
        </motion.div>

        {/* Complete PQC Readiness Guide */}
        <motion.div
          id="readiness-guide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-surface-2/30 rounded-2xl border border-border p-6"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Complete PQC Readiness Guide</h2>
            <p className="text-sm text-muted-foreground">
              Learn, assess, and take action on quantum-safe cryptography
            </p>
          </div>

          <Tabs defaultValue="learn" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="learn">Learn</TabsTrigger>
              <TabsTrigger value="assess">Assess</TabsTrigger>
              <TabsTrigger value="act">Act</TabsTrigger>
              <TabsTrigger value="share">Share</TabsTrigger>
            </TabsList>

            <TabsContent value="learn" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MythBusters />
                <WhosMigrating />
              </div>
              <CostOfWaiting currentYear={year} />
            </TabsContent>

            <TabsContent value="assess" className="space-y-6">
              <SelfAssessment />
            </TabsContent>

            <TabsContent value="act" className="space-y-6">
              <ActionToolkit />
            </TabsContent>

            <TabsContent value="share" className="space-y-6">
              <ShareExport
                encryptionType={encryptionType}
                year={year}
                messagesIntercepted={messagesIntercepted}
              />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Footer with resources */}
        <footer className="mt-12 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Learn more about post-quantum cryptography
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <a
              href="https://www.nist.gov/pqcrypto"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              NIST PQC Standards
            </a>
            <a
              href="https://www.cisa.gov/quantum"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              CISA Guidance
            </a>
            <a
              href="https://media.defense.gov/2022/Sep/07/2003071834/-1/-1/0/CSA_CNSA_2.0_ALGORITHMS_.PDF"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              NSA CNSA 2.0
            </a>
            <button
              onClick={() => setInfoOpen(true)}
              className="text-primary hover:underline"
            >
              About This Tool
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
