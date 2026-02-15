import { motion } from 'framer-motion';
import { Clock, AlertCircle } from 'lucide-react';

interface Props {
  currentYear: number;
}

export default function CostOfWaiting({ currentYear }: Props) {
  const calculateImpact = (startYear: number) => {
    const migrationMonths = 18;
    const completionYear = startYear + Math.ceil(migrationMonths / 12);
    const harvestedYears = startYear - 2026;
    const rsaBreakYear = 2035;
    const exposedUntilMigration = completionYear > rsaBreakYear;

    let severity: 'safe' | 'warning' | 'danger' | 'critical';
    let message: string;

    if (startYear <= 2026) {
      severity = 'safe';
      message = `✅ Protected before RSA likely breaks. Minimal data exposure.`;
    } else if (startYear <= 2030) {
      severity = 'warning';
      message = `⚠️ ${harvestedYears} years of data harvested, but migration completes before estimated break date.`;
    } else if (startYear < 2035) {
      severity = 'danger';
      message = `❌ ${harvestedYears} years harvested. Completes ${completionYear}, ${completionYear > rsaBreakYear ? 'after' : 'just before'} estimated RSA break.`;
    } else {
      severity = 'critical';
      message = `⚠️ All data from 2026-${startYear} will likely be decryptable when quantum computers arrive.`;
    }

    return {
      completionYear,
      harvestedYears,
      exposedUntilMigration,
      severity,
      message,
    };
  };

  const scenarios = [
    { label: 'Start Now (2026)', year: 2026 },
    { label: 'Wait 2 Years (2028)', year: 2028 },
    { label: 'Wait 5 Years (2031)', year: 2031 },
    { label: 'Wait Until Broken (2035)', year: 2035 },
  ];

  const severityColors = {
    safe: 'bg-green-500/20 border-green-500/50 text-green-400',
    warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
    danger: 'bg-orange-500/20 border-orange-500/50 text-orange-400',
    critical: 'bg-red-500/20 border-red-500/50 text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">Cost of Waiting</h3>
      </div>
      <div className="space-y-3">
        {scenarios.map((s) => {
          const result = calculateImpact(s.year);
          return (
            <motion.div
              key={s.year}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + scenarios.indexOf(s) * 0.1 }}
              className={`p-4 rounded-lg border-2 ${severityColors[result.severity]}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-sm">{s.label}</span>
                <span className="text-xs font-mono bg-background/50 px-2 py-0.5 rounded">
                  Done by {result.completionYear}
                </span>
              </div>
              <p className="text-xs leading-relaxed">{result.message}</p>
              {result.harvestedYears > 0 && (
                <div className="mt-2 text-xs opacity-75">
                  📊 Data exposure: {result.harvestedYears} year{result.harvestedYears !== 1 ? 's' : ''} worth of encrypted traffic harvested
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/30 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">Key Insight</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Migration typically takes 12-18+ months. Every year you delay means another year of harvested data.
            Once encrypted data is recorded, it cannot be un-recorded. <strong className="text-foreground">Earlier is better.</strong>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
