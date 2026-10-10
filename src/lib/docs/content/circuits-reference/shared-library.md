# Shared Library

The shared library (`circuits/lib/`) contains all core cryptographic logic used by the three shielded action circuits.

## Modules

### hash.nr — Poseidon2 Hashing

Generic N-input Poseidon2 hasher with state width 4.

**Key functions:**

* `poseidon2<N>(inputs: [Field; N]) -> Field` — Generic hasher
* Exported variants: `poseidon2_2`, `poseidon2_3`, `poseidon2_4`, `poseidon2_5`, `poseidon2_6`

**Algorithm:**

1. Initialize state: `[N << 64, 0, 0, 0]`
2. Absorb inputs in blocks of 3 (applying permutation when buffer is full)
3. Final permutation → extract `state[0]`

Compatible with `Poseidon2T4Unrolled.sol` (Solidity) and `@zkpassport/poseidon2` (TypeScript).

### keys.nr — Key Derivation

Derives cryptographic keys from ECDSA signatures.

**Structures:**

* `ViewingKey { public_key, nullifying_key, decryption_key, outgoing_viewing_key }`
* `ReceivingKey { public_key, key_data, pnk, encryption_key }`
* `RegisteredReceivingKey { key, index, merkle_path }` — with Merkle proof of registration

**Derivation:**

1. Verify ECDSA signature against sender's secp256k1 public key
2. `seed = poseidon2(pack_bytes(signature))`
3. `nk = poseidon2([1, seed])`, `dk = poseidon2([2, seed])`, `ovk = poseidon2([3, seed])`
4. `encryption_key = dk * G` (fixed-base scalar multiplication on Grumpkin)
5. `pnk = poseidon2([nk])`
6. Derive Ethereum address from public key: last 20 bytes of `keccak256(pk_x || pk_y)`

**Exported functions:** `derive_viewing_key()`, `derive_receiving_key()`, `derive_keys()`, `receiving_key_hash()`

### note.nr — UTXO Model

Defines the note structure, commitment, encryption, and decryption.

**Structures:**

* `NotePlaintext { owner_hash, value, coin_id, value_commitment_trapdoor, receiving_key_trapdoor }`
* `NoteCiphertext { epk, encrypted_secret, tag, ciphertext }`
* `SpendableNote { note, index, merkle_path, nullifiers_hash }`

**Note Commitment:** Three-layer Poseidon2 hash:

```rust
rk_commitment = poseidon2([owner_hash, rk_trapdoor])
value_commitment = poseidon2([value, coin_id, vc_trapdoor])
commitment = poseidon2([rk_commitment, value_commitment, nullifiers_hash])
```

**Note Nullifier:** `poseidon2([commitment, nullifying_key])`

**Note Encryption:** DH key exchange with Poseidon2-based mask generation. Produces 9-field ciphertext (header + 5 encrypted fields).

**Trial Decryption:** Three strategies (deposit, incoming/DH, outgoing/OVK). Returns `Option<(NotePlaintext, tag)>` where tag indicates note origin type.

**Exported functions:** `commit_note()`, `note_nullifier()`, `encrypt_note()`, `try_decrypt_note()`

### merkle.nr — Merkle Tree Verification

LeanIMT verification with dynamic depth.

**Constants:** `MAX_DEPTH = 16` (supports \~65K leaves)

**LeanIMT Properties:**

* When a node has no right sibling, parent = left child (no dummy hash)
* Dynamic depth based on actual tree size
* Proof: (leaf, index as bit path, siblings array)

**Key functions:** `compute_root()`, `verify_inclusion()`

### shielding.nr — Core Action Logic

Orchestrates the full shielded action proof.

**Shared logic (`create_action_core`):**

1. Verify ECDSA signature of EIP-1559 transaction
2. Compute transaction nullifier from `(nk, chainId, nonce, pk_hash)`
3. Spend all 6 funding notes (verify Merkle paths, compute nullifiers, check ownership)
4. Verify balance equation (inputs ≥ outputs + fees)
5. Create change notes (action asset + fee asset)
6. Encrypt change notes for sender
7. Compute nullifiers hash from all 6 nullifiers

**Transfer-specific (`shield_transaction`):**

* Verify recipient key in key registry via Merkle proof
* Create and encrypt output note for recipient

**Withdrawal-specific (`shielded_withdrawal`):**

* Include public recipient address, value, and token
* No recipient key verification

**Swap-specific (`shield_swap`):**

* Parse Uniswap V2 router call data
* Assert swap recipient == sender
* Create half-ciphertext (ownership only, value determined on-chain)
* Create `receiving_key_commitment` for on-chain note finalization

### rlp.nr / rlp\_encode.nr — Transaction Parsing

EIP-1559 transaction RLP encoding and decoding for signature verification.

**Buffer sizes:**

* Transfer: 143 bytes
* Swap: 401 bytes

Parses: chain\_id, nonce, gas fields, recipient, value, data, v/r/s signature components.
