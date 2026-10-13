import { memo } from "react";

export const Stat = memo(
  ({
    label,
    value,
    valueClassName = "text-zinc-100",
  }: {
    label: string;
    value: string;
    valueClassName?: string;
  }) => (
    <div className="min-w-0 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p
        className={`mt-2 truncate font-mono text-lg font-medium tabular-nums ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  ),
);
