# Network-aware WebGL quality design

## Goal

Make automatic WebGL quality respect device and connection constraints without adding a new operator mode.

## Decision

`auto` remains high fidelity on capable devices, but selects the existing low-power profile when the browser reports Data Saver or a 2G-class effective connection. Explicit `eco` and `cinema` choices remain authoritative.

## Verification

Unit tests cover constrained network selection and explicit override behavior. Full front-end validation remains required.
