import type { ReactElement } from "react";

interface SectionNoteProps {
  children: string;
}

export function SectionNote(props: SectionNoteProps): ReactElement {
  const { children } = props;

  return <p className="m-0 text-slate-500 text-[13px] leading-relaxed">{children}</p>;
}
