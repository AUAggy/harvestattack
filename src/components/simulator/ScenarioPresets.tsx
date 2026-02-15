import { EncryptionType } from '@/lib/simulation-data';
import { Crosshair, ArrowUpDown, ShieldCheck, Sliders } from 'lucide-react';

export interface Scenario {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  encryptionType: EncryptionType;
  targetYear: number;
  autoPlay: boolean;
}

export const scenarios: Scenario[] = [
  {
    id: 'show-threat',
    label: 'Show Me the Threat',
    description: 'Auto-play RSA from 2026 → 2035 and watch it break',
    icon: <Crosshair className="w-4 h-4" />,
    encryptionType: 'RSA_2048',
    targetYear: 2026,
    autoPlay: true,
  },
  {
    id: 'why-upgrade',
    label: 'Why Upgrade Matters',
    description: 'See X25519 hold longer but still fall at 2042',
    icon: <ArrowUpDown className="w-4 h-4" />,
    encryptionType: 'X25519',
    targetYear: 2026,
    autoPlay: true,
  },
  {
    id: 'future-proof',
    label: 'Future-Proof Your Data',
    description: 'ML-KEM-768 stays secure through 2050 and beyond',
    icon: <ShieldCheck className="w-4 h-4" />,
    encryptionType: 'MLKEM768_HYBRID',
    targetYear: 2050,
    autoPlay: false,
  },
  {
    id: 'custom',
    label: 'Custom',
    description: 'Full control. Pick any encryption and year',
    icon: <Sliders className="w-4 h-4" />,
    encryptionType: 'RSA_2048',
    targetYear: 2026,
    autoPlay: false,
  },
];

interface ScenarioPresetsProps {
  activeScenario: string | null;
  onSelectScenario: (scenario: Scenario) => void;
}

export default function ScenarioPresets({ activeScenario, onSelectScenario }: ScenarioPresetsProps) {
  return (
    <div data-tour="scenario-presets" className="flex flex-wrap gap-2 justify-center">
      {scenarios.map((scenario) => {
        const isActive = activeScenario === scenario.id;
        return (
          <button
            key={scenario.id}
            onClick={() => onSelectScenario(scenario)}
            className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 text-left ${
              isActive
                ? 'border-primary bg-primary/10 text-primary shadow-md shadow-primary/10'
                : 'border-border bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 hover:border-border'
            }`}
          >
            <span className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}>
              {scenario.icon}
            </span>
            <div>
              <div className="text-xs font-semibold leading-tight">{scenario.label}</div>
              <div className="text-[10px] text-muted-foreground leading-tight hidden sm:block">{scenario.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
