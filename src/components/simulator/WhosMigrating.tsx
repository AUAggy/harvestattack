import { motion } from 'framer-motion';
import { Building2, ExternalLink } from 'lucide-react';

const examples = [
  {
    org: 'U.S. Federal Government (NSA/CISA)',
    deadline: '2030-2033',
    status: 'In Progress',
    detail: 'CNSA 2.0 mandate requires all national security systems to use PQC by 2033',
    link: 'https://www.cisa.gov/quantum',
  },
  {
    org: 'Google',
    deadline: '2024-2026',
    status: 'Deployed',
    detail: 'Chrome 131+ supports ML-KEM-768 in TLS 1.3. Gmail using hybrid encryption.',
    link: 'https://security.googleblog.com/2024/09/a-new-path-for-kyber-on-web.html',
  },
  {
    org: 'Cloudflare',
    deadline: '2024-2025',
    status: 'Deployed',
    detail: 'All edge servers support post-quantum key exchange',
    link: 'https://blog.cloudflare.com/post-quantum-tunnel/',
  },
  {
    org: 'Signal Messenger',
    deadline: '2023-2024',
    status: 'Deployed',
    detail: 'PQXDH protocol (hybrid X25519 + Kyber) deployed to 100M+ users',
    link: 'https://signal.org/blog/pqxdh/',
  },
  {
    org: 'Apple',
    deadline: '2024',
    status: 'Deployed',
    detail: 'iMessage PQ3 protocol launched February 2024 for all devices',
    link: 'https://security.apple.com/blog/imessage-pq3/',
  },
  {
    org: 'Zoom',
    deadline: '2024-2025',
    status: 'Deployed',
    detail: 'Post-quantum E2EE available for all users with Zoom Workplace',
    link: 'https://www.zoom.com/en/blog/guide-to-post-quantum-end-to-end-encryption/',
  },
  {
    org: 'Ethereum Foundation',
    deadline: '2025-2028',
    status: 'Research',
    detail: 'Researching quantum-resistant signatures for $300B+ network via account abstraction',
    link: 'https://ethereum.org/en/roadmap/security/',
  },
];

export default function WhosMigrating() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">Who's Already Migrating?</h3>
      </div>
      <div className="space-y-3">
        {examples.map((ex, idx) => (
          <motion.a
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + idx * 0.1 }}
            href={ex.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-4 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-secondary transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {ex.org}
                  </span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {ex.detail}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs font-mono text-primary">{ex.deadline}</div>
                <div className={`text-xs mt-1 px-2 py-0.5 rounded font-medium ${
                  ex.status === 'Deployed'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : ex.status === 'In Progress'
                    ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}>
                  {ex.status}
                </div>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
      <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/30">
        <p className="text-xs text-muted-foreground text-center">
          <strong className="text-foreground">These organizations understand:</strong> The threat is <strong className="text-primary">now</strong>, not later.
        </p>
      </div>
    </motion.div>
  );
}
