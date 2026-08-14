import { RefObject, useEffect, useRef } from "react";

/**
 * Keeps a ref updated with the latest config value.
 * Useful for accessing current config in callbacks without stale closures.
 *
 * @param config - Configuration object to track
 * @returns Mutable ref that always contains the latest config
 *
 */
export function useConfigRef<T>(config: T): RefObject<T> {
  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  return configRef;
}
