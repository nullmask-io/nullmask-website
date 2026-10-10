# Prerequisites

## Required Tools

| Tool                                                | Version                   | Purpose                          |
| --------------------------------------------------- | ------------------------- | -------------------------------- |
| [Node.js](https://nodejs.org/)                      | >= 24                     | Runtime for all services         |
| [pnpm](https://pnpm.io/)                            | >= 10.30.1                | Package manager for web monorepo |
| [Nargo](https://noir-lang.org/)                     | >= 1.0.0-beta.18          | Noir circuit compiler            |
| [bb](https://github.com/AztecProtocol/barretenberg) | >= 3.0.0-nightly.20260102 | Barretenberg prover              |

## Optional Tools

| Tool                                            | Purpose                                           |
| ----------------------------------------------- | ------------------------------------------------- |
| [Caddy](https://caddyserver.com/)               | Local HTTPS reverse proxy (required for frontend) |
| [mkcert](https://github.com/FiloSottile/mkcert) | Generate trusted local SSL certificates           |

## Quick Start

```bash
# 1. Build circuits (generates Solidity verifiers + TS bindings)
./build-circuits.sh

# 2. Start the Hardhat node
cd contracts
npm install && npm run start

# 3. Deploy contracts (separate terminal)
cd contracts
npm run deploy

# 4. Start all web services
cd web
pnpm install
cp .env.example .env
set -a
source .env
set +a
pnpm dev                              # All apps & services

# 5. Set up HTTPS
# See local-setup.md for Ophiuchi (macOS) or Caddy (Linux).
```

The frontend URL is `https://app.nm.local` with Ophiuchi or `https://nullmask.local.dev` with Caddy. See [Local Setup](/docs/developer-guide/local-setup).
