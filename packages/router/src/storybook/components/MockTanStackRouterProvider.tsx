import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import { PropsWithChildren, ReactElement } from "react";

/**
 * Wraps stories in TanStack Router context
 */
function MockTanStackRouterProvider(props: PropsWithChildren): ReactElement {
  const { children } = props;

  const rootRoute = createRootRoute({
    component: () => <>{children}</>,
  });

  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({
      initialEntries: ["/"],
    }),
  });

  return <RouterProvider router={router} />;
}

export default MockTanStackRouterProvider;
