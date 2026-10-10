# Swapping

Shielded swaps execute Uniswap V2 token swaps within the privacy pool. Your trading activity is hidden from on-chain observers.

## Steps

1. Navigate to the **Swap** screen
2. Select the input token (From)
3. Select the output token (To)
4. The app checks if a valid Uniswap pair exists
5. Enter the input amount
6. The app fetches a quote showing the expected output
7. Optionally adjust slippage and deadline settings
8. Confirm the swap transaction in your wallet

## What Happens

1. The wallet signs a Uniswap V2 swap transaction
2. The proxy intercepts and generates a ZK proof
3. The contract verifies the proof
4. The contract executes the actual swap on Uniswap V2
5. The swap output is captured as a new note in the Merkle tree

## Swap Types

| From   | To     | Uniswap Function           |
| ------ | ------ | -------------------------- |
| ETH    | ERC-20 | `swapExactETHForTokens`    |
| ERC-20 | ETH    | `swapExactTokensForETH`    |
| ERC-20 | ERC-20 | `swapExactTokensForTokens` |

## Output Notes

Each swap creates 3 notes:

| Note             | Contains                          |
| ---------------- | --------------------------------- |
| Swap output note | The tokens received from the swap |
| Change note      | Leftover input token balance      |
| Fee change note  | Leftover fee-asset balance        |

## Fee Handling

* If the fee token matches the swap input token, fees are deducted from the input pool
* If they differ (e.g., paying ETH fees for an ERC-20→ERC-20 swap), separate fee notes are required

### ERC-20 → ERC-20 Swaps

These generate 3 transaction entries in history:

1. One outgoing ERC-20 (input)
2. One incoming ERC-20 (output)
3. One outgoing ETH (fee)

## Slippage and Deadline

* **Slippage**: Minimum acceptable output (set via `amountOutMin`)
* **Deadline**: Maximum block timestamp for the swap to execute

Both are enforced by the Uniswap V2 router on-chain.
