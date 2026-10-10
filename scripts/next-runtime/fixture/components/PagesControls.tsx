import Link from "next/link";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import PagesGuard from "./PagesGuard";

export default function PagesControls() {
  const { push } = useRouter();
  const [attached, setAttached] = useState(true);
  const [blocks, setBlocks] = useState(0);
  const [allows, setAllows] = useState(0);
  const [prompts, setPrompts] = useState(0);
  const [answers, setAnswers] = useState(0);
  const pending = useRef<Array<(answer: boolean) => void>>([]);

  function confirm(): Promise<boolean> {
    setPrompts((value) => value + 1);
    return new Promise((resolve) => pending.current.push(resolve));
  }

  function answer(value: boolean): void {
    pending.current.shift()?.(value);
    setAnswers((count) => count + 1);
  }

  return (
    <main>
      {attached && (
        <PagesGuard
          confirm={confirm}
          onBlock={() => setBlocks((value) => value + 1)}
          onAllow={() => setAllows((value) => value + 1)}
        />
      )}
      <p data-testid="blocks">{blocks}</p>
      <p data-testid="allows">{allows}</p>
      <p data-testid="prompts">{prompts}</p>
      <p data-testid="answers">{answers}</p>
      <Link href="/pages-target?via=link">Link target</Link>
      <button onClick={() => void push("/pages-target?via=first").catch(() => {})}>
        Push first
      </button>
      <button onClick={() => void push("/pages-target?via=second").catch(() => {})}>
        Push second
      </button>
      <button onClick={() => answer(true)}>Approve oldest</button>
      <button onClick={() => answer(false)}>Cancel oldest</button>
      <button onClick={() => setAttached(false)}>Detach guard</button>
      <button onClick={() => setAttached(true)}>Attach guard</button>
    </main>
  );
}
