# Constraint Analysis

Circuit constraint counts measured with `nargo 1.0.0-beta.18` and `bb 3.0.0-nightly.20260102`.

## Main Circuits

| Circuit              | ACIR Opcodes | Gates   |
| -------------------- | ------------ | ------- |
| receiving\_key       | 409          | 60,820  |
| shielded\_transfer   | 9,507        | 115,254 |
| shielded\_withdrawal | 8,435        | 107,358 |
| shielded\_swap       | 15,694       | 138,410 |

## Library Exported Functions

| Function               | ACIR Opcodes | Gates  |
| ---------------------- | ------------ | ------ |
| derive\_keys           | 480          | 60,945 |
| derive\_receiving\_key | 411          | 60,737 |
| derive\_viewing\_key   | 242          | 42,539 |
| commit\_note           | 8            | 3,025  |
| encrypt\_note          | 1            | 63     |
| try\_decrypt\_note     | 179          | 4,362  |
| note\_nullifier        | 4            | 131    |

## Benchmark Circuits

Individual operation costs for reference:

| Operation                | ACIR Opcodes | Gates   |
| ------------------------ | ------------ | ------- |
| ecdsa\_verify            | 162          | 42,084  |
| keccak256 (136 bytes)    | 2,629        | 47,647  |
| keccak256 (272 bytes)    | 4,087        | 68,892  |
| keccak256 (408 bytes)    | 5,545        | 90,135  |
| fixed\_base\_scalar\_mul | 11           | 3,417   |
| multi\_scalar\_mul       | 11           | 3,576   |
| poseidon2\_hash          | 3            | 130     |
| note\_commitment         | 8            | 3,025   |
| note\_encryption         | 131          | 4,810   |
| note\_nullifier          | 4            | 131     |
| merkle\_verify           | 21,329       | 63,193  |
| recursive\_verify        | 1            | 722,797 |

## Cost Breakdown

The dominant costs in the shielded transfer circuit (\~115K gates):

1. **ECDSA signature verification**: \~42K gates (36%)
2. **Keccak256 hashing** (for RLP + address): \~48K gates (42%)
3. **6x Merkle membership proofs**: Variable (uses LeanIMT, depth-dependent)
4. **Poseidon2 operations**: \~10K gates (note commitments, nullifiers, encryption)
5. **Note encryption**: \~5K gates per encrypted note

The swap circuit is larger (\~138K gates) due to the bigger transaction data buffer (324 vs 68 bytes) requiring additional Keccak256 operations.

## Running Analysis

```bash
cd circuits

# Compile and count constraints
./analyze.sh

# Include proving time benchmarks (slower)
./analyze.sh --prove
```
