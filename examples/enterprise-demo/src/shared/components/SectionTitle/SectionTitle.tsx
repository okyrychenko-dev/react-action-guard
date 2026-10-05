import { TITLE_CLASS, TITLE_TAG } from "./SectionTitle.constants";
import type { ReactElement } from "react";
import type { SectionTitleVariant } from "./SectionTitle.types";

interface SectionTitleProps {
  eyebrow: string;
  title: string;
  variant?: SectionTitleVariant;
}

export function SectionTitle(props: SectionTitleProps): ReactElement {
  const { eyebrow, title, variant = "section" } = props;

  const Tag = TITLE_TAG[variant];

  return (
    <div>
      <p className="m-0 mb-0.5 text-teal-600 text-[11px] font-bold tracking-widest uppercase">
        {eyebrow}
      </p>
      <Tag className={TITLE_CLASS[variant]}>{title}</Tag>
    </div>
  );
}
