---
status: accepted
---

# Organize Architecture Modules by module root

Once volatility and change ownership identify an Architecture Module, Righting targets module root first and retains Righting role suffixes in filenames. This chooses locality over global role folders without inferring Modules from directories; only host-required entrypoints, composition roots, and genuinely module-neutral source remain outside, and host-owned files stay thin across the Module's Interface.

## Consequences

Incremental migration is allowed but remains explicitly partial while known Module Implementation is scattered. Contract version 2 still classifies roles rather than Module ownership or Interface access, so this decision is workflow guidance until a future contract version models those semantics explicitly.
