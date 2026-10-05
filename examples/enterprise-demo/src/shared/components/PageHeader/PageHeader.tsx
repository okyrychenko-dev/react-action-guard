import type { ReactElement } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PageHeader(props: PageHeaderProps): ReactElement {
  const { eyebrow, title, description } = props;

  return (
    <div className="flex flex-col gap-1.5">
      <p className="m-0 text-teal-600 text-[11px] font-bold tracking-widest uppercase">{eyebrow}</p>
      <h1 className="m-0 text-slate-900 text-2xl font-bold leading-tight">{title}</h1>
      <p className="m-0 text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
