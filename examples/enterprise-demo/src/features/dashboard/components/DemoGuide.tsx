import { Link } from "react-router-dom";
import { DEMO_STEPS } from "./DemoGuide.constants";
import type { ReactElement } from "react";

export function DemoGuide(): ReactElement {
  return (
    <section
      aria-labelledby="demo-guide-title"
      className="overflow-hidden rounded-2xl border border-teal-900/10 bg-white shadow-sm"
    >
      <div className="flex flex-col gap-5 border-b border-teal-900/10 bg-teal-50 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-teal-700">
            Start here · four short experiments
          </p>
          <h2
            id="demo-guide-title"
            className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl"
          >
            From a blocked action to a safe recovery
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Try Checkout and follow the live inspector to see why an action is blocked and when it
            becomes available again.
          </p>
        </div>
        <Link
          to="/checkout"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 motion-reduce:transition-none"
        >
          Start in Checkout{" "}
          <span aria-hidden="true" className="ml-3">
            →
          </span>
        </Link>
      </div>
      <ol className="grid gap-px bg-slate-200 sm:grid-cols-2">
        {DEMO_STEPS.map(({ number, title, instruction, outcome }) => (
          <li key={number} className="flex gap-4 bg-white p-5 sm:p-6">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold tabular-nums text-slate-500"
            >
              {number}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{instruction}</p>
              <p className="mt-3 border-l-2 border-teal-500 pl-3 text-xs leading-5 text-teal-800">
                <span className="font-semibold">What to expect: </span>
                {outcome}
              </p>
              {number === "03" && (
                <Link
                  to="/checkout"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex rounded text-sm font-semibold text-teal-700 underline decoration-teal-700/30 underline-offset-4 hover:decoration-teal-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
                >
                  Open a second demo tab <span className="sr-only">(opens in a new tab)</span>
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
      <p className="px-5 py-4 text-xs leading-5 text-slate-500 sm:px-6">
        Need a clean start? Reset demo clears this session. Explore scenario presets below after
        trying the basics.
      </p>
    </section>
  );
}
