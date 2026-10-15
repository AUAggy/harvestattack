import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Menu, X, Zap } from "lucide-react";

const navItems = [
  { to: "/understand", label: "Lesson" },
  { to: "/learn", label: "Concepts" },
  { to: "/assess", label: "Worksheet" },
  { to: "/act", label: "Actions" },
  { to: "/share", label: "Briefing" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {navItems.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </>
  );
}

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2" aria-label="HarvestAttack home">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold text-foreground">HarvestAttack</span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            <NavLinks />
          </nav>

          <button
            ref={triggerRef}
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm font-medium md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
            Menu
          </button>
        </div>

        {menuOpen && (
          <nav
            id="mobile-menu"
            aria-label="Main menu"
            className="border-t border-border bg-white px-4 py-2 md:hidden"
          >
            <NavLinks onNavigate={() => setMenuOpen(false)} />
          </nav>
        )}
      </header>

      <main id="main-content">
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-border py-10">
        <div className="container px-4 sm:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-md">
              <p className="text-sm font-medium text-foreground">About this site</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                HarvestAttack is a free educational tool. It explains how recorded traffic can be
                attacked later and what evidence helps you plan. It does not inspect your connection,
                detect interception, or assess any organization.
              </p>
            </div>
            <nav aria-label="Site information" className="flex flex-col gap-2 text-sm">
              <Link to="/sources" className="text-link hover:underline">
                Sources and claim status
              </Link>
              <Link to="/updates" className="text-link hover:underline">
                Updates and corrections
              </Link>
              <Link to="/share" className="text-link hover:underline">
                Briefing
              </Link>
            </nav>
          </div>
          <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
            Content is reviewed on a schedule shown on the Sources page. Each claim carries its own
            checked date. For real security decisions, consult a qualified professional who knows
            your systems.
          </p>
        </div>
      </footer>
    </div>
  );
}
