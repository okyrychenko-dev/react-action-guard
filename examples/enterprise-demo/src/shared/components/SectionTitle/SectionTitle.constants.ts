import type { SectionTitleVariant } from "./SectionTitle.types";

export const TITLE_TAG = {
  section: "h2",
  card: "h3",
} as const satisfies Record<SectionTitleVariant, "h2" | "h3">;

export const TITLE_CLASS = {
  section: "m-0 text-slate-900 text-[17px] font-semibold",
  card: "m-0 text-slate-900 text-[15px] font-semibold",
} as const satisfies Record<SectionTitleVariant, string>;
