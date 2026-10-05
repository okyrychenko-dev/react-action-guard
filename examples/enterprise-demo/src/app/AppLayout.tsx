import { GuardInspector } from "@features/core/guard";
import { Sidebar, TopBar } from "@features/navigation";
import { Outlet } from "react-router-dom";
import { AppProviders } from "./AppProviders";
import type { ReactElement } from "react";

export function AppLayout(): ReactElement {
  return (
    <AppProviders>
      {({ demoKey, onReset }) => (
        <div key={demoKey} className="app-root">
          <TopBar onReset={onReset} />
          <Sidebar />
          <main className="col-start-2 row-start-2 bg-slate-100 overflow-y-auto p-7 flex flex-col gap-6">
            <Outlet />
          </main>
          <aside className="inspector-panel col-start-3 row-start-2 bg-slate-50 border-l border-slate-900/8 overflow-y-auto">
            <GuardInspector />
          </aside>
        </div>
      )}
    </AppProviders>
  );
}
