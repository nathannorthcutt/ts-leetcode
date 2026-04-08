# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A collection of LeetCode problems solved entirely at the **TypeScript type level**. There is no runtime logic — all solutions are `type` aliases that compute answers during compilation. The `tsc` compiler *is* the execution engine.

## Build / Check

```bash
npx tsc --build            # compile and type-check everything
npx tsc --build --watch    # incremental watch mode
```

There is no test runner. Correctness is verified by type-checking: `solutions/` files assign type-level results to variables with expected literal types. If a solution is wrong, `tsc` emits a type error.

To check a single solution, run `tsc` and look at errors in the relevant file (there is no per-file compile target).

## Project Layout

- `problems/` — Problem implementations as exported type aliases. Named `{number}_{slug}.ts`. Complex problems (e.g. sudoku) use subdirectories.
- `solutions/` — Test cases. Each file imports the problem type and assigns concrete invocations to expected-value variables. A clean `tsc` build means all tests pass.
- `utils/` — Shared type-level primitives: arithmetic (`math.ts`), string manipulation (`strings.ts`), regex engine (`regex.ts`), array ops (`array.ts`), sorting (`sorting.ts`), object utilities (`objects.ts`).
- `dist/` — Compiled output (declaration files + JS stubs). Committed to the repo.

## Key Architectural Concepts

- **Everything is a type.** `export type Foo<...> = ...` is the only meaningful construct. Actual `.js` output is empty stubs.
- **Recursive type computation** is the core technique — pattern matching via `infer`, conditional types, and mapped types replicate loops and data structures.
- **`utils/math.ts`** implements type-level integer arithmetic (add, subtract, multiply, compare) using tuple-length counting. Most problems depend on it.
- **`utils/regex.ts`** is a full regex parser + state machine at the type level — it parses regex strings into token trees and runs a matcher, all in the type system.
- **Module resolution** uses `NodeNext` — imports must include the `.js` extension (e.g. `import type { Foo } from "./math.js"`).
