# System Overview

Nullmask's architecture consists of several interacting components that together enable privacy-preserving transactions on EVM chains.

```mermaid
graph LR
    U[User] <--> W[Wallet] <--> P[Proxy] <--> R[Relayers] <--> C[Contract]
```

## Architecture Diagram

```mermaid
graph TB
    subgraph User["User Environment"]
        W[Wallet<br/>MetaMask, etc.]
    end

    subgraph Proxy["RPC Proxy"]
        P[JSON-RPC Server]
        NS[Notes Scanner]
        KR[Key Registry]
        SS[Shielding Service]
    end

    subgraph ZK["ZK Proving"]
        NC[Noir Circuits]
        BB[Barretenberg Prover]
    end

    subgraph Backend["Backend Services"]
        R[Relayer]
        G[Guard]
    end

    subgraph Chain["Blockchain"]
        C[Nullmask Contract]
        V[ZK Verifiers]
        MT[Merkle Tree]
    end

    W -->|eth_sendTransaction| P
    P -->|parse intent| SS
    SS -->|generate proof| NC
    NC -->|UltraHonk| BB
    BB -->|proof| SS
    SS -->|shielded tx| R
    R -->|submit| C
    C -->|verify| V
    C -->|update| MT
    G -->|approve deposits| C
    NS -->|scan events| C
    KR -->|sync keys| C

```

## Data Flow

1. **User signs** a standard EIP-1559 transaction in their wallet
2. **Proxy intercepts** the RPC call and parses the user's intent
3. **Shielding service** selects funding notes and prepares circuit inputs
4. **Noir circuits** generate a ZK proof via the Barretenberg prover
5. **Relayer** submits the proof and public inputs to the smart contract
6. **Contract** verifies the proof, spends nullifiers, and adds new note commitments to the Merkle tree
7. **Notes scanner** monitors chain events and decrypts new notes for the user
