import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import EncryptionSelector from '@/components/simulator/EncryptionSelector';
import SimulationCanvas from '@/components/simulator/SimulationCanvas';
import TimeSlider from '@/components/simulator/TimeSlider';
import StatusDashboard from '@/components/simulator/StatusDashboard';
import StorageVault from '@/components/simulator/StorageVault';
import ScenarioPresets, { Scenario } from '@/components/simulator/ScenarioPresets';
import { EncryptionType } from '@/lib/simulation-data';

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
          See the Threat in Action
        </h1>
        <p className="mt-2 text-muted-foreground">
          Pick an encryption method, hit play, and watch what happens as quantum computers advance.
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

      {/* CTA to Learn */}
      <div className="text-center py-8">
        <Link
          to="/learn"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          What You Need to Know
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
