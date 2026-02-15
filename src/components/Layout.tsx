import { NavLink, Outlet } from 'react-router-dom';
import { Zap, Eye, BookOpen, ClipboardCheck, Rocket, Share2 } from 'lucide-react';

const navItems = [
  { to: '/understand', label: 'Simulate', icon: Eye },
  { to: '/learn', label: 'Learn', icon: BookOpen },
  { to: '/assess', label: 'Assess', icon: ClipboardCheck },
  { to: '/act', label: 'Act', icon: Rocket },
  { to: '/share', label: 'Share', icon: Share2 },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground text-sm">HarvestAttack</span>
          </NavLink>
          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Learn more about post-quantum cryptography
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <a href="https://www.nist.gov/pqcrypto" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              NIST PQC Standards
            </a>
            <a href="https://www.cisa.gov/quantum" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              CISA Guidance
            </a>
            <a href="https://media.defense.gov/2022/Sep/07/2003071834/-1/-1/0/CSA_CNSA_2.0_ALGORITHMS_.PDF" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              NSA CNSA 2.0
            </a>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Built with the Feynman Technique. Understand quantum threats one concept at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}
