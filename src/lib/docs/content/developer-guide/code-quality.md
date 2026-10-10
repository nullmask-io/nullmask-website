# Code Quality

## CI Pipeline

The full CI suite runs:

```bash
pnpm run ci    # audit + biome ci + typecheck + decluttercheck
```

## Linting and Formatting

Nullmask uses [Biome](https://biomejs.dev/) for linting and formatting.

```bash
pnpm lintcheck    # Check for issues
pnpm format       # Auto-format files
```

## Type Checking

```bash
pnpm typecheck    # TypeScript type check across all packages
```

Uses TypeScript 5.9 with strict mode.

## Dead Code Detection

```bash
pnpm decluttercheck    # Runs knip
```

[Knip](https://knip.dev/) detects unused exports, dependencies, and files across the monorepo.

## Logging Rules

* All code in `apps/` and `packages/` must use `logger.*` from `@nullmask/logger`
* **Exception:** `web/apps/app` and `web/apps/explorer` (frontend apps) may use `console.log`
* For debugging, write to `/tmp/` files using `writeFileSync`

## Contract Compilation

After changing Solidity struct definitions:

```bash
cd contracts
npx hardhat clean && npx hardhat compile
```

This prevents stale ABI artifacts from causing silent encoding mismatches.

## ABI Regeneration

When contract interfaces change, regenerate the TypeScript ABI:

1. Compile contracts: `npx hardhat compile`
2. Update `web/packages/noir/src/generated/nullmask-abi.ts` from compiled artifacts
3. Ensure `as const` assertion is present for viem type inference

## Circuit Bindings

After modifying Noir circuits:

```bash
./build-circuits.sh
```

This regenerates:

* Solidity verifiers (`contracts/contracts/`)
* TypeScript FFI bindings (`web/packages/noir/src/generated/noir_ffi.ts`)

Both files are generated — do not edit manually.
