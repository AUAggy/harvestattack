import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const questions = [
  {
    id: 'longLivedData',
    question: 'Does your organization handle data that must remain confidential beyond 2035?',
    examples: 'Medical records, legal documents, government secrets, R&D, financial records',
    critical: true,
  },
  {
    id: 'compliance',
    question: 'Are you subject to compliance frameworks with long retention requirements?',
    examples: 'HIPAA (50 years), SEC (7+ years), GDPR, PCI DSS, government contracts',
    critical: true,
  },
  {
    id: 'transmitSensitive',
    question: 'Do you transmit sensitive data over TLS/HTTPS today?',
    examples: 'API communications, web apps, internal services, partner integrations',
    critical: false,
  },
  {
    id: 'storedKeys',
    question: 'Do you store long-lived secrets or credentials?',
    examples: 'API keys, service passwords, encryption keys, certificates',
    critical: false,
  },
  {
    id: 'adversaryTarget',
    question: 'Does your organization operate in a sector typically targeted by nation-states?',
    examples: 'Defense, critical infrastructure, government contractors, advanced research, financial services',
    critical: true,
  },
];

export default function SelfAssessment() {
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (id: string, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const calculateRisk = () => {
    const criticalYes = questions.filter((q) => q.critical && answers[q.id] === true).length;
    const totalYes = Object.values(answers).filter((v) => v === true).length;

    if (criticalYes >= 2 || totalYes >= 4) {
      return { level: 'high', label: 'HIGH PRIORITY', color: 'text-destructive' };
    } else if (criticalYes >= 1 || totalYes >= 2) {
      return { level: 'medium', label: 'MODERATE PRIORITY', color: 'text-yellow-400' };
    } else if (totalYes >= 1) {
      return { level: 'low', label: 'LOW PRIORITY', color: 'text-blue-400' };
    } else {
      return { level: 'minimal', label: 'MINIMAL RISK', color: 'text-green-400' };
    }
  };

  const allAnswered = questions.every((q) => answers[q.id] !== undefined && answers[q.id] !== null);
  const risk = allAnswered ? calculateRisk() : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-bold text-foreground mb-2">Do You Need to Care?</h3>
        <p className="text-sm text-muted-foreground">
          Answer these questions to assess your organization's quantum risk exposure.
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + idx * 0.1 }}
            className="p-4 rounded-lg bg-card border border-border"
          >
            <div className="flex items-start gap-2 mb-2">
              {q.critical && <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />}
              <p className="text-sm font-semibold text-foreground flex-1">{q.question}</p>
            </div>
            <p className="text-xs text-muted-foreground mb-3 ml-6">{q.examples}</p>
            <div className="flex gap-2 ml-6">
              <button
                onClick={() => handleAnswer(q.id, true)}
                className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                  answers[q.id] === true
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => handleAnswer(q.id, false)}
                className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                  answers[q.id] === false
                    ? 'bg-secondary border-border text-foreground'
                    : 'border-border text-muted-foreground hover:border-border hover:text-foreground'
                }`}
              >
                No
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {allAnswered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-6 bg-card rounded-lg border-2 border-primary"
        >
          <div className="text-center">
            <div className={`text-2xl font-bold ${risk?.color} mb-2`}>
              {risk?.label}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {risk?.level === 'high' && 'You should begin planning PQC migration immediately. Your data is at significant risk from harvest attacks.'}
              {risk?.level === 'medium' && 'You should start researching PQC migration within the next 12-18 months.'}
              {risk?.level === 'low' && 'Keep monitoring quantum developments, but no immediate action required.'}
              {risk?.level === 'minimal' && 'Your organization has minimal quantum threat exposure at this time.'}
            </p>
            {(risk?.level === 'high' || risk?.level === 'medium') && (
              <Button
                onClick={() => setShowResults(true)}
                className="mt-2"
              >
                See Recommended Actions
              </Button>
            )}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showResults && risk && (risk.level === 'high' || risk.level === 'medium') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/30"
          >
            <p className="text-sm font-semibold text-foreground mb-2">Recommended Next Steps:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Switch to the "Act" tab to see executive email templates and migration framework</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Check your CA's PQC support timeline (DigiCert ready now, Let's Encrypt Q3 2026)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Read NIST and CISA guidance (links in footer and Action Toolkit)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Audit systems transmitting sensitive data since 2020-2022</span>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
