import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EncryptionType, messageTypes, getEncryptionStatus } from '@/lib/simulation-data';
import { User, Eye, Server } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface MessagePacket {
  id: number;
  type: typeof messageTypes[number];
  progress: number;
  intercepted: boolean;
}

interface SimulationCanvasProps {
  encryptionType: EncryptionType;
  year: number;
  isPlaying: boolean;
  onMessageIntercepted: () => void;
}

const encColors: Record<EncryptionType, { border: string; bg: string; shadow: string }> = {
  RSA_2048: { border: 'border-enc-rsa', bg: 'bg-enc-rsa/20', shadow: 'shadow-enc-rsa/30' },
  X25519: { border: 'border-enc-x25519', bg: 'bg-enc-x25519/20', shadow: 'shadow-enc-x25519/30' },
  MLKEM768_HYBRID: { border: 'border-enc-mlkem', bg: 'bg-enc-mlkem/20', shadow: 'shadow-enc-mlkem/30' },
};

export default function SimulationCanvas({ encryptionType, year, isPlaying, onMessageIntercepted }: SimulationCanvasProps) {
  const [packets, setPackets] = useState<MessagePacket[]>([]);
  const nextId = useRef(0);
  const status = getEncryptionStatus(encryptionType, year);
  const colors = encColors[encryptionType];

  // Spawn packets
  useEffect(() => {
    const interval = setInterval(() => {
      const msgType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
      const newPacket: MessagePacket = {
        id: nextId.current++,
        type: msgType,
        progress: 0,
        intercepted: false,
      };
      setPackets((prev) => [...prev.slice(-8), newPacket]);
      onMessageIntercepted();
    }, 3000 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, [onMessageIntercepted]);

  // Animate packets
  useEffect(() => {
    const frame = setInterval(() => {
      setPackets((prev) =>
        prev
          .map((p) => ({ ...p, progress: p.progress + 0.008 }))
          .filter((p) => p.progress <= 1.2)
      );
    }, 33);
    return () => clearInterval(frame);
  }, []);

  return (
    <div className="relative w-full h-64 sm:h-80 overflow-hidden rounded-2xl bg-surface-0/50 border border-border">
      {/* Connection line */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(var(--transit))" stopOpacity="0.3" />
            <stop offset="50%" stopColor="hsl(var(--transit))" stopOpacity="0.1" />
            <stop offset="100%" stopColor="hsl(var(--transit))" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {/* Main path */}
        <path d="M 100 100 Q 400 80 700 100" fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="8 4" />
        {/* Intercept path to vault */}
        <path d="M 400 100 Q 400 160 400 220" fill="none" stroke="hsl(var(--intercept))" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.3" />
      </svg>

      {/* Animated packets */}
      <AnimatePresence>
        {packets.map((packet) => {
          // Bezier curve: sender(100,100) -> adversary(400,80) -> receiver(700,100)
          const t = Math.min(packet.progress, 1);
          const x = 100 + t * 600;
          const y = 100 - Math.sin(t * Math.PI) * 30;
          // Fork animation: packet copy going down to vault
          const forkProgress = Math.max(0, Math.min(1, (packet.progress - 0.35) * 4));

          return (
            <div key={packet.id}>
              {/* Main packet */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: t > 1 ? 0 : 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`absolute flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-mono ${colors.border} ${colors.bg} shadow-lg pointer-events-none`}
                style={{
                  left: `${(x / 800) * 100}%`,
                  top: `${(y / 300) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <span className="text-xs">{packet.type.icon}</span>
                <span className="hidden sm:inline text-foreground/80">{packet.type.text}</span>
              </motion.div>

              {/* Intercepted copy going to vault */}
              {forkProgress > 0 && forkProgress < 1 && (
                <motion.div
                  className="absolute w-6 h-6 rounded border border-intercept/50 bg-intercept/20 flex items-center justify-center text-xs pointer-events-none"
                  style={{
                    left: '50%',
                    top: `${((100 + forkProgress * 120) / 300) * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    opacity: 1 - forkProgress,
                  }}
                >
                  📩
                </motion.div>
              )}
            </div>
          );
        })}
      </AnimatePresence>

      {/* Sender (Alice) */}
      <div className="absolute left-4 sm:left-8" style={{ top: '25%' }}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col items-center gap-1">
              <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-semibold text-foreground">Alice</span>
              <span className="text-xs text-muted-foreground">Sender</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-surface-2 border-border text-foreground">Sends encrypted messages</TooltipContent>
        </Tooltip>
      </div>

      {/* Adversary */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '15%' }}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col items-center gap-1">
              <motion.div
                className="w-14 h-14 rounded-full bg-intercept/10 border-2 border-intercept/50 flex items-center justify-center"
                animate={{ boxShadow: ['0 0 0px hsl(var(--intercept) / 0)', '0 0 20px hsl(var(--intercept) / 0.3)', '0 0 0px hsl(var(--intercept) / 0)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Eye className="w-6 h-6 text-intercept" />
              </motion.div>
              <span className="text-xs font-semibold text-intercept">Adversary</span>
              <span className="text-xs text-muted-foreground">Intercepting</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-surface-2 border-border text-foreground max-w-xs">
            This represents any entity recording encrypted internet traffic today: governments, hackers, or corporations.
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Receiver (Bob) */}
      <div className="absolute right-4 sm:right-8" style={{ top: '25%' }}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col items-center gap-1">
              <div className="w-14 h-14 rounded-full bg-safe/20 border-2 border-safe flex items-center justify-center">
                <Server className="w-6 h-6 text-safe" />
              </div>
              <span className="text-xs font-semibold text-foreground">Bob</span>
              <span className="text-xs text-muted-foreground">Receiver</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-surface-2 border-border text-foreground">Receives encrypted messages</TooltipContent>
        </Tooltip>
      </div>

      {/* Status banner */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold ${
            status === 'secure'
              ? 'bg-enc-mlkem/20 text-enc-mlkem border border-enc-mlkem/30'
              : status === 'vulnerable'
              ? 'bg-enc-x25519/20 text-enc-x25519 border border-enc-x25519/30'
              : 'bg-enc-rsa/20 text-enc-rsa border border-enc-rsa/30'
          }`}
        >
          {status === 'secure' && '🔒 Traffic encrypted & secure'}
          {status === 'vulnerable' && '⚠️ Encryption becoming vulnerable'}
          {status === 'broken' && '🔓 ENCRYPTION BROKEN - All data exposed'}
        </motion.div>
      </div>
    </div>
  );
}
