import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, ClipboardCheck, Rocket, ArrowRight } from 'lucide-react';

const journeyCards = [
  {
    to: '/understand',
    icon: Eye,
    title: 'Understand the Threat',
    description: 'See a live simulation of how encrypted data is harvested today and decrypted tomorrow.',
  },
  {
    to: '/assess',
    icon: ClipboardCheck,
    title: 'Assess Your Risk',
    description: 'Find out how exposed your organization is with an honest self-assessment.',
  },
  {
    to: '/act',
    icon: Rocket,
    title: 'Take Action',
    description: 'Get a migration roadmap, email templates, and real tools to protect your data.',
  },
];

const migrators = ['Google', 'Apple', 'Signal', 'Cloudflare', 'Zoom', 'U.S. Government'];

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      {/* Hero */}
      <section className="py-20 sm:py-28 text-center max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight leading-tight"
        >
          Your Encrypted Data Is Being{' '}
          <span className="text-primary">Recorded Right Now</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 text-lg text-muted-foreground leading-relaxed"
        >
          Nation-state adversaries are capturing your encrypted traffic today, waiting for quantum
          computers to decrypt it tomorrow. This is called a "harvest now, decrypt later" attack
          — and it's already happening.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            to="/understand"
            className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity text-base"
          >
            See How It Works
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* Journey Cards */}
      <section className="pb-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {journeyCards.map((card, i) => (
          <motion.div
            key={card.to}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <Link
              to={card.to}
              className="block bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow group"
            >
              <card.icon className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
              <span className="inline-flex items-center gap-1 mt-4 text-sm text-primary font-medium group-hover:gap-2 transition-all">
                Explore <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* Social Proof */}
      <section className="py-12 border-t border-border text-center">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Already migrating to post-quantum cryptography
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          {migrators.map((name) => (
            <span key={name} className="text-sm font-medium text-foreground/60">{name}</span>
          ))}
        </div>
      </section>

      {/* Feynman Quote */}
      <section className="py-16 text-center max-w-2xl mx-auto">
        <blockquote className="text-lg sm:text-xl italic text-foreground/80 leading-relaxed">
          "If you can't explain it simply, you don't understand it well enough."
        </blockquote>
        <p className="mt-3 text-sm text-muted-foreground">— Richard Feynman</p>
      </section>
    </div>
  );
}
