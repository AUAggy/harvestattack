# HarvestAttack

An educational site about the "harvest now, decrypt later" concern. It explains:

1. How an attacker who records encrypted traffic today keeps that copy.
2. How migrating to post-quantum cryptography protects later transmissions, but cannot change a copy already recorded.
3. How confidentiality lifetime and a hypothetical attacker capability shape the planning problem.
4. How to collect evidence about real systems and choose the next test.

## What this site does not do

- No prediction of when a quantum computer will break any algorithm.
- No risk scores, readiness percentages, or compliance verdicts.
- No inspection of your connection, no detection of interception, no data collection. Everything you type stays in your browser unless you deliberately export it.

## Development

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # Strict TypeScript check
npm test             # Run tests
npm run test:watch   # Tests in watch mode
```

## Architecture

- `src/domain/` — pure cohort model and boundary fixtures. No UI, no browser APIs, deterministic.
- `src/content/` — versioned claim and source registries with review dates.
- `src/state/` — in-memory session shared across routes. Optional local saving is opt-in.
- `src/lib/` — worksheet contracts, deterministic suggestions, briefing snapshot and formatters.
- `src/pages/`, `src/components/` — route shells and features.

## Content rules

Every volatile claim has a stable ID, scoped statement, primary source, and review dates in `src/content/claims.ts`. Claims render their checked status at the point of use. See `/sources` on the site and `plans/` in the repository for the review documents that drove this design.
