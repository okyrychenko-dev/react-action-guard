import { Card } from "@heroui/react";
import type { ReactElement } from "react";

interface MetricsCardProps {
  label: string;
  value: number | string;
  description: string;
}

export function MetricsCard(props: MetricsCardProps): ReactElement {
  const { label, value, description } = props;

  return (
    <Card>
      <Card.Content className="flex flex-col gap-1.5">
        <span className="text-slate-500 text-[11px] font-bold tracking-widest uppercase">
          {label}
        </span>
        <strong className="block text-slate-900 text-4xl font-bold leading-none tabular-nums">
          {value}
        </strong>
        <p className="m-0 text-slate-500 text-xs">{description}</p>
      </Card.Content>
    </Card>
  );
}
