# Quantum Threat Simulator

Interactive visualization of the "Harvest Now, Decrypt Later" threat. Adversaries record encrypted traffic today and store it until quantum computers can break the encryption.

Users pick an encryption algorithm (RSA-2048, X25519, or ML-KEM-768 Hybrid), then scrub a timeline from 2026–2050 to see how advancing quantum computing threatens each one. Scenario presets and a guided tour help explain the concepts.

## Getting Started

```sh
npm install
npm run dev     # starts on http://localhost:8080
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (port 8080) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Run tests |

## Tech Stack

Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
