import { vi } from "vitest";
import type { NextRouter } from "next/router";
import type { Mock } from "vitest";

export type RouterEventHandler = (url: string) => void;

interface MockRouterEvents {
  on: Mock<(event: string, handler: RouterEventHandler) => void>;
  off: Mock<(event: string, handler: RouterEventHandler) => void>;
  emit: Mock<(event: string) => void>;
}

export type MockRouter = NextRouter & {
  events: MockRouterEvents;
};

export function createMockRouter(): MockRouter {
  const on = vi.fn<(event: string, handler: RouterEventHandler) => void>();
  const off = vi.fn<(event: string, handler: RouterEventHandler) => void>();
  const emit = vi.fn<(event: string) => void>();

  return {
    basePath: "",
    pathname: "/",
    route: "/",
    query: {},
    asPath: "/",
    back: vi.fn(),
    beforePopState: vi.fn(),
    prefetch: vi.fn().mockResolvedValue(undefined),
    push: vi.fn().mockResolvedValue(true),
    reload: vi.fn(),
    replace: vi.fn().mockResolvedValue(true),
    events: {
      on,
      off,
      emit,
    },
    isFallback: false,
    isLocaleDomain: false,
    isReady: true,
    defaultLocale: "en",
    domainLocales: [],
    isPreview: false,
    forward: vi.fn(),
  };
}
