import type { RenderOptions } from "@testing-library/react";

import type { ReactNode } from "react";

export interface RenderWithProvidersOptions extends RenderOptions {
  children?: ReactNode;
}
