import { ENTERPRISE_SCOPES, type EnterpriseScope } from "../../scopes";
import type { Key } from "@heroui/react";

export function toEnterpriseScope(key: Key | null): EnterpriseScope | undefined {
  if (typeof key !== "string") {
    return undefined;
  }

  return ENTERPRISE_SCOPES.find((scope) => scope === key);
}
