import type { ReactNode } from "react";

export type ToolIconName =
  | "arrow" | "swap" | "image" | "code" | "calculator"
  | "search" | "check" | "shield" | "spark" | "copy"
  | "crop" | "color" | "grid" | "scan" | "ruler" | "close";

const paths: Record<ToolIconName, ReactNode> = {
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  swap: <><path d="M4 8h16l-4-4M20 16H4l4 4" /></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="8" cy="8" r="1.5" /><path d="m3 17 6-6 4 4 3-3 5 5" /></>,
  code: <><path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16" /></>,
  calculator: <><rect x="5" y="2" width="14" height="20" rx="3" /><path d="M8 6h8M8 11h2m4 0h2m-8 4h2m4 0h2m-8 4h2m4 0h2" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  shield: <><path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Z" /><path d="m8 12 3 3 5-6" /></>,
  spark: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" /></>,
  copy: <><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
  crop: <path d="M7 3v12a2 2 0 0 0 2 2h12M3 7h12a2 2 0 0 1 2 2v12" />,
  color: <><circle cx="12" cy="12" r="9" /><path d="M12 3v18" /><path d="M12 7h6m-6 5h9m-9 5h6" /></>,
  grid: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 10h18M10 3v18" /></>,
  scan: <><path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3M3 12h18" /></>,
  ruler: <><path d="m3 16 13-13 5 5L8 21l-5-5Z" /><path d="m8 11 2 2m2-6 2 2m-9 6 2 2" /></>,
  close: <path d="m6 6 12 12M6 18 18 6" />,
};

export default function ToolIcon({ name, className }: {
  name: ToolIconName;
  className?: string;
}) {
  return (
    <svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
      strokeLinejoin="round" className={className}>
      {paths[name]}
    </svg>
  );
}
