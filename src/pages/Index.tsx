import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import EncryptionSelector from '@/components/simulator/EncryptionSelector';
import SimulationCanvas from '@/components/simulator/SimulationCanvas';
import TimeSlider from '@/components/simulator/TimeSlider';
import StatusDashboard from '@/components/simulator/StatusDashboard';
import StorageVault from '@/components/simulator/StorageVault';
import { EncryptionType, getQubitCount } from '@/lib/simulation-data';
import { Info, Zap } from 'lucide-react';

const Index = () => {
  const [encryptionType, setEncryptionType] = useState<EncryptionType>('RSA_2048');
  const [year, setYear] = useState(2026);
  const [isPlaying, setIsPlaying] = useState(false);
  const [messagesIntercepted, setMessagesIntercepted] = useState(0);

  const handleMessageIntercepted = useCallback(() => {
    setMessagesIntercepted((prev) => prev + 1);
  }, []);

  const handleEncryptionChange = (type: EncryptionType) => {
    setEncryptionType(type);
    setYear(2026);
    setMessagesIntercepted(0);
    setIsPlaying(false);
  };

  const handleReset = () => {
    setYear(2026);
    setMessagesIntercepted(0);
    setIsPlaying(false);
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
            <div className="flex items-center gap-2">
              <div className="font-mono text-3xl font-bold text-foreground">{year}</div>
            </div>
          </div>
          <EncryptionSelector selected={encryptionType} onChange={handleEncryptionChange} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
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
        <div className="bg-surface-2/30 rounded-2xl border border-border p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-semibold text-foreground">⏱️ Time Machine</span>
            <span className="text-xs text-muted-foreground">— Drag to travel through time</span>
          </div>
          <TimeSlider
            year={year}
            onChange={setYear}
            isPlaying={isPlaying}
            onPlayToggle={() => setIsPlaying((p) => !p)}
            onReset={handleReset}
          />
        </div>

        {/* Quick jump buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { label: '🎯 RSA Breaks (2035)', year: 2035, enc: 'RSA_2048' as EncryptionType },
            { label: '🎯 X25519 Breaks (2042)', year: 2042, enc: 'X25519' as EncryptionType },
            { label: '🛡️ ML-KEM at 2050', year: 2050, enc: 'MLKEM768_HYBRID' as EncryptionType },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                setEncryptionType(preset.enc);
                setYear(preset.year);
                setMessagesIntercepted(Math.floor(Math.random() * 50) + 30);
              }}
              className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface-3 transition-colors"
            >
              {preset.label}
            </button>
          ))}
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
            betting that quantum computers will eventually break the encryption. This is called 
            <strong className="text-foreground"> "Harvest Now, Decrypt Later"</strong>. 
            Data with long-term value — medical records, state secrets, financial data — needs 
            quantum-resistant encryption <strong className="text-foreground">today</strong>, not when quantum computers arrive.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
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
