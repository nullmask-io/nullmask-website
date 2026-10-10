# How It Works

## Step by Step

### 1. User Signs a Transaction

The user creates a standard EIP-1559 transaction in their wallet (e.g., "Send 1 ETH to 0xAlice"). The wallet signs this transaction normally — no special UI or workflow changes.

### 2. Proxy Intercepts

The RPC proxy (running as the wallet's RPC endpoint) intercepts the `eth_sendTransaction` call. Instead of forwarding it to the blockchain, the proxy:

* Parses the transaction to extract the intent (recipient, amount, token)
* Checks whether the recipient has a registered receiving key
* Selects funding notes (UTXOs) from the sender's shielded balance

### 3. ZK Proof Generation

The proxy feeds the transaction data and funding notes into a Noir circuit, which generates a zero-knowledge proof that:

* The sender authorized this specific transaction (ECDSA signature verification)
* The funding notes exist in the Merkle tree (membership proof)
* The funding notes have not been spent before (nullifier uniqueness)
* The input amounts cover the output amounts plus fees (balance check)
* The new notes are correctly encrypted for the recipient

### 4. Relayer Submission

The proof and public inputs are sent to a relayer, which:

* Submits the transaction to the Nullmask smart contract
* Pays the gas fees (reimbursed from the shielded transaction's fee allocation)
* Hides the sender's IP address and identity

### 5. On-Chain Verification

The Nullmask contract:

* Verifies the ZK proof using the on-chain verifier
* Records note nullifiers (preventing double-spending)
* Records the transaction nullifier (preventing replay attacks)
* Adds new note commitments to the Merkle tree
* Emits encrypted note data in events for the recipient to scan

### 6. Recipient Scans

The recipient's proxy continuously scans blockchain events for new notes. It trial-decrypts each note using the recipient's viewing key. Successfully decrypted notes are added to the recipient's shielded balance.

## UTXO Model

Nullmask uses a UTXO (Unspent Transaction Output) model similar to Bitcoin and Zcash. Each unit of value in the privacy pool is stored as a **note** — an encrypted container with:

* Owner identity (hashed receiving key)
* Value and token type
* Random trapdoors for hiding the owner and value
* Link to the action that created it (nullifiers hash)

Note commitments are stored on-chain in a Merkle tree. Only the commitment is visible on-chain; the actual note contents are encrypted and emitted in event logs.
