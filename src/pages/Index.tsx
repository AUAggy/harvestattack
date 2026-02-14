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
import { EncryptionType } from '@/lib/simulation-data';
import { Info, Zap, HelpCircle, BookOpen } from 'lucide-react';

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

        {/* Educational callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-surface-2/50 border border-border rounded-2xl p-6 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Info className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Why does this matter?</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Adversaries are recording encrypted traffic <strong className="text-foreground">right now</strong>,
            betting that quantum computers will eventually break the encryption. This is
            <strong className="text-foreground"> "Harvest Now, Decrypt Later"</strong>.
            Data with long-term value (medical records, state secrets, financial data) needs
            quantum-resistant encryption <strong className="text-foreground">today</strong>, not when quantum computers arrive.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <button
              onClick={() => setInfoOpen(true)}
              className="text-xs text-primary hover:underline"
            >
              Learn More About This Threat →
            </button>
            <a
              href="https://www.nist.gov/pqcrypto"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              NIST PQ Standards →
            </a>
            <a
              href="https://www.cisa.gov/quantum"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              CISA Quantum Guidance →
            </a>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
