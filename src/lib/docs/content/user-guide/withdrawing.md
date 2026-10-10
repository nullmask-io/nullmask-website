# Withdrawing

Withdrawals move funds from your shielded balance to any Ethereum address on the base chain.

## Steps

1. Navigate to the **Unshield** tab on the Shield screen
2. Select the token
3. Enter the amount
4. Enter the destination address (or click "Use My Wallet" for your own address)
5. Confirm the transaction in your wallet

## What Happens

1. The wallet signs a transfer to the destination address
2. The proxy detects the recipient has no registered receiving key → withdrawal
3. A ZK proof is generated
4. The relayer submits the proof to the contract
5. The contract verifies the proof and sends funds directly to the destination address

## Key Differences from Sending

| Aspect                     | Send                           | Withdraw                    |
| -------------------------- | ------------------------------ | --------------------------- |
| Recipient                  | Must be registered on Nullmask | Any Ethereum address        |
| Funds remain in pool       | Yes (as encrypted notes)       | No (transferred to address) |
| Recipient address on-chain | Hidden                         | Visible                     |
| Transfer amount on-chain   | Hidden                         | Visible                     |

## Privacy Considerations

* The withdrawal recipient address and amount are **public** on-chain
* Use a fresh, unlinkable address for withdrawals to maximize privacy
* You cannot withdraw to addresses that are registered on Nullmask (this is by design — use Send instead)

## Output Notes

A withdrawal creates 2 notes (for your change):

| Note            | Contains                      |
| --------------- | ----------------------------- |
| Change note     | Leftover action-asset balance |
| Fee change note | Leftover fee-asset balance    |

Plus a direct transfer of the withdrawal amount to the destination address.

## ETH vs ERC-20 Withdrawals

* **ETH**: Sent via low-level `call{value: amount}("")`
* **ERC-20**: Sent via `safeTransfer` from the contract's token balance
