import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useEnterpriseIsBlocked } from "@features/core/guard/scopes";
import { TestProviders } from "@test/renderWithProviders";
import { useNotificationPreferences } from "./useNotificationPreferences";

describe("useNotificationPreferences", () => {
  it("should expose the initial notification preferences", () => {
    const { result } = renderHook(() => useNotificationPreferences(), {
      wrapper: TestProviders,
    });

    expect(result.current.emailDigest).toBe(true);
    expect(result.current.smsAlerts).toBe(false);
    expect(result.current.slackWebhook).toBe("https://hooks.slack.com/services/T00/B00/xxx");
  });

  it("should update notification preferences", () => {
    const { result } = renderHook(() => useNotificationPreferences(), {
      wrapper: TestProviders,
    });

    act(() => {
      result.current.setEmailDigest(false);
      result.current.setSmsAlerts(true);
      result.current.setSlackWebhook("https://hooks.slack.com/services/T11/B11/yyyy");
    });

    expect(result.current.emailDigest).toBe(false);
    expect(result.current.smsAlerts).toBe(true);
    expect(result.current.slackWebhook).toBe("https://hooks.slack.com/services/T11/B11/yyyy");
  });

  it("should guard global scope while saving changes", async () => {
    const { result } = renderHook(
      () => ({
        preferences: useNotificationPreferences(),
        isGlobalBlocked: useEnterpriseIsBlocked("global"),
      }),
      { wrapper: TestProviders }
    );

    act(() => {
      result.current.preferences.saveChanges();
    });

    await waitFor(() => {
      expect(result.current.isGlobalBlocked).toBe(true);
    });
  });
});
