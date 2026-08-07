// lib/motion.ts
//
// Framer Motion's Variants type expects a fixed-length tuple for a custom
// cubic-bezier ease, not a generic number[]. Declaring the array inline
// (e.g. `ease: [0.22, 1, 0.36, 1]`) gets widened to number[] by TS unless
// it's `as const`, which causes:
//   "Type 'number[]' is not assignable to type 'Easing | Easing[]'"
//
// Import EASE_OUT from here anywhere you'd otherwise write that array
// inline, so the tuple typing is correct everywhere automatically.

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
