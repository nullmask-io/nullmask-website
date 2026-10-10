# Backend Services

All backend services are Fastify applications running on Node.js 24.

## RPC Proxy

The core orchestration service. Intercepts JSON-RPC calls from wallets.

**Key responsibilities:**

* Parse transaction intent
* Select funding notes
* Generate ZK proofs
* Submit to relayer
* Maintain per-user state (LMDB)

**Internal services:**

* `ShieldingService` — Orchestrates proof generation and relayer submission
* `NoteTreeService` — Local Merkle tree for membership proofs
* `NotesScanner` — Background scan of blockchain events
* `NotesStorage` — Per-user note storage (LMDB)
* `KeyStorageService` — Per-user key storage
* `KeyRegistryService` — Syncs on-chain key registry
* `GasEstimateService` — Pre-computed gas estimates
* `ExchangeRatesService` — Token price conversion for fee estimation
* `AccessTableService` — Maps access tokens to addresses

**State persistence:** LMDB database at `apps/rpc-proxy/lmdb-data/`

## Relayer

Submits shielded transactions to the blockchain.

**Key responsibilities:**

* Receive proof + params from the proxy
* Submit contract calls (`shieldedTransfer`, `shieldedWithdrawal`, `shieldedSwap`)
* Pay gas fees (reimbursed from transaction fee allocation)
* Return transaction receipt

## Guard

Approves or rejects deposits into the privacy pool.

**Key responsibilities:**

* Monitor `DepositPending` events
* Screen depositor addresses
* Call `approveDeposit()` or `rejectDeposit()`
* Generate and publish revocation keys

## Faucet

Distributes testnet funds.

**Key responsibilities:**

* Provide testnet ETH and ERC-20 tokens
* Active only on testnet deployments
* Used during onboarding flow

## Explorer

Block explorer for the Nullmask network. Displays public on-chain data.

## Running Individual Services

```bash
cd web

# All services
pnpm dev

# Individual services
pnpm --filter rpc-proxy dev
pnpm --filter relayer dev
pnpm --filter guard dev
pnpm --filter faucet dev
pnpm --filter app dev
pnpm --filter explorer dev
```
