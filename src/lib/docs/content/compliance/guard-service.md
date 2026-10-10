# Guard Service

The guard is a backend service that monitors and approves deposits into the Nullmask privacy pool.

## Responsibilities

1. **Monitor** `DepositPending` events on the Nullmask contract
2. **Screen** depositor addresses using chain analysis tools
3. **Approve** legitimate deposits by calling `approveDeposit()`
4. **Reject** flagged deposits by calling `rejectDeposit()`
5. **Publish** revocation keys with each approved deposit

## Guard Address

The guard is a privileged address set in the contract's state. Only the guard can call `approveDeposit()` and `rejectDeposit()`.

The guard address can be changed by:

* The current guard (via `setGuard()`)
* The upgrade controller admin (via `setGuard()`)

## Approval Flow

When approving a deposit, the guard provides:

```solidity
function approveDeposit(
    uint256 index,
    address recipient,
    address token,
    uint256 amount,
    address depositor,
    uint256 gasEscrow,
    uint256 revocationPublicKeyX,    // Compliance key
    uint256 revocationPublicKeyY,    // Compliance key
    uint256 revocationPublicKeyHash  // Used as value_trapdoor
) external
```

The contract validates the deposit data against the stored hash to prevent the guard from approving modified deposit parameters.

## Gas Escrow

The guard receives the gas escrow from each deposit it processes (whether approved or rejected). This covers the guard's gas costs for the on-chain transaction.

## Running the Guard

```bash
cd web
pnpm --filter guard dev
```

The guard service runs as a Fastify application and connects to the Nullmask contract to monitor events.
