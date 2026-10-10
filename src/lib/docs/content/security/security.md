# Threat Model

## Trusted Components

| Component           | Trust Assumption                                                      |
| ------------------- | --------------------------------------------------------------------- |
| User's wallet       | Correctly manages private keys, signs only user-approved transactions |
| ZK circuits (Noir)  | Open-source, auditable — circuit correctness is verifiable            |
| Smart contract      | Open-source, auditable — on-chain behavior is deterministic           |
| Barretenberg prover | Soundness of UltraHonk proof system                                   |

## Untrusted Components

### Malicious Proxy

A compromised or malicious proxy **cannot**:

* Steal funds (spending requires a valid wallet signature)
* Create fake transactions (circuit verifies ECDSA signature)
* Double-spend notes (contract checks nullifiers)
* Replay transactions (transaction nullifiers prevent this)
* Produce unspendable notes (circuit verifies encryption correctness)
* Tamper with recipient mapping (circuit verifies key registry Merkle proof)

A compromised proxy **can**:

* Observe transaction details (sender, recipient, amount) in remote deployment mode
* Refuse to process transactions (denial of service)

### Malicious Relayer

The relayer **cannot**:

* Steal funds (it only sees opaque proofs and public inputs)
* Modify transaction parameters (public inputs are verified against the proof)

The relayer **can**:

* Refuse to submit transactions (denial of service)
* Observe public fields (nullifiers, commitments — but not amounts or addresses)

### Malicious Guard

The guard **cannot**:

* Access shielded funds or notes
* Approve modified deposit parameters (validated against stored hash)
* Steal deposited funds (locked in contract)

The guard **can**:

* Reject legitimate deposits (denial of service)
* Delay deposit approval
* Selectively approve/reject deposits

## Attack Vectors

### Transaction Replay

**Mitigated by:** Transaction nullifiers. Each signed transaction produces a unique nullifier from `(nk, nonce, chainId, pk_hash)`. The contract rejects duplicate nullifiers.

### Double Spending

**Mitigated by:** Note nullifiers. Each note has a unique nullifier derived from its commitment and the owner's nullifying key. The contract maintains a set of all spent nullifiers.

### Faerie Gold Attack

**Mitigated by:** The `nfs_hash` field in note commitments. Including the hash of all input nullifiers in each output note ensures commitment uniqueness.

### Recipient Substitution

**Mitigated by:** Key registry Merkle proofs. The circuit verifies the recipient's receiving key is registered and matches the transaction's recipient address.

### Front-Running

**Mitigated by:** Root history buffer. The contract stores the last 64 Merkle roots, allowing proofs to be valid even if new notes are added between proof generation and submission.
