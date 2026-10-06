import { useState } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { routes } from "./routes";
import type { ReactElement } from "react";

export function App(): ReactElement {
  const [router] = useState(() => createBrowserRouter([...routes]));

  return <RouterProvider router={router} />;
}
