# Revocation Keys

Revocation keys enable retrospective taint recovery — a mechanism unique to Nullmask that addresses the problem of funds being tainted after they've entered the privacy pool.

## The Problem

In existing privacy protocols (e.g., Railgun), once tainted funds enter the pool, there is no way for users to disassociate from them. The entire pool remains tainted indefinitely.

## Nullmask's Solution

The guard publishes a **revocation key pair** with each approved deposit:

* The **public key** (`revocationPublicKeyX`, `revocationPublicKeyY`) is published in the `Deposit` event
* The **public key hash** is used as the `value_trapdoor` in the deposit note commitment

Each Nullmask note includes encrypted information about the deposits that funded it.

## Retrospective Taint Recovery

If a deposit is flagged as tainted after approval:

1. The guard publishes the **secret key** corresponding to the revocation public key
2. Each protocol participant can use this key to:
   * Determine if their notes were funded by the tainted deposit
   * If not tainted: generate a proof of disassociation
   * If tainted: verifiably clean the rest of their untainted balance

## Comparison

| Protocol      | Retrospective Taint Handling                                                     |
| ------------- | -------------------------------------------------------------------------------- |
| Railgun       | No mechanism — pool remains tainted indefinitely                                 |
| Privacy Pools | Exclusion proofs + retrospective compliance, but no shielded transfers available |
| **Nullmask**  | Revocation keys enable targeted taint recovery                                   |

This mechanism ensures that even if some tainted funds enter the pool, individual users can prove their funds are clean, and the pool can recover from tainted deposits.
