# Access Tokens

Access tokens authenticate users and isolate their private data in the RPC proxy.

## Token Generation

The access token is derived during `nullmask_generateKeys`:

```
token = base64url(keccak256(signature || "Nullmask access token")[0:16])
```

* **Input**: User's ECDSA signature of the key generation message
* **Salt**: `"Nullmask access token"` (static)
* **Hash**: Keccak-256
* **Length**: 16 bytes
* **Encoding**: base64url

Since wallets use deterministic signatures (RFC 6979), the same wallet always produces the same access token.

## Token Delivery

| Mechanism        | Priority | Details                                     |
| ---------------- | -------- | ------------------------------------------- |
| HTTP-only cookie | Highest  | Set by proxy, inaccessible to JavaScript    |
| Query parameter  | Fallback | Embedded in the RPC URL for wallet requests |

## Cookie Security

```
httpOnly: true        // No JavaScript access (prevents XSS token theft)
secure: true          // HTTPS only (prevents interception)
sameSite: 'none'      // Allow cross-site requests with credentials
domain: baseDomain    // Accessible to all subdomains
```

## Data Isolation

Each user's data is isolated by combining the access token with the address:

```
storageKey = "${accessToken}:${address}".toLowerCase()
```

This means:

* Different users cannot access each other's notes
* Same address with different access tokens = different isolated storage
* Notes, keys, and transactions are all scoped to the (token, address) pair

## CORS Protection

The proxy's CORS policy ensures untrusted domains cannot access user data:

1. **Any origin** can make requests to the proxy
2. **Only trusted subdomains** receive credentials (cookies) in responses
3. Without the cookie, untrusted domains have no access token
4. Endpoints requiring authentication return 401 without a valid token

Even if a user visits a malicious website, that site cannot make authenticated requests to the RPC proxy.

## Token Lifecycle

1. **Generated** during `nullmask_generateKeys` (first time only)
2. **Stored** as HTTP-only cookie (persists across sessions)
3. **Reused** if cookie already exists on subsequent key generation calls
4. **Embedded** in the wallet's RPC URL for non-browser requests
