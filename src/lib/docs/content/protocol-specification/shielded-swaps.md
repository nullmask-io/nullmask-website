# Shielded Swaps

A shielded swap executes a Uniswap V2 swap within the privacy pool. The sender's identity is hidden from on-chain observers.

## How It Works

1. The user signs a swap transaction targeting the Uniswap V2 router address
2. The proxy detects the Uniswap function selector in the transaction data
3. The proxy selects funding notes and generates a swap proof
4. The contract verifies the proof, executes the on-chain swap, and creates an output note with the received amount

## Circuit Verification

The shielded swap circuit verifies the same checks as a transfer (signature, note spending, balance equation), plus:

* The swap recipient equals the sender's address (prevents proxy from redirecting outputs)
* The Uniswap function selector is valid
* A half-encrypted output note is correctly constructed for the swap output

## Public Inputs (50 fields)

```rust
ShieldedSwap {
    noteNullifiers: [Field; 6],          // 6
    txNullifier: Field,                  // 1
    root: Field,                         // 1
    noteChangeCommitment: Field,         // 1
    noteFeeChangeCommitment: Field,      // 1
    selector: Field,                     // 1 — Uniswap function selector
    routerArgs: SwapRouterArgs {         // 7
        amountIn: Field,
        amountOutMin: Field,
        path: [Field; 4],               // Token addresses (padded to 4)
        pathLength: Field,
        deadline: Field,
    },
    receivingKeyCommitment: Field,       // 1 — Poseidon2(rk_hash, trapdoor)
    ciphertextChange: [Field; 9],        // 9
    ciphertextFeeChange: [Field; 9],     // 9
    ciphertextSwap: [Field; 6],          // 6 — half-encrypted swap output
    gasFee: GasFee,                      // 3
    nullifiersHash: Field,               // 1
    fee: Field,                          // 1
    feeTokenAddress: Field,              // 1
}
// Total: 6 + 1 + 1 + 1 + 1 + 1 + 7 + 1 + 9 + 9 + 6 + 3 + 1 + 1 + 1 = 50
```

## Output Notes

A shielded swap produces 3 new notes:

1. **Swap output note** — For the sender, containing the tokens received from the swap
2. **Change note** — For the sender, containing leftover input token value
3. **Fee change note** — For the sender, containing leftover fee-asset value

## On-Chain Execution

After proof verification, the contract:

1. Spends input note nullifiers and records the transaction nullifier
2. Builds the swap path from the public inputs
3. Approves the input token (if ERC-20) for the Uniswap router
4. Executes the swap using the appropriate Uniswap V2 function
5. Measures the actual output amount via balance delta (supports fee-on-transfer tokens)
6. Computes the output note commitment using the actual amount
7. Combines the circuit's half-ciphertext with the actual value to create the full 9-field ciphertext
8. Adds 3 note commitments to the Merkle tree
9. Pays the relayer fee

## Half-Encrypted Output Notes

The swap output amount is determined by the on-chain swap execution and cannot be known at proof generation time. The solution uses **half-encrypted** output notes:

1. The circuit encrypts only the ownership fields (owner\_hash, rk\_trapdoor) as a 6-field ciphertext
2. The contract executes the Uniswap swap and measures the actual output via balance delta
3. The contract appends a plaintext of the actual swap output value, coin\_id, and a zero value\_trapdoor
4. The contract computes the output note commitment using the actual swap amount

The `value_trapdoor` is fixed to 0 for swap output notes — this is a reserved value that the circuit enforces for swap operations specifically.

## Swap Output Note Commitment

The swap output note commitment is computed on-chain:

$$\mathtt{cm} = \operatorname{Poseidon2T4}\left(\mathtt{rk\_commitment}, \; \operatorname{Poseidon2T4}(\mathtt{amountOut}, \mathtt{outputToken}, 0), \; \mathtt{nullifiers\_hash}\right)$$

Where `rk_commitment` is the `receivingKeyCommitment` from the circuit's public inputs.

## Supported Swap Functions

| Selector     | Function                   | Input  | Output |
| ------------ | -------------------------- | ------ | ------ |
| `0x38ed1739` | `swapExactTokensForTokens` | ERC-20 | ERC-20 |
| `0x7ff36ab5` | `swapExactETHForTokens`    | ETH    | ERC-20 |
| `0x18cbafe5` | `swapExactTokensForETH`    | ERC-20 | ETH    |

Fee-on-transfer token variants are automatically used when the token whitelist indicates a fee-on-transfer token is in the path.
