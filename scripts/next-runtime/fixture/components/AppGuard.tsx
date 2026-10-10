"use client";

import { useAppRouterBlocker } from "@okyrychenko-dev/react-action-guard-router/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AppGuard() {
  const { push, back, forward } = useRouter();
  const [enabled, setEnabled] = useState(true);
  const { isBlocking } = useAppRouterBlocker({ when: enabled });

  return (
    <nav>
      <p data-testid="protection">{String(isBlocking)}</p>
      <Link href="/app-target?via=link">App link target</Link>
      <button onClick={() => push("/app-home?via=push")}>App push home</button>
      <button onClick={() => back()}>App back</button>
      <button onClick={() => forward()}>App forward</button>
      <button onClick={() => setEnabled(false)}>Disable unload</button>
      <button onClick={() => setEnabled(true)}>Enable unload</button>
    </nav>
  );
}
