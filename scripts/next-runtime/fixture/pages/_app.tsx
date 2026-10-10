import { UIBlockingProvider } from "@okyrychenko-dev/react-action-guard";
import type { AppProps } from "next/app";
import PagesControls from "../components/PagesControls";

export default function Application(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <UIBlockingProvider>
      <PagesControls />
      <Component {...pageProps} />
    </UIBlockingProvider>
  );
}
