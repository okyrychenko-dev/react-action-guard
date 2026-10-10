import { createTypedHooks } from "@okyrychenko-dev/react-action-guard";
import type { BlockerInfo, ScopeValue, TypedHooks } from "@okyrychenko-dev/react-action-guard";

type AppScope = "checkout" | "profile";
type DeclaredScope = Parameters<TypedHooks<AppScope>["useBlockingInfo"]>[0];
type RequireTrue<T extends true> = T;

export type AcceptedScopesStayBounded = RequireTrue<
  DeclaredScope extends ScopeValue<AppScope> ? true : false
>;
export type ScopeArraysAreAccepted = RequireTrue<
  ScopeValue<AppScope> extends DeclaredScope ? true : false
>;
export type UnknownScopeIsRejected = RequireTrue<"unknown" extends DeclaredScope ? false : true>;
export type UnknownArrayMemberIsRejected = RequireTrue<
  ReadonlyArray<"checkout" | "unknown"> extends DeclaredScope ? false : true
>;

// Compile only against installed public declarations; this hook is never executed.
export function useTypedMetadataContract(): ReadonlyArray<Readonly<BlockerInfo>> {
  const { useBlockingInfo } = createTypedHooks<AppScope>();
  const scopes: ReadonlyArray<AppScope> = ["checkout", "profile"];
  const info = useBlockingInfo(scopes);

  useBlockingInfo("checkout");
  useBlockingInfo(["checkout", "profile"]);
  useBlockingInfo([]);

  return info;
}
