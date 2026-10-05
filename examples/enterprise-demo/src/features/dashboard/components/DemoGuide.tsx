import { Button, Card, Link as HeroLink, buttonVariants } from "@heroui/react";
import { Link } from "react-router-dom";
import { DEMO_STEPS } from "./DemoGuide.constants";
import type { ReactElement } from "react";
import type { DemoGuideProps } from "./DemoGuide.types";

export function DemoGuide({ isHighRiskActive, onStart, onClear }: DemoGuideProps): ReactElement {
  return (
    <section aria-labelledby="demo-guide-title">
      <Card className="gap-0 overflow-hidden p-0">
        <Card.Header className="flex flex-col gap-5 bg-teal-50 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-teal-700">
              Start here · High-risk checkout
            </p>
            <h2
              id="demo-guide-title"
              className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl"
            >
              From a blocked action to a safe recovery
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Enable a risk hold, open Orders, and see Refund become unavailable. The guard stays
              active as you move between pages.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-3">
            {isHighRiskActive ? (
              <Link to="/orders" className={buttonVariants({ variant: "primary" })}>
                Continue to Orders →
              </Link>
            ) : (
              <Button variant="primary" onPress={onStart}>
                Enable High-risk checkout
              </Button>
            )}
            <p role="status" className="text-xs text-teal-800">
              {isHighRiskActive
                ? "Risk hold active — ready for step 2."
                : "Start by enabling the risk hold."}
            </p>
          </div>
        </Card.Header>
        <Card.Content className="p-5 sm:p-6">
          <ol className="grid gap-5 md:grid-cols-3">
            <li className="text-sm leading-6 text-slate-600">
              <strong className="block text-slate-900">1. Enable the preset</strong>Use the button
              above to activate payment and inventory guards.
            </li>
            <li className="text-sm leading-6 text-slate-600">
              <strong className="block text-slate-900">2. Inspect Orders</strong>Open Orders and
              find a disabled Refund action. Check the live inspector for the risk hold and its
              reason.
            </li>
            <li className="text-sm leading-6 text-slate-600">
              <strong className="block text-slate-900">3. Release the hold</strong>Return to
              Dashboard and clear the preset, then revisit Orders to see Refund available again.
            </li>
          </ol>
          {isHighRiskActive && (
            <Button className="mt-5" size="sm" variant="secondary" onPress={onClear}>
              Clear risk hold
            </Button>
          )}
        </Card.Content>
        <Card.Header className="border-t border-slate-200 px-5 pt-5 sm:px-6">
          <h3 className="text-base font-semibold text-slate-900">Explore more experiments</h3>
          <p className="text-sm text-slate-600">
            Try these after completing the cross-route workflow.
          </p>
          <Link to="/checkout" className="text-sm text-teal-700 underline underline-offset-4">
            Start in Checkout →
          </Link>
        </Card.Header>
        <Card.Content className="p-0">
          <ol className="grid gap-px bg-slate-200 sm:grid-cols-2">
            {DEMO_STEPS.map(({ number, title, instruction, outcome, opensSecondTab }) => (
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
                  {opensSecondTab && (
                    <HeroLink
                      href="/checkout"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 text-sm text-teal-700 underline underline-offset-4"
                    >
                      Open a second demo tab <span className="sr-only">(opens in a new tab)</span>
                    </HeroLink>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Card.Content>
        <Card.Footer className="px-5 py-4 text-xs leading-5 text-slate-500 sm:px-6">
          Need a clean start? Reset demo clears this session. More scenario presets are available
          below.
        </Card.Footer>
      </Card>
    </section>
  );
}
