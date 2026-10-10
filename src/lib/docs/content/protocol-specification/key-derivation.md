# Key Derivation

Nullmask derives all cryptographic keys deterministically from a single wallet signature. Since modern wallets use deterministic signatures (RFC 6979), all keys can be recovered by re-signing a fixed message.

<figure><img src="/docs/images/key-derivation.png" width="1014" height="505" alt="Key derivation diagram"><figcaption><p>Key derivation: H denotes the Poseidon2T4 hash function</p></figcaption></figure>

## Viewing Key

{% hint style="success" %}
**Definition 1: Viewing Key**

A Nullmask *Viewing Key* is a tuple $$(\mathtt{pk}, \mathtt{nk}, \mathtt{ivk}, \mathtt{ovk})$$ where:

* $$\mathtt{pk}$$: Public Key — a secp256k1 point corresponding to the wallet account's public key
* $$\mathtt{nk} \in \mathbb{F}$$: Nullifying Key — used for derivation of deterministic note nullifiers
* $$\mathtt{ivk} \in \mathbb{F}$$: Incoming Viewing Key — used for trial decryption of incoming notes
* $$\mathtt{ovk}$$: Outgoing Viewing Key — an $$\mathbb{E}$$ scalar for encrypting receipts of sent notes
{% endhint %}

{% hint style="success" %}
**Definition 2: Export Viewing Key Message**

The Nullmask `EXPORT_VK_MESSAGE` is a special protocol-fixed message. The signature of this message serves as an entropy source for all Nullmask keys. Current value: *"Authorize view-only access to Nullmask shielded account."*
{% endhint %}

{% hint style="info" %}
**Algorithm 1: Derive Viewing Key**

**Input:** wallet connection

**Output:** A Viewing Key $$(\mathtt{pk}, \mathtt{nk}, \mathtt{ivk}, \mathtt{ovk})$$

1. Request a `personal_sign` of the message `EXPORT_VK_MESSAGE`
2. Recover $$\mathtt{pk}$$ from the signature $$\sigma$$
3. $$\mathtt{seed} \gets \operatorname{Poseidon2T4}(\sigma)$$
4. $$\mathtt{nk} \gets \operatorname{Poseidon2T4}(\mathtt{seed}, 1)$$
5. $$\mathtt{ivk} \gets \operatorname{Poseidon2T4}(\mathtt{seed}, 2)$$
6. $$\mathtt{ovk} \gets \operatorname{Poseidon2T4}(\mathtt{seed}, 3)$$
7. Return $$(\mathtt{pk}, \mathtt{nk}, \mathtt{ivk}, \mathtt{ovk})$$
{% endhint %}

The viewing key grants view access to the account's transaction history. It remains stored in the proxy service and is never posted on-chain.

## Receiving Key

{% hint style="success" %}
**Definition 3: Receiving Key**

A Nullmask *Receiving Key* is a triple $$(\mathtt{pk}, \mathtt{pnk}, \mathtt{ek})$$ where:

* $$\mathtt{pk}$$: Public Key — a secp256k1 point corresponding to the wallet account's public key
* $$\mathtt{pnk} \in \mathbb{F}$$: Public Nullifying Key — the hash of $$\mathtt{nk}$$
* $$\mathtt{ek}$$: Encryption Key — an $$\mathbb{E}$$ point used for encrypting notes destined for this recipient
{% endhint %}

{% hint style="info" %}
**Algorithm 2: Derive Receiving Key**

**Input:** A Viewing Key $$(\mathtt{pk}, \mathtt{nk}, \mathtt{ivk}, \mathtt{ovk})$$

**Output:** The corresponding Receiving Key $$(\mathtt{pk}, \mathtt{pnk}, \mathtt{ek})$$

1. $$\mathtt{pnk} \gets \operatorname{Poseidon2T4}(\mathtt{nk})$$
2. $$\mathtt{ek} \gets \mathtt{ivk} \cdot \mathsf{G}$$
3. Return $$(\mathtt{pk}, \mathtt{pnk}, \mathtt{ek})$$
{% endhint %}

The receiving key is posted on-chain in the key registry. It enables anyone to send shielded funds to the corresponding address.

## Receiving Key Hash

{% hint style="info" %}
**Algorithm 3: Hash Receiving Key**

**Input:** Receiving Key $$(\mathtt{pk}, \mathtt{pnk}, \mathtt{ek})$$

**Output:** Receiving Key hash $$\mathtt{rk\_hash}$$

1. $$\mathtt{address} \gets \mathtt{keccak}(\mathtt{pk})[12:]$$
2. $$\mathtt{buffer} \gets \mathtt{pk} \; \text{(64 bytes)} \; || \; \mathtt{address} \; \text{(20 bytes)}$$
3. Pad buffer with 9 zero bytes to length 93 bytes
4. Split buffer into 3 parts of 31 bytes each
5. Return $$\operatorname{Poseidon2T4}(\mathtt{part}_1, \mathtt{part}_2, \mathtt{part}_3, \mathtt{pnk}, \mathtt{ek.x}, \mathtt{ek.y})$$
{% endhint %}

The receiving key hash is a single field element that identifies the note owner. It is computed identically in the Noir circuit and the Solidity contract, enabling on-chain verification of key registry membership.

## On-Chain Registration

The receiving key is registered on-chain via `registerReceivingKey()`. The contract:

1. Recovers the Ethereum address from the public key components
2. Verifies `msg.sender` matches the derived address
3. Computes the receiving key hash using Poseidon2
4. Inserts the hash into the key registry Merkle tree

This registration is verified in the shielded transfer circuit via a Merkle inclusion proof, ensuring the proxy cannot tamper with address-to-key mappings.

## Key Storage

| Key           | Stored Where            | Purpose                                            |
| ------------- | ----------------------- | -------------------------------------------------- |
| Viewing Key   | Proxy (local storage)   | Decrypt incoming/outgoing notes, derive nullifiers |
| Receiving Key | On-chain (key registry) | Enable others to send shielded funds               |
| Access Token  | HTTP-only cookie        | Authenticate proxy requests                        |
