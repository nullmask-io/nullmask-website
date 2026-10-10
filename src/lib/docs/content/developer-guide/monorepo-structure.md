# Monorepo Structure

The `web/` directory is a Turborepo monorepo managed with pnpm.

## Directory Layout

```
web/
├── apps/
│   ├── app/              # Next.js 15 frontend
│   ├── explorer/         # Block explorer
│   ├── rpc-proxy/        # JSON-RPC interceptor
│   ├── relayer/          # Private tx relayer
│   ├── guard/            # Deposit approval service
│   └── faucet/           # Testnet faucet
│
├── packages/
│   ├── noir/                     # ZK circuit bindings, note encryption, contract ABI
│   ├── nullmask-rpc/             # Framework-agnostic core: shielding logic, storage interfaces
│   ├── nodejs-nullmask-services/ # Node.js implementations: LMDB storage, Noir provers
│   ├── rpc-handler/              # JSON-RPC handler utilities
│   ├── design-system/            # shadcn/ui component library
│   ├── core-ui/                  # Nullmask-specific UI components
│   ├── wallet-management/        # Wallet connection (Wagmi/Reown)
│   ├── interfaces/               # Shared TypeScript types
│   ├── logger/                   # Structured logging
│   └── utils/                    # Shared utilities
│
├── tests/                # Integration tests (Vitest)
├── pnpm-workspace.yaml   # Workspace config + catalog deps
└── turbo.json            # Turborepo pipeline config
```

## Key Patterns

### Catalog Dependencies

Common dependency versions are centralized in `pnpm-workspace.yaml` under `catalog:`. Use `catalog:` in `package.json` for shared dependencies:

```json
{
  "dependencies": {
    "viem": "catalog:"
  }
}
```

### Conditional Exports

Packages use conditional exports with the `development` condition for hot-reload during development. Backend services run with `--conditions=development`.

### State Management

The RPC proxy maintains per-user encrypted state via Fastify cookies. Each user has isolated notes storage and key storage. State persistence uses LMDB.

### Logging

All code in `apps/` and `packages/` must use `logger.*` instead of `console.*`. Import from the `@nullmask/logger` package. Exception: `web/apps/app` and `web/apps/explorer` (frontend apps) may use `console.log`.

## Commands

```bash
pnpm dev              # Run all services in development mode
pnpm build            # Build all packages
pnpm typecheck        # Type check all packages
pnpm lintcheck        # Lint check (Biome)
pnpm format           # Auto-format files
pnpm run ci           # Full CI suite (audit + biome + typecheck + decluttercheck)
pnpm decluttercheck   # Dead code detection (knip)
```
