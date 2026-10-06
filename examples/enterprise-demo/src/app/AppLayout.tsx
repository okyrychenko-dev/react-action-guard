import { GuardInspector } from "@features/core/guard";
import { Sidebar, TopBar } from "@features/navigation";
import { Outlet } from "react-router-dom";
import { AppProviders } from "./AppProviders";
import type { ReactElement } from "react";

export function AppLayout(): ReactElement {
  return (
    <AppProviders>
      {({ demoKey, onReset }) => (
        <div
          key={demoKey}
          className="grid min-h-dvh grid-cols-1 grid-rows-[auto_auto_1fr_auto] bg-slate-100 md:h-dvh md:grid-cols-[13rem_minmax(0,1fr)] md:grid-rows-[3.5rem_minmax(0,1fr)_auto] xl:grid-rows-[3.5rem_minmax(0,1fr)] md:overflow-hidden xl:grid-cols-[13rem_minmax(0,1fr)_22rem]"
        >
          <TopBar onReset={onReset} />
          <Sidebar />
          <main className="min-w-0 p-4 sm:p-6 md:col-start-2 md:row-start-2 md:overflow-y-auto lg:p-8">
            <div className="mx-auto w-full max-w-6xl">
              <Outlet />
            </div>
          </main>
          <aside className="min-w-0 border-t border-slate-200 bg-white md:col-start-2 md:row-start-3 md:max-h-96 md:overflow-y-auto xl:col-start-3 xl:row-start-2 xl:max-h-none xl:border-t-0 xl:border-l">
            <details open className="group">
              <summary className="cursor-pointer px-5 py-3 text-sm font-semibold text-slate-700 focus-visible:outline-2 focus-visible:outline-teal-600">
                Live guard inspector
                <span className="ml-2 text-xs font-normal text-slate-500">
                  Blockers & audit trail
                </span>
              </summary>
              <GuardInspector />
            </details>
          </aside>
        </div>
      )}
    </AppProviders>
  );
}
