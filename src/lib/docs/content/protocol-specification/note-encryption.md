# Note Encryption

Nullmask uses a Diffie-Hellman key exchange with custom Poseidon2-based symmetric encryption to encrypt notes for recipients.

## Encryption Algorithm

{% hint style="info" %}
**Algorithm 5: Encrypt Note**

**Input:**

* A Note $$\mathtt{note}$$
* Recipient's Encryption Key $$\mathtt{ek}$$
* Sender's Outgoing Viewing Key $$\mathtt{ovk}$$

**Output:** Encrypted Note $$C_{\mathtt{note}}$$

1. $$\mathtt{epk} \gets \text{randomScalar}()$$
2. $$\mathtt{dhek} \gets \mathtt{epk} \cdot \mathsf{G}$$
3. $$\mathtt{shared\_secret} \gets \operatorname{Poseidon2T4}(\mathtt{epk} \cdot \mathtt{ek})$$
4. $$(m_1, m_2, m_3) \gets \operatorname{Poseidon2T4}(\mathtt{shared\_secret}, 1)$$
5. $$(m_4, m_5, \mathtt{tag}) \gets \operatorname{Poseidon2T4}(\mathtt{shared\_secret}, 2)$$
6. $$\mathtt{ciphertext} \gets \mathtt{note} + (m_1, m_2, m_3, m_4, m_5)$$
7. $$\mathtt{ek\_out} \gets \mathtt{shared\_secret} + \operatorname{Poseidon2T4}(\mathtt{epk.x}, \mathtt{ovk})$$
8. Return $$(\mathtt{dhek}, \mathtt{ek\_out}, \mathtt{tag}, \mathtt{ciphertext})$$
{% endhint %}

## Ciphertext Format

The encrypted note is serialized as 9 field elements:

| Index | Field              | Description                           |
| ----- | ------------------ | ------------------------------------- |
| 0     | `epk.x`            | Ephemeral public key x-coordinate     |
| 1     | `epk.y`            | Ephemeral public key y-coordinate     |
| 2     | `encrypted_secret` | DH shared secret encrypted with OVK   |
| 3     | `tag`              | Verification tag for trial decryption |
| 4     | `ciphertext[0]`    | Encrypted `owner_hash`                |
| 5     | `ciphertext[1]`    | Encrypted `rk_trapdoor`               |
| 6     | `ciphertext[2]`    | Encrypted `value`                     |
| 7     | `ciphertext[3]`    | Encrypted `coin_id`                   |
| 8     | `ciphertext[4]`    | Encrypted `value_trapdoor`            |

The `nfs_hash` field is not encrypted — it is a public value derived from the nullifiers.

## Encryption Mask

For circuit constraint optimization, the Poseidon2T4 hash function generates the encryption mask. Two Poseidon2T4 invocations produce 6 masking elements:

* Invocation 1: $$\operatorname{Poseidon2T4}(\mathtt{shared\_secret}, 1) \to (m_1, m_2, m_3)$$
* Invocation 2: $$\operatorname{Poseidon2T4}(\mathtt{shared\_secret}, 2) \to (m_4, m_5, \mathtt{tag})$$

Only the first 5 elements mask the note fields. The 6th element is retained as the `tag` for trial decryption verification.

## Trial Decryption

The recipient's proxy continuously scans blockchain events for new `NoteAdded` events. For each event, it attempts trial decryption:

### Incoming Notes (using decryption key)

1. Compute $$\mathtt{shared\_secret} = \operatorname{Poseidon2T4}(\mathtt{ivk} \cdot \mathtt{epk})$$
2. Regenerate the encryption mask $$(m_1, \ldots, m_5, \mathtt{tag'})$$
3. If $$\mathtt{tag'} = \mathtt{tag}$$, the note is for this recipient
4. Recover plaintext: $$\mathtt{note} = \mathtt{ciphertext} - (m_1, \ldots, m_5)$$

### Outgoing Notes (using outgoing viewing key)

1. Compute $$\mathtt{secret\_mask} = \operatorname{Poseidon2T4}(\mathtt{epk.x}, \mathtt{ovk})$$
2. Recover $$\mathtt{shared\_secret} = \mathtt{ek\_out} - \mathtt{secret\_mask}$$
3. Regenerate the encryption mask $$(m_1, \ldots, m_5, \mathtt{tag'})$$
4. If $$\mathtt{tag'} = \mathtt{tag}$$, the note was sent by this account
5. Recover plaintext: $$\mathtt{note} = \mathtt{ciphertext} - (m_1, \ldots, m_5)$$

### Deposit Notes

Deposit notes are not encrypted — their ciphertext fields 0-3 are zero. The proxy identifies them by checking if the `tag` (field 3) is zero and verifying the `owner_hash` matches the user's receiving key hash.

## In-Circuit Verification

The ZK circuit verifies note encryption correctness, which prevents the proxy from:

* Creating notes the recipient cannot decrypt
* Encrypting incorrect values (e.g., sending 0 while claiming to send 100)
* Using a wrong recipient key

This verification is critical for security: without it, a malicious proxy could produce unspendable notes, effectively burning the user's funds.

## Swap Notes (Half-Encrypted)

For shielded swaps, the output note value is determined by the on-chain swap execution and cannot be known at proof generation time. The circuit encrypts only the ownership fields (owner\_hash, rk\_trapdoor) as a 6-field half-ciphertext. The contract appends a plaintext of the actual swap output value, coin\_id, and a zero value\_trapdoor after executing the swap.
