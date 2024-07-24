/**
 * Simple type that returns itself
 */
type Identity<T> = T;

/**
 * Collapse the type definition into a single type
 */
export type Flatten<T> = Identity<{ [K in keyof T]: T[K] }>;
