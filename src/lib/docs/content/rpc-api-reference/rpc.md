# Overview & Authentication

The Nullmask RPC proxy exposes a JSON-RPC interface that wallets connect to as a custom network. It intercepts standard Ethereum methods, provides custom Nullmask methods, and forwards unsupported methods to the underlying blockchain node.

## Authentication

The proxy uses an **access token** to identify users and isolate their private data (keys, notes, transactions).

### Token Generation

The access token is generated during the `nullmask_generateKeys` RPC call:

1. Takes the user's ECDSA signature (from `personal_sign`)
2. Concatenates with salt: `"Nullmask access token"`
3. Hashes with Keccak-256
4. Takes first 16 bytes
5. Encodes as base64url

### Token Delivery

The token is delivered via two mechanisms:

| Mechanism                                  | Priority | Usage                                        |
| ------------------------------------------ | -------- | -------------------------------------------- |
| HTTP-only cookie (`nullmask_access_token`) | Highest  | Set by the proxy on first key generation     |
| Query parameter (`?accessToken=...`)       | Fallback | Embedded in the RPC URL for wallet RPC calls |

### Cookie Attributes

```
httpOnly: true        // JavaScript cannot access (XSS protection)
secure: true          // HTTPS only
sameSite: 'none'      // Allow cross-site requests with credentials
domain: baseDomain    // Accessible to all subdomains
```

### Data Isolation

The access token is combined with the Ethereum address to create isolated storage keys:

```
storageKey = "${accessToken}:${address}".toLowerCase()
```

Different access tokens for the same address result in completely isolated storage.

## CORS Policy

```
origin: true                                    // Accept requests from any origin
credentials: isAllowedOrigin(origin, baseDomain) // Only send cookies to trusted subdomains
```

Untrusted domains cannot access user data because:

1. CORS only allows credentials from trusted subdomains
2. HTTP-only cookies are never sent to untrusted origins
3. Without the cookie, there is no access token
4. Endpoints requiring authentication return 401

## Method Categories

| Category                                                            | Description                                  | Reference                                                                                     |
| ------------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [Modified Ethereum Methods](/docs/rpc-api-reference/modified-methods) | Standard methods with privacy-aware behavior | `eth_getBalance`, `eth_sendTransaction`, etc.                                                 |
| [Custom Nullmask Methods](/docs/rpc-api-reference/custom-methods)     | Protocol-specific methods                    | `nullmask_generateKeys`, key and balance methods, and the testing-only `nullmask_estimateFee` |
| [Forwarded Methods](/docs/rpc-api-reference/forwarded-methods)        | Pass-through to blockchain node              | `eth_gasPrice`, `eth_blockNumber`, etc.                                                       |
