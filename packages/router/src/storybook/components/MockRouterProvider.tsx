import { PropsWithChildren, ReactElement } from "react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";

/**
 * Wraps stories in a React Router context for Storybook
 */
function MockRouterProvider(props: PropsWithChildren): ReactElement {
  const { children } = props;

  const router = createMemoryRouter(
    [
      {
        path: "*",
        element: <>{children}</>,
      },
    ],
    {
      initialEntries: ["/"],
    }
  );

  return <RouterProvider router={router} />;
}

export default MockRouterProvider;
