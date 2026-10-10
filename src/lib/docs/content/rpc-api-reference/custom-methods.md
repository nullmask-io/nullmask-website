# Custom Nullmask Methods

These methods are specific to the Nullmask protocol and are not part of the standard Ethereum JSON-RPC specification.

## nullmask\_generateKeys

Generate viewing and receiving keys from a wallet signature.

```json
{
  "method": "nullmask_generateKeys",
  "params": [{
    "address": "0x...",
    "hashedMessage": "0x...",
    "pubKeyX": "0x...",
    "pubKeyY": "0x...",
    "signature": "0x..."
  }]
}
```

**Returns:**

```json
{
  "success": true,
  "viewingKey": { ... },
  "receivingKey": { ... },
  "accessToken": "base64url-encoded-token"
}
```

**Behavior:**

1. Derives Nullmask keys from the ECDSA signature via the Noir circuit
2. Generates or reuses the access token
3. Registers the (token, address) pair in the access control table
4. Stores the key pair locally
5. Initiates note scanning for the address

This is the first method called during onboarding. The receiving key must be separately registered on-chain via a contract call.

## nullmask\_getEthBalance

Get the shielded ETH balance without gas abstraction.

```json
{
  "method": "nullmask_getEthBalance",
  "params": ["0xAddress"]
}
```

**Returns:** Hex-encoded balance string.

Similar to `eth_getBalance` but without reserving a floor for gas fees. Returns the raw shielded ETH balance.

## nullmask\_estimateFee

Return the fee used by a shielded operation. This method is retained for integration tests; production wallets use `eth_estimateGas` and `eth_gasPrice`.

```json
{
  "method": "nullmask_estimateFee",
  "params": [0, "0x0"]
}
```

**Parameters:**

| Index | Type     | Description                                               |
| ----- | -------- | --------------------------------------------------------- |
| 0     | `number` | Action type: `0` = transfer, `1` = withdrawal, `2` = swap |
| 1     | `string` | Token address for fee payment (`0x0` for ETH)             |

**Returns:** Hex-encoded fee in the specified token.

**Behavior:**

1. Gets the 1.25x-buffered default or latest historical gas usage for the action type
2. Fetches current gas price from the network
3. Computes `fee = gasEstimate × gasPrice`
4. Converts and rounds up when the specified fee token is not ETH

## nullmask\_getReceivingKey

Look up the receiving key for an address.

```json
{
  "method": "nullmask_getReceivingKey",
  "params": ["0xAddress"]
}
```

**Returns:**

```json
{
  "keys": ["receiving-key-data"],
  "source": "local"  // or "registry"
}
```

* Checks local key storage first (fastest)
* Falls back to the on-chain key registry (synced from blockchain)
* Returns empty `keys` array if not found

## nullmask\_hasKeys

Check if an address has locally generated keys.

```json
{
  "method": "nullmask_hasKeys",
  "params": ["0xAddress"]
}
```

**Returns:** `boolean`

## nullmask\_hasAccess

Check if the current access token has permission for an address.

```json
{
  "method": "nullmask_hasAccess",
  "params": ["0xAddress"]
}
```

**Returns:** `boolean`

Verifies both:

1. The address has a key pair in local storage
2. The request's access token is registered for this address

## nullmask\_getTransactions

Get the shielded transaction history for an address.

```json
{
  "method": "nullmask_getTransactions",
  "params": ["0xAddress"]
}
```

**Returns:**

```json
[
  {
    "transaction": {
      "hash": "0x...",
      "nullifier": "0x...",
      "blockNumber": 12345,
      "timestamp": 1700000000,
      "transactionIndex": 0
    },
    "eventTypes": ["ShieldedTransfer"],
    "changes": [
      { "amount": "-1000000000000000000", "token": "0x0" }
    ],
    "fee": { "amount": "50000000000000", "token": "0x0" }
  }
]
```

Requires access token permission. Reconstructs transaction history from incoming and outgoing notes, enriched with on-chain event data. Sorted by block number (newest first).
