import type { ReactNode } from "react";
import AppControls from "../components/AppControls";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppControls />
        {children}
      </body>
    </html>
  );
}
