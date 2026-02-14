import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, SkipForward } from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="encryption-selector"]',
    title: '1. Choose an Encryption Method',
    description: 'Select RSA-2048, X25519, or ML-KEM-768 Hybrid to test how each stands up against future quantum computers.',
    position: 'bottom',
  },
  {
    target: '[data-tour="simulation-canvas"]',
    title: '2. Watch the Traffic Flow',
    description: 'Messages flow from Alice to Bob, but the adversary in the middle is recording everything. Every packet is intercepted and stored.',
    position: 'bottom',
  },
  {
    target: '[data-tour="storage-vault"]',
    title: '3. The Adversary\'s Vault',
    description: 'Intercepted messages pile up here. They\'re encrypted now, but the adversary is waiting for quantum computers to crack them open.',
    position: 'left',
  },
  {
    target: '[data-tour="time-slider"]',
    title: '4. Travel Through Time',
    description: 'Drag the slider or press Play to fast-forward. Watch what happens to encryption as quantum computers grow more powerful.',
    position: 'top',
  },
  {
    target: '[data-tour="scenario-presets"]',
    title: '5. Try a Scenario',
    description: 'Jump straight to key moments. See RSA break at 2035, or watch ML-KEM-768 hold strong all the way to 2050.',
    position: 'top',
  },
];

interface GuidedTourProps {
  onComplete: () => void;
}

export default function GuidedTour({ onComplete }: GuidedTourProps) {
  const [step, setStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  const updateSpotlight = useCallback(() => {
    const el = document.querySelector(tourSteps[step].target);
    if (el) {
      setSpotlightRect(el.getBoundingClientRect());
    }
  }, [step]);

  useEffect(() => {
    updateSpotlight();
    const el = document.querySelector(tourSteps[step].target);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    const timer = setTimeout(updateSpotlight, 300);
    window.addEventListener('resize', updateSpotlight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateSpotlight);
    };
  }, [step, updateSpotlight]);

  const handleNext = () => {
    if (step < tourSteps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('harvest-tour-completed', 'true');
    onComplete();
  };

  const current = tourSteps[step];
  const pad = 8;

  const getTooltipPosition = (): React.CSSProperties => {
    if (!spotlightRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    const pos = current.position;
    if (pos === 'bottom') {
      return {
        top: spotlightRect.bottom + pad + 12,
        left: spotlightRect.left + spotlightRect.width / 2,
        transform: 'translateX(-50%)',
        maxWidth: Math.min(380, window.innerWidth - 32),
      };
    }
    if (pos === 'top') {
      return {
        bottom: window.innerHeight - spotlightRect.top + pad + 12,
        left: spotlightRect.left + spotlightRect.width / 2,
        transform: 'translateX(-50%)',
        maxWidth: Math.min(380, window.innerWidth - 32),
      };
    }
    if (pos === 'left') {
      return {
        top: spotlightRect.top + spotlightRect.height / 2,
        right: window.innerWidth - spotlightRect.left + pad + 12,
        transform: 'translateY(-50%)',
        maxWidth: 320,
      };
    }
    // right
    return {
      top: spotlightRect.top + spotlightRect.height / 2,
      left: spotlightRect.right + pad + 12,
      transform: 'translateY(-50%)',
      maxWidth: 320,
    };
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
      >
        {/* Overlay with spotlight cutout */}
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              {spotlightRect && (
                <rect
                  x={spotlightRect.left - pad}
                  y={spotlightRect.top - pad}
                  width={spotlightRect.width + pad * 2}
                  height={spotlightRect.height + pad * 2}
                  rx={12}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Spotlight border */}
        {spotlightRect && (
          <motion.div
            className="absolute border-2 border-primary rounded-xl pointer-events-none"
            initial={false}
            animate={{
              left: spotlightRect.left - pad,
              top: spotlightRect.top - pad,
              width: spotlightRect.width + pad * 2,
              height: spotlightRect.height + pad * 2,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ boxShadow: '0 0 30px hsl(217 91% 60% / 0.3)' }}
          />
        )}

        {/* Click blocker */}
        <div className="absolute inset-0" onClick={(e) => e.stopPropagation()} />

        {/* Tooltip */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed z-[101] bg-surface-2 border border-border rounded-xl p-4 shadow-2xl"
          style={getTooltipPosition()}
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-bold text-foreground">{current.title}</h3>
            <button onClick={handleComplete} className="text-muted-foreground hover:text-foreground ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">{current.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {tourSteps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === step ? 'bg-primary' : i < step ? 'bg-primary/40' : 'bg-surface-3'
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleComplete}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <SkipForward className="w-3 h-3" /> Skip
              </button>
              <button
                onClick={handleNext}
                className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-1"
              >
                {step < tourSteps.length - 1 ? (
                  <>Next <ChevronRight className="w-3 h-3" /></>
                ) : (
                  'Finish'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
