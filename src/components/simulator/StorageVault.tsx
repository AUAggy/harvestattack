import { motion, AnimatePresence } from 'framer-motion';
import { EncryptionType, getEncryptionStatus, getDecryptionProgress, messageTypes } from '@/lib/simulation-data';
import { Lock, LockOpen, AlertTriangle } from 'lucide-react';

interface StorageVaultProps {
  encryptionType: EncryptionType;
  year: number;
  messageCount: number;
}

export default function StorageVault({ encryptionType, year, messageCount }: StorageVaultProps) {
  const status = getEncryptionStatus(encryptionType, year);
  const progress = getDecryptionProgress(encryptionType, year);
  const decryptedCount = status === 'broken' ? messageCount : 0;

  const statusColors = {
    secure: 'border-enc-mlkem/30 bg-enc-mlkem/5',
    vulnerable: 'border-enc-x25519/50 bg-enc-x25519/5',
    broken: 'border-enc-rsa/50 bg-enc-rsa/10',
  };

  const statusLabels = {
    secure: { text: 'LOCKED', icon: <Lock className="w-4 h-4" />, color: 'text-enc-mlkem' },
    vulnerable: { text: 'CRACKING...', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-enc-x25519' },
    broken: { text: 'DECRYPTED', icon: <LockOpen className="w-4 h-4" />, color: 'text-enc-rsa' },
  };

  const label = statusLabels[status];

  return (
    <motion.div
      className={`relative rounded-xl border-2 p-4 transition-colors duration-500 ${statusColors[status]}`}
      animate={status === 'vulnerable' ? { x: [0, -2, 2, -2, 0] } : {}}
      transition={status === 'vulnerable' ? { repeat: Infinity, duration: 0.5, repeatDelay: 2 } : {}}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🗄️</span>
          <span className="text-sm font-semibold text-foreground">Storage Vault</span>
        </div>
        <div className={`flex items-center gap-1 text-xs font-mono font-bold ${label.color}`}>
          {label.icon}
          {label.text}
        </div>
      </div>

      {/* Message count */}
      <div className="text-center mb-3">
        <div className="font-mono text-2xl font-bold text-foreground">{messageCount}</div>
        <div className="text-xs text-muted-foreground">messages stored</div>
      </div>

      {/* Decryption progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-muted-foreground">Decryption</span>
          <span className={label.color}>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-background overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              status === 'broken' ? 'bg-enc-rsa' : status === 'vulnerable' ? 'bg-enc-x25519' : 'bg-enc-mlkem'
            }`}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Exposed messages */}
      <AnimatePresence>
        {status === 'broken' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 space-y-1"
          >
            <div className="text-xs font-mono text-enc-rsa font-bold mb-1">
              {decryptedCount} MESSAGES EXPOSED
            </div>
            {messageTypes.slice(0, 4).map((msg, i) => (
              <motion.div
                key={msg.type}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 text-xs text-enc-rsa/80"
              >
                <span>{msg.icon}</span>
                <span>{msg.text}: <strong>EXPOSED</strong></span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
