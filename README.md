# Repository Architecture Guardrails

This repo enforces simple architectural rules to prevent accidental coupling between layers.

Rules enforced (only within `backend/core`):
- Core MUST NOT import anything from `adapters`.
- Core MUST NOT access `process.env` directly.

How it works:
- ESLint is configured in `.eslintrc.cjs` to apply two rules to files under `backend/core`:
  - `no-restricted-imports` blocks any import whose path matches `**/adapters/**`.
  - `no-restricted-properties` blocks property access of `process.env`.
- The root `package.json` exposes a script that fails the build on any violation.

Run the architecture lint locally:

```bash
bun install
bun run lint:architecture
```

CI integration:
- The root `test` script runs `lint:architecture`. Configure your CI to execute `bun run test` (or `bun run lint:architecture`) and fail the job on non‑zero exit.

Rationale:
- `core` is business logic and must be framework- and environment-agnostic. Environment/configuration should flow in via the adapters/infra layers rather than `process.env`.
