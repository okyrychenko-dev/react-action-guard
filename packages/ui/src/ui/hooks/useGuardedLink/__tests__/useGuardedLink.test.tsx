import {
  UIBlockingProvider,
  useResolvedStoreApi,
} from "@okyrychenko-dev/react-action-guard";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import { useGuardedLink } from "../useGuardedLink";
import type { ReactNode } from "react";

function renderWithUIBlockingProvider(
  children: ReactNode,
): ReturnType<typeof render> {
  return render(<UIBlockingProvider>{children}</UIBlockingProvider>);
}

function ScopedBlocker(): ReactNode {
  const storeApi = useResolvedStoreApi();

  useEffect(() => {
    storeApi.getState().addBlocker("navigation", {
      scope: "navigation",
      reason: "Saving navigation",
    });

    return () => storeApi.getState().removeBlocker("navigation");
  }, [storeApi]);

  return null;
}

describe("useGuardedLink", () => {
  it("should prevent disabled link clicks without exposing a blocker reason", () => {
    const handleClick = vi.fn();

    function GuardedLinkExample(): ReactNode {
      const { linkState, onClick, reasonContent, ariaDescribedBy } =
        useGuardedLink({
          disabled: true,
          onClick: handleClick,
          reasonFallback: "Unavailable",
          reasonMode: "visible",
        });

      return (
        <>
          <a
            href="/next"
            aria-disabled={linkState.ariaDisabled}
            onClick={onClick}
          >
            Next
          </a>
          <span data-testid="reason">{reasonContent}</span>
          <span data-testid="description">{ariaDescribedBy}</span>
        </>
      );
    }

    renderWithUIBlockingProvider(<GuardedLinkExample />);

    expect(fireEvent.click(screen.getByRole("link", { name: "Next" }))).toBe(
      false,
    );
    expect(handleClick).not.toHaveBeenCalled();
    expect(screen.getByTestId("reason")).toBeEmptyDOMElement();
    expect(screen.getByTestId("description")).toBeEmptyDOMElement();
  });

  it("should call link click handler when link is not disabled or blocked", () => {
    const handleClick = vi.fn();

    function GuardedLinkExample(): ReactNode {
      const { linkState, onClick } = useGuardedLink({
        onClick: handleClick,
      });

      return (
        <a
          href="/next"
          aria-disabled={linkState.ariaDisabled}
          onClick={onClick}
        >
          Next
        </a>
      );
    }

    renderWithUIBlockingProvider(<GuardedLinkExample />);

    expect(fireEvent.click(screen.getByRole("link", { name: "Next" }))).toBe(
      true,
    );
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should prevent blocked link clicks and expose visible blocker reason", async () => {
    const handleClick = vi.fn();

    function GuardedLinkExample(): ReactNode {
      const { linkState, onClick, reasonContent } = useGuardedLink({
        scope: "navigation",
        onClick: handleClick,
        reasonMode: "visible",
      });

      return (
        <>
          <ScopedBlocker />
          <a
            href="/next"
            aria-disabled={linkState.ariaDisabled}
            onClick={onClick}
          >
            Next
          </a>
          <span data-testid="reason">{reasonContent}</span>
        </>
      );
    }

    renderWithUIBlockingProvider(<GuardedLinkExample />);

    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
        "aria-disabled",
        "true",
      ),
    );

    expect(fireEvent.click(screen.getByRole("link", { name: "Next" }))).toBe(
      false,
    );
    expect(handleClick).not.toHaveBeenCalled();
    expect(screen.getByTestId("reason")).toHaveTextContent("Saving navigation");
  });

  it("should remove blocked links from tab order when requested", async () => {
    function GuardedLinkExample(): ReactNode {
      const { linkState, onClick } = useGuardedLink({
        scope: "navigation",
        removeFromTabOrder: true,
      });

      return (
        <>
          <ScopedBlocker />
          <a href="/next" tabIndex={linkState.tabIndex} onClick={onClick}>
            Next
          </a>
        </>
      );
    }

    renderWithUIBlockingProvider(<GuardedLinkExample />);

    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
        "tabindex",
        "-1",
      ),
    );
  });

  it("should stop propagation for blocked link clicks when requested", async () => {
    const handleParentClick = vi.fn();
    const handleClick = vi.fn();

    function GuardedLinkExample(): ReactNode {
      const { linkState, onClick } = useGuardedLink({
        scope: "navigation",
        onClick: handleClick,
        stopPropagationWhenBlocked: true,
      });

      return (
        <div onClick={handleParentClick}>
          <ScopedBlocker />
          <a
            href="/next"
            aria-disabled={linkState.ariaDisabled}
            onClick={onClick}
          >
            Next
          </a>
        </div>
      );
    }

    renderWithUIBlockingProvider(<GuardedLinkExample />);

    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
        "aria-disabled",
        "true",
      ),
    );

    expect(fireEvent.click(screen.getByRole("link", { name: "Next" }))).toBe(
      false,
    );
    expect(handleClick).not.toHaveBeenCalled();
    expect(handleParentClick).not.toHaveBeenCalled();
  });

  it("should allow blocked link clicks to bubble when propagation stop is not requested", async () => {
    const handleParentClick = vi.fn();
    const handleClick = vi.fn();

    function GuardedLinkExample(): ReactNode {
      const { linkState, onClick } = useGuardedLink({
        scope: "navigation",
        onClick: handleClick,
      });

      return (
        <div onClick={handleParentClick}>
          <ScopedBlocker />
          <a
            href="/next"
            aria-disabled={linkState.ariaDisabled}
            onClick={onClick}
          >
            Next
          </a>
        </div>
      );
    }

    renderWithUIBlockingProvider(<GuardedLinkExample />);

    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
        "aria-disabled",
        "true",
      ),
    );

    expect(fireEvent.click(screen.getByRole("link", { name: "Next" }))).toBe(
      false,
    );
    expect(handleClick).not.toHaveBeenCalled();
    expect(handleParentClick).toHaveBeenCalledTimes(1);
  });

  it("should expose description id for blocked link reasons", async () => {
    function GuardedLinkExample(): ReactNode {
      const { linkState, onClick, reasonContent, ariaDescribedBy } =
        useGuardedLink({
          scope: "navigation",
          reasonId: "navigation-blocked-reason",
          reasonMode: "description",
        });

      return (
        <>
          <ScopedBlocker />
          <a
            href="/next"
            aria-describedby={ariaDescribedBy}
            aria-disabled={linkState.ariaDisabled}
            onClick={onClick}
          >
            Next
          </a>
          <span id="navigation-blocked-reason">{reasonContent}</span>
        </>
      );
    }

    renderWithUIBlockingProvider(<GuardedLinkExample />);

    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
        "aria-describedby",
        "navigation-blocked-reason",
      ),
    );
    expect(screen.getByText("Saving navigation")).toBeInTheDocument();
  });

  it("should reject description reason mode without a reason id while blocked", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    function GuardedLinkExample(): ReactNode {
      useGuardedLink({
        scope: "navigation",
        reasonMode: "description",
      });

      return <ScopedBlocker />;
    }

    try {
      expect(() =>
        renderWithUIBlockingProvider(<GuardedLinkExample />),
      ).toThrow('reasonId is required when reasonMode is "description"');
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
