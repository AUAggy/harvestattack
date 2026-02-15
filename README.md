# HarvestAttack.com

**Post-Quantum Cryptography (PQC) Educational Tool**

Interactive tool that visualizes the "harvest now, decrypt later" threat and provides actionable guidance for migrating to quantum-safe cryptography.

Live at: [harvestattack.com](https://harvestattack.com)

## What It Does

### Interactive Simulation
Visualize how adversaries record encrypted traffic today and decrypt it when quantum computers arrive (~2035). Compare RSA-2048, X25519, and ML-KEM-768 Hybrid encryption across a 2026-2050 timeline.

### Education
- **Myth Busters**: Debunk common misconceptions about quantum threats
- **Who's Migrating**: Google, Cloudflare, Signal, Apple, Zoom, U.S. Government
- **Cost of Waiting**: Slider-driven visualization of migration delay impact
- **Bitcoin/ECDSA**: $2.4T threat to digital signatures

### Self-Assessment
Five questions to determine your organization's quantum risk exposure and priority level.

### Action Toolkit
- Executive email template for budget approval
- 4-phase migration framework
- Certificate authority PQC support matrix
- Links to NIST, CISA, and NSA guidance

### Share
Briefing text explaining the threat, who has acted, and concrete next steps. Copy, email, or download.

## The Threat

### Encryption (TLS/HTTPS)
Adversaries are recording encrypted TLS traffic today to decrypt it when quantum computers become available (~2035). This is not a future threat. The harvesting is happening now.

### Digital Signatures (Code Signing, SSH, Cryptocurrency)
Quantum computers will also break ECDSA signatures used for code signing, SSH keys, API authentication, and cryptocurrency ($2.4T in Bitcoin alone). Blockchain transactions are permanently public and cannot be retracted after quantum computers arrive.

If your data or signatures must remain secure beyond 2035, you are already exposed.

## Quick Start

```bash
npm install
npm run dev       # http://localhost:8080
npm run build     # Production build
npm test          # Run tests
```

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS + Framer Motion
- **Routing**: React Router v6
- **Testing**: Vitest + Testing Library

## Project Structure

```
src/
├── pages/
│   ├── Home.tsx              # Landing page
│   ├── Understand.tsx        # Interactive simulation
│   ├── Learn.tsx             # Educational content
│   ├── Assess.tsx            # Risk self-assessment
│   ├── Act.tsx               # Migration toolkit
│   └── Share.tsx             # Shareable briefing
├── components/
│   ├── Layout.tsx            # Shared nav + footer
│   ├── simulator/            # All feature components
│   └── ui/                   # shadcn/ui primitives
└── lib/
    ├── simulation-data.ts    # Encryption types & qubit projections
    └── utils.ts
```

## License

MIT
