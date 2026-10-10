# Hardware Wallets

Nullmask provides full hardware wallet support without any modifications to the wallet's firmware. This is not an afterthought — it is a direct consequence of the protocol's architecture.

## The Problem with Other Protocols

Most privacy solutions extract spending authority from the wallet. Nullmask does not. This preserves the core principle of hardware wallets: **spending authority never leaves the device**.

When spending authority is extracted:

* The security model of the hardware wallet is broken — the key exists outside the secure enclave
* Users become vulnerable to phishing attacks that target the extracted key material
* The user must trust the software environment where the key is used, defeating the purpose of a hardware wallet

### Railgun/Zcash Workaround

Railgun and Zcash attempted to address this by requiring an additional signature over the shielded transaction. However, both rely on custom hash functions:

* Zcash Orchard: Sinsemilla
* Railgun: Variable-rate Poseidon

These require large precomputed lookup tables that are impractical for the constrained computational environment of a hardware wallet. As a result, hardware wallet support remains either absent or compromised in practice.

## Nullmask's Approach

Nullmask's spending authority is never extracted from the wallet. Shielded transactions are authorized using **standard EIP-1559 transactions** — the same format every hardware wallet already supports.

The key insight: the user signs a standard transfer (e.g., "Send 1 ETH to 0xAlice") on their hardware wallet, and the ZK circuit verifies data in the underlying transaction and its ECDSA signature. No custom signing logic, no custom hash functions, no firmware changes. Hardware wallet support comes for free.

This also means:

* Users keep their standard 0x addresses — no new address formats to manage
* No separate application or additional seed phrase is needed
* The wallet displays a familiar transaction for the user to review and approve

## Security Guarantees

| Property            | Guarantee                                  |
| ------------------- | ------------------------------------------ |
| Spending authority  | Never leaves the hardware wallet           |
| Signing format      | Standard EIP-1559 (already supported)      |
| Custom firmware     | Not required                               |
| Phishing resistance | Standard hardware wallet protections apply |
| Address format      | Standard 0x addresses (no new types)       |

## Comparison

<figure><img src="/docs/images/architecture-comparison.png" width="691" height="739" alt="Architecture comparison"><figcaption><p>In Nullmask, the spending authority never leaves the wallet.</p></figcaption></figure>

| Protocol              | Hardware Wallet Support                            |
| --------------------- | -------------------------------------------------- |
| Zcash                 | Limited (Sinsemilla impractical on HW)             |
| Railgun               | Limited (variable-rate Poseidon impractical on HW) |
| 0xbow / Privacy Pools | Not supported                                      |
| Hinkal / zERC20       | Not supported                                      |
| **Nullmask**          | Full support, any hardware wallet                  |

## Supported Hardware Wallets

Any hardware wallet that supports:

* EIP-1559 transaction signing
* `personal_sign` for key generation
* Custom network configuration

This includes Ledger, Trezor, and other major hardware wallets.
