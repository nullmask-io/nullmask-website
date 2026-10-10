# Modified Ethereum Methods

These standard Ethereum JSON-RPC methods have modified behavior in the Nullmask proxy.

## eth\_chainId

Returns the **virtual** chain ID, not the underlying network's chain ID.

```
→ { "method": "eth_chainId" }
← { "result": "0xaa5f" }   // 43615 = Ethereum Mainnet virtual chain
```

## eth\_sendTransaction

Intercepts outgoing transactions and shields them.

**Standard behavior:** Forward to blockchain node.

**Nullmask behavior:**

1. Parse the transaction to detect if it's EIP-1559 with value > 0 or a Uniswap swap
2. If shieldable:
   * Generate a ZK proof
   * Submit via the relayer
   * Return the transaction nullifier as the "hash"
3. If not shieldable: store locally and return keccak256 hash

## eth\_sendRawTransaction

Same as `eth_sendTransaction` but accepts a signed raw transaction (hex-encoded). The proxy:

1. Parses the raw transaction
2. Recovers the sender address from the signature
3. Applies the same shielding logic

## eth\_getBalance

Returns the **shielded balance**, not the on-chain balance.

```
→ { "method": "eth_getBalance", "params": ["0xAlice", "latest"] }
← { "result": "0xde0b6b3a7640000" }   // 1 ETH shielded balance
```

* Requires access token with permission for the requested address
* Returns `0x0` if no access token or no permission

## eth\_getTransactionCount

Returns the count of **spent notes** as a proxy for the transaction nonce.

* Required for wallet nonce management on the virtual network
* Returns `0x0` if no access

## eth\_call

Intercepts ERC-20 `balanceOf(address)` calls to return shielded token balances.

```
→ { "method": "eth_call", "params": [{ "to": "0xToken", "data": "0x70a08231..." }] }
← { "result": "0x..." }   // Shielded ERC-20 balance
```

* Selector `0x70a08231` (balanceOf) → returns shielded balance
* All other selectors (decimals, symbol, name, etc.) → forwarded to blockchain

## eth\_estimateGas

Returns gas estimates for shielded operations.

1. Check if recipient has a registered receiving key
2. If registered → return shielded transfer gas estimate
3. If not registered → return shielded withdrawal gas estimate

Estimates are pre-computed per action type, not simulated. The service uses the latest successful historical gas usage when available, otherwise a chain-specific default, and applies a single 1.25x buffer.

## eth\_getTransactionByHash

Looks up transactions in the **local transaction store**, not the blockchain.

* Accepts either a standard transaction hash or a transaction nullifier
* Reconstructs a transaction object with on-chain receipt data
* Returns `null` if not found

## eth\_getTransactionReceipt

Returns receipts for local transactions, combining local store data with on-chain receipt data.

* Maps receipt status: `'success'` → `0x1`, `'reverted'` → `0x0`
* Falls back to stored gas/gasPrice if receipt not yet available

## eth\_syncing

Reports **Nullmask-specific** sync status.

```json
// Synced
{ "result": false }

// Syncing
{ "result": { "startingBlock": "0x0", "currentBlock": "0xa5f", "highestBlock": "0xb00" } }
```

* Queries sync status of both the notes scanner and key registry service
* Returns `false` if both are synced to the latest block
* Reports the lowest `currentBlock` between the two services

## eth\_getLogs

Always returns an empty array `[]`. Log queries are blocked for privacy.
