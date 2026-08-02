import { describe, expect, it } from "vitest";
import { assertNever } from "../assert";

describe("assertNever", () => {
  it("should throw an error containing the label and value", () => {
    expect(() => {
      void Reflect.apply(assertNever, undefined, ["unexpected", "TestValue"]);
    }).toThrow("Unhandled TestValue: unexpected");
  });
});
