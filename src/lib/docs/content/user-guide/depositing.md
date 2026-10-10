# Depositing

Deposits move funds from your public wallet balance into the Nullmask shielded pool.

## Steps

1. Navigate to the **Shield** screen
2. Select the token (ETH or ERC-20)
3. Enter the amount
4. If your wallet is on the wrong network, you'll be prompted to switch to the base chain (e.g., Ethereum Mainnet)
5. For ERC-20 tokens, approve the token allowance if needed
6. Confirm the deposit transaction in your wallet

## What Happens

1. Your wallet sends a `deposit()` transaction to the Nullmask contract on the base chain
2. The transaction includes the deposit amount plus a small gas escrow (to cover the guard's gas costs)
3. The deposit enters a **pending** state
4. The guard service screens your address
5. Once approved, a note is created in the Merkle tree representing your shielded balance
6. The deposit appears in your shielded balance (typically within 15-30 seconds)

## Deposit Statuses

| Status   | Description                        |
| -------- | ---------------------------------- |
| Pending  | Awaiting guard review              |
| Approved | Note added to Merkle tree          |
| Rejected | Funds refunded to depositor        |
| Reverted | Depositor withdrew pending deposit |

## ERC-20 Deposits

For ERC-20 tokens:

1. The app checks if the contract has sufficient allowance
2. If not, you'll be prompted to approve the token
3. The deposit transfers tokens via `safeTransferFrom`
4. Fee-on-transfer tokens are supported — the actual deposited amount is measured via balance delta

## Gas Escrow

Each deposit includes a small ETH gas escrow sent alongside the deposit. This escrow:

* Pays the guard's gas costs for approving or rejecting the deposit
* Is paid to the guard regardless of the outcome
* Is refunded if you withdraw a pending deposit

## Withdrawing a Pending Deposit

If your deposit is still pending (not yet approved or rejected), you can withdraw it:

* Call `withdrawPendingDeposit()` on the contract
* Both the deposit amount and gas escrow are refunded
