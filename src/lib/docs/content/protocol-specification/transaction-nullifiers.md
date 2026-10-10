# Transaction Nullifiers

Nullmask shielded actions must be authorized by signed virtual transactions. This authorization model differs fundamentally from other privacy protocols.

## Authorization Model

* **Railgun and Zcash**: The host selects notes that fund a shielded transaction; the wallet then signs the full shielded transaction data, which includes note nullifiers. The wallet has direct knowledge of which notes are being spent.
* **Nullmask**: The wallet signs a standard transaction expressing an intent (e.g., "send 1 ETH to Alice"); the proxy then selects notes to fund the shielded transaction. The wallet has no knowledge of notes or nullifiers.

This separation introduces a fundamental problem: since the proxy controls note selection, a malicious proxy could replay the same signed intent with different funding notes.

## Solution

Transaction nullifiers prevent replay. The Nullmask contract stores all transaction nullifiers and rejects transactions with previously used nullifiers. Each executed transaction on the EVM can be indexed by the unique `(chainId, address, nonce)` triple. Nullmask shielded actions mask this triple by hashing it together with the nullifying key.

{% hint style="success" %}
**Definition 6: Transaction Nullifier**

For a transaction $$\mathtt{tx}$$ and nullifying key $$\mathtt{nk}$$:

$$\mathtt{nf_{tx}} := \operatorname{Poseidon2T4}(\mathtt{nk}, \; \mathtt{tx.nonce} \cdot 2^{32} + \mathtt{tx.chainId}, \; \mathtt{pk\_hash})$$
{% endhint %}

The chain ID and nonce are compacted into a single field element, requiring only one Poseidon2T4 invocation.
