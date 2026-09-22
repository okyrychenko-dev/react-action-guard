/**
 * A blocking scope is either one name or a list of names.
 *
 * Lists are interpreted as a set: order and duplicate entries have no semantic meaning.
 * An empty list observes no scope. Guarded controls additionally treat an empty explicit list as
 * an instruction to inherit their provider scope through {@link resolveScope}.
 */
export type Scope = string | ReadonlyArray<string>;
