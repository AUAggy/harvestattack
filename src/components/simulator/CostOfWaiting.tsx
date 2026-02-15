import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

export default function CostOfWaiting() {
  const [startYear, setStartYear] = useState(2026);

  const migrationMonths = 18;
  const completionYear = startYear + Math.ceil(migrationMonths / 12);
  const harvestedYears = startYear - 2026;
  const rsaBreakYear = 2035;

  let severity: 'safe' | 'warning' | 'danger' | 'critical';
  let headline: string;
  let detail: string;

  if (startYear <= 2026) {
    severity = 'safe';
    headline = 'Minimal exposure';
    detail = 'You finish migrating by 2028, well before RSA is estimated to break. Almost no data is harvested.';
  } else if (startYear <= 2030) {
    severity = 'warning';
    headline = `${harvestedYears} years of data exposed`;
    detail = `Adversaries harvest ${harvestedYears} years of your encrypted traffic. You finish by ${completionYear}, still before the estimated RSA break date.`;
  } else if (startYear < 2035) {
    severity = 'danger';
    headline = `${harvestedYears} years of data exposed`;
    detail = `${harvestedYears} years of harvested traffic. Migration completes ${completionYear}, ${completionYear > rsaBreakYear ? 'after' : 'right at'} the estimated RSA break. High risk.`;
  } else {
    severity = 'critical';
    headline = `${harvestedYears}+ years fully compromised`;
    detail = `All data from 2026 to ${startYear} is likely decryptable. Migration does not complete until ${completionYear}, years after RSA breaks.`;
  }

  const severityConfig = {
    safe: { bar: 'bg-green-600', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
    warning: { bar: 'bg-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
    danger: { bar: 'bg-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800' },
    critical: { bar: 'bg-red-600', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
  };

  const colors = severityConfig[severity];
  const exposurePercent = Math.min((harvestedYears / 14) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-card rounded-xl border border-border p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">Cost of Waiting</h3>
      </div>

      {/* Slider */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">
          When will you start migrating?
        </label>
        <input
          type="range"
          min={2026}
          max={2040}
          value={startYear}
          onChange={(e) => setStartYear(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary bg-secondary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>2026 (now)</span>
          <span>2030</span>
          <span>2035</span>
          <span>2040</span>
        </div>
      </div>

      {/* Year display */}
      <div className="text-center mb-6">
        <span className="font-mono text-3xl font-bold text-foreground">{startYear}</span>
        <p className="text-xs text-muted-foreground mt-1">
          Migration complete by {completionYear}
        </p>
      </div>

      {/* Result card */}
      <div className={`rounded-lg border p-4 ${colors.bg} ${colors.border}`}>
        <p className={`font-semibold text-sm ${colors.text}`}>{headline}</p>
        <p className="text-sm text-foreground/80 mt-1 leading-relaxed">{detail}</p>

        {/* Exposure bar */}
        {harvestedYears > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Data exposure</span>
              <span>{harvestedYears} year{harvestedYears !== 1 ? 's' : ''}</span>
            </div>
            <div className="h-2 bg-white/60 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${colors.bar}`}
                initial={{ width: 0 }}
                animate={{ width: `${exposurePercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Key insight */}
      <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
        Migration takes 12–18+ months. Every year you wait means another year of harvested data that can never be un-recorded.
      </p>
    </motion.div>
  );
}
