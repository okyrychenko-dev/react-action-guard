"use client";

import { UIBlockingProvider } from "@okyrychenko-dev/react-action-guard";
import AppGuard from "./AppGuard";

export default function AppControls() {
  return (
    <UIBlockingProvider>
      <AppGuard />
    </UIBlockingProvider>
  );
}
