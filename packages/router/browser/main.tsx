import {
  RouterProvider,
  createBrowserHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HistoryFixture } from "../src/browser-history/HistoryFixture";

const rootRoute = createRootRoute({ component: HistoryFixture });
const routes = ["/", "/next", "/other"].map((path) =>
  createRoute({ getParentRoute: () => rootRoute, path })
);
const router = createRouter({
  routeTree: rootRoute.addChildren(routes),
  history: createBrowserHistory(),
});
const element = document.getElementById("root");

if (!element) {
  throw new Error("Missing fixture root");
}

createRoot(element).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
