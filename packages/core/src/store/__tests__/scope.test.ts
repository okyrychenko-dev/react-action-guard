import { describe, expect, it } from "vitest";
import {
  normalizeScope,
  resolveScope,
  scopeAffectsObservation,
  scopeMatchesTarget,
} from "../scope";

describe("scope", () => {
  describe.each([
    { label: "undefined", scope: undefined, expected: ["global"] },
    { label: "a string", scope: "profile", expected: ["profile"] },
    { label: "an empty list", scope: [], expected: [] },
    {
      label: "duplicate list entries",
      scope: ["profile", "billing", "profile"],
      expected: ["billing", "profile"],
    },
  ])("normalization for $label", ({ expected, scope }) => {
    it("should return the canonical scope list", () => {
      expect(normalizeScope(scope)).toEqual(expected);
    });
  });

  it("should reuse the canonical list for equivalent scopes", () => {
    const first = normalizeScope(["profile", "billing"]);
    const second = normalizeScope(["billing", "profile", "billing"]);

    expect(second).toBe(first);
  });

  it("should evict the least recently used canonical list when the cache is full", () => {
    const first = normalizeScope("cache-scope-0");

    for (let index = 1; index <= 256; index += 1) {
      normalizeScope(`cache-scope-${String(index)}`);
    }

    expect(normalizeScope("cache-scope-0")).not.toBe(first);
  });

  describe.each([
    {
      label: "an omitted explicit scope",
      explicitScope: undefined,
      inheritedScope: "profile",
      expected: "profile",
    },
    {
      label: "an empty explicit scope",
      explicitScope: [],
      inheritedScope: "profile",
      expected: "profile",
    },
    {
      label: "an explicit scope",
      explicitScope: "billing",
      inheritedScope: "profile",
      expected: "billing",
    },
  ])("inheritance for $label", ({ expected, explicitScope, inheritedScope }) => {
    it("should resolve the effective scope", () => {
      expect(resolveScope(explicitScope, inheritedScope)).toEqual(expected);
    });
  });

  describe.each([
    { label: "global observation", blocker: "global", observed: "profile", expected: true },
    { label: "matching strings", blocker: "profile", observed: "profile", expected: true },
    { label: "different strings", blocker: "billing", observed: "profile", expected: false },
    {
      label: "overlapping lists",
      blocker: ["billing", "profile"],
      observed: ["settings", "profile"],
      expected: true,
    },
    { label: "an empty observed list", blocker: "profile", observed: [], expected: false },
  ])("$label", ({ blocker, expected, observed }) => {
    it("should apply ordinary observation semantics", () => {
      expect(scopeAffectsObservation(blocker, observed)).toBe(expected);
    });
  });

  describe.each([
    { label: "global for a named target", blocker: "global", target: "profile", expected: false },
    { label: "global for the global target", blocker: "global", target: "global", expected: false },
    { label: "a matching target", blocker: "profile", target: "profile", expected: true },
    {
      label: "one target in a blocker list",
      blocker: ["billing", "profile"],
      target: "profile",
      expected: true,
    },
    { label: "a different target", blocker: "billing", target: "profile", expected: false },
  ])("targeted clearing for $label", ({ blocker, expected, target }) => {
    it("should apply targeted-clear semantics", () => {
      expect(scopeMatchesTarget(blocker, target)).toBe(expected);
    });
  });
});
