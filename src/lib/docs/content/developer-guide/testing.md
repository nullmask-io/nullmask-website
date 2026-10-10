# Testing

## Integration Tests

Integration tests are in `web/tests/` and use Vitest.

### Prerequisites

All of the following must be running:

1. Hardhat node at `localhost:9000`
2. Contracts deployed
3. All web services (rpc-proxy, relayer, guard, faucet)
4. Caddy HTTPS reverse proxy

### Running Tests

```bash
# From web/ root
pnpm test

# From tests directory
cd tests && pnpm test

# Run a specific test
cd tests && pnpm test deposit.test.ts
```

### Test Idempotency

Tests are designed to be idempotent — they can run repeatedly without restarting services or clearing state. They handle:

* Accumulated LMDB data
* Previously registered on-chain receiving keys
* Notes from prior runs

No need to clear `apps/rpc-proxy/lmdb-data/` or redeploy contracts between test runs.

**Exception:** If the Hardhat node is restarted, run `./wipe-lmdb.sh` to erase cached LMDB data and restart web services.

## Contract Tests

Contract tests use the Node.js test runner with Hardhat v3 + viem.

```bash
cd contracts
npx hardhat test                      # Run all tests
npx hardhat test test/RoundTrip.ts    # Run a specific test
```

Key test files:

| File            | Coverage                                               |
| --------------- | ------------------------------------------------------ |
| `RoundTrip.ts`  | Complete deposit → shielded transfer → withdrawal flow |
| `MerkleTree.ts` | Merkle tree consistency between contract and JS        |
| `Notes.ts`      | Note encryption/decryption                             |
| `Deposit.ts`    | Deposit and guard approval flow                        |
| `Swap.ts`       | Shielded swap flow                                     |

### Important Note

After changing Solidity struct definitions, always clean before compiling:

```bash
npx hardhat clean && npx hardhat compile
```

Stale ABI artifacts cause silent encoding mismatches.

## Circuit Tests

```bash
cd circuits/lib
nargo test
```

Library tests verify cryptographic operations using pre-computed fixtures from `fixtures.nr`.

## Manual Testing Checklist

For a comprehensive manual testing flow covering all operations, see the [manual testing guide](https://github.com/user/nullmask/blob/main/manual-testing.md). The flow covers:

1. Onboarding (key generation, network switch, faucet, registration)
2. Deposits (ETH + ERC-20)
3. Swaps (ETH→ERC20, ERC20→ETH, ERC20→ERC20)
4. Withdrawals (ETH + ERC-20)
5. Shielded transfers (ETH + ERC-20)
6. Multi-device verification
