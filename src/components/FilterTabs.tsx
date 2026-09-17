import Link from "next/link";

interface Option {
  value: string;
  label: string;
}

interface FilterTabsProps {
  basePath: string;
  paramName: string;
  options: Option[];
  activeValue: string;
  otherParams?: Record<string, string>;
}

export function FilterTabs({
  basePath,
  paramName,
  options,
  activeValue,
  otherParams = {},
}: FilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const params = new URLSearchParams({ ...otherParams, [paramName]: opt.value });
        const isActive = opt.value === activeValue;
        return (
          <Link
            key={opt.value}
            href={`${basePath}?${params.toString()}`}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              isActive
                ? "border-seq-450 bg-seq-450 text-white"
                : "border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            {opt.label}
          </Link>
        );
      })}
    </div>
  );
}
