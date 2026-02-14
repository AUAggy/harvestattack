# HarvestAttack.com

**Complete Post-Quantum Cryptography (PQC) Readiness Guide**

Interactive educational tool that visualizes the "Harvest Now, Decrypt Later" threat and provides actionable guidance for migrating to quantum-safe cryptography.

🌐 **Live at: [harvestattack.com](https://harvestattack.com)**

## What It Does

### 🎯 Interactive Simulation
Visualize how adversaries record encrypted traffic today and decrypt it when quantum computers arrive (~2035). Compare RSA-2048, X25519, and ML-KEM-768 Hybrid encryption across a 2026-2050 timeline.

### 📚 Educational Content
- **Myth Busters**: Debunk common misconceptions about quantum threats (including cryptocurrency/signature vulnerabilities)
- **Real Examples**: See who's already migrating (Google, Cloudflare, Signal, Ethereum, U.S. Government, Zoom)
- **Cost Calculator**: Understand the impact of delaying migration

### 📊 Self-Assessment
Simple yes/no questions to determine your organization's quantum risk exposure and priority level.

### 🎯 Action Toolkit
- **Executive Email Template**: Copy-paste ready budget approval materials
- **Migration Phases**: 4-phase implementation framework
- **CA Support Matrix**: Which certificate authorities support PQC and when
- **Resource Links**: Official NIST, CISA, and technical guidance
- **Cryptocurrency Context**: Understand $2.4T threat to ECDSA signatures (Bitcoin, code signing, SSH)

### 🔗 Share & Export
Export scenarios to educate your team and convince executives of the urgency.

## The Threat

### Encryption (TLS/HTTPS)
Sophisticated adversaries are recording encrypted TLS traffic **TODAY** to decrypt it when quantum computers become available (~2035). This is not a future threat—it's happening **right now**.

### Digital Signatures (Code Signing, SSH, Cryptocurrency)
Quantum computers will also break ECDSA signatures used for code signing, SSH keys, API authentication, and cryptocurrency ($2.4T in Bitcoin alone). Unlike encrypted traffic, blockchain transactions are permanently public—they can't be "un-published" after quantum computers arrive.

If your data or signatures must remain secure beyond 2035, you're already exposed.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (http://localhost:8080)
npm run dev

# Build for production
npm run build

# Run tests
npm test
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
│   └── Index.tsx           # Main application page
├── components/
│   ├── simulator/          # Simulation & educational components
│   │   ├── SimulationCanvas.tsx
│   │   ├── TimeSlider.tsx
│   │   ├── MythBusters.tsx
│   │   ├── WhosMigrating.tsx
│   │   ├── CostOfWaiting.tsx
│   │   ├── SelfAssessment.tsx
│   │   ├── ActionToolkit.tsx
│   │   └── ShareExport.tsx
│   └── ui/                 # shadcn/ui primitives
└── lib/
    ├── simulation-data.ts  # Encryption types & qubit projections
    └── utils.ts
```

## Key Features

### Simulation
- Real-time message interception visualization
- Time slider from 2026-2050
- Scenario presets (RSA breaks, X25519 vulnerable, ML-KEM safe)
- Guided tour for first-time users

### Education
- Transparent risk formulas (no black boxes)
- Links to official resources (NIST, CISA)
- Real-world migration examples
- Debunks common myths

### Action
- No AI theater or false precision
- Honest about uncertainties
- Copy-paste ready materials
- Clear next steps

## Why This Approach?

This tool focuses on **education and persuasion**, not fake planning. We don't pretend to know your infrastructure or give false precision ("16 weeks, $50K"). Instead, we:

1. **Visualize the abstract threat** (make it concrete)
2. **Provide honest education** (transparent formulas, real examples)
3. **Enable action** (executive templates, migration framework, resources)

## Development

```bash
npm run dev          # Dev server with HMR
npm run build        # Production build
npm run lint         # ESLint
npm test             # Run tests
npm run test:watch   # Tests in watch mode
```

## Use Cases

- **Security teams**: Educate stakeholders about quantum threats
- **Executives**: Understand why PQC migration budget is needed
- **Students**: Learn about post-quantum cryptography
- **Consultants**: Demonstrate harvest attacks to clients

## Philosophy

Following Richard Feynman's principle: **Be honest about what you know and don't know.**

We don't use AI to generate fake roadmaps. We don't give precise estimates without data. We make the invisible visible, then point you to real resources and honest frameworks.

## License

MIT
