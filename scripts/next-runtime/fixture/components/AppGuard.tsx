"use client";

import { useAppRouterBlocker } from "@okyrychenko-dev/react-action-guard-router/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AppGuard() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(true);
  const { isBlocking } = useAppRouterBlocker({ when: enabled });

  return (
    <nav>
      <p data-testid="protection">{String(isBlocking)}</p>
      <Link href="/app-target?via=link">App link target</Link>
      <button onClick={() => router.push("/app-home?via=push")}>App push home</button>
      <button onClick={() => router.back()}>App back</button>
      <button onClick={() => router.forward()}>App forward</button>
      <button onClick={() => setEnabled(false)}>Disable unload</button>
      <button onClick={() => setEnabled(true)}>Enable unload</button>
    </nav>
  );
}
