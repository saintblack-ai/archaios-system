# QLE-001 — The Quandrix Light Equation

**Status:** Foundational Archaios framework  
**System:** Order of Light / Archaios Reborn  
**Author:** Quandrix Lee Blackburn (Saint Black)  
**Version:** 0.1

## Equation

\[
\mathcal{L}_{Q}(t)=\frac{V(t)K(t)A(t)E(t)}{1+N(t)+R(t)}
\]

Where:

- **V — Vision:** clarity of the intended future.
- **K — Knowledge:** understanding, research, and intelligence.
- **A — Action:** disciplined execution.
- **E — Ethical alignment:** whether the work serves life and constructive purpose.
- **N — Noise:** distraction, misinformation, uncertainty, and system confusion.
- **R — Resistance:** technical, financial, psychological, institutional, or operational obstacles.
- **t — Time:** the evaluation point or interval.

## Light Index

When each factor is normalized to the interval `[0,1]`, define:

\[
\text{Archaios Light Index}=100\mathcal{L}_{Q}
\]

Example:

- V = 0.95
- K = 0.80
- A = 0.70
- E = 0.95
- N = 0.15
- R = 0.20

Then:

\[
\mathcal{L}_{Q}\approx0.374
\]

and the corresponding Light Index is approximately **37.4%**.

## Operational interpretation

QLE-001 is a philosophical and systems-engineering metric, not a claim of a newly established law of physics. It gives Archaios a compact way to express a design principle: useful output increases when vision, knowledge, execution, and ethical alignment reinforce one another, while noise and resistance suppress effective output.

## Engineering requirements for implementation

1. Inputs must be explicit, inspectable, and normalized before scoring.
2. No hidden user profiling or inferred sensitive attributes may be used as Light Equation inputs.
3. The system must display the component scores alongside the final Light Index.
4. The final score must be described as a framework-derived index, not an objective measure of human worth.
5. Any automated recommendation based on QLE-001 must remain advisory and explain which factors drove the result.
6. Historical measurements should record timestamp, source, scoring method, and version of the equation.

## First product target

Create a read-only **Light Equation** panel inside the Archaios command interface that:

- displays QLE-001;
- accepts six normalized values for V, K, A, E, N, and R;
- calculates the current Light Index;
- visualizes the six components;
- explains the strongest positive factor and strongest limiting factor;
- runs locally by default with no production database write;
- includes a clear label that QLE-001 is an Archaios conceptual/system metric.

## Doctrine

> Vision without knowledge is imagination. Knowledge without action is storage. Action without ethics becomes destruction. When all four align, light enters the world.

---

**Canonical identifier:** `QLE-001`  
**Canonical name:** `The Quandrix Light Equation`
