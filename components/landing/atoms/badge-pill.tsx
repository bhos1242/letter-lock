import { cn } from "@/lib/utils";

interface BadgePillProps {
  children: React.ReactNode;
  variant?: "blue" | "green" | "gray" | "amber" | "red";
  className?: string;
}

const variants = {
  blue: "bg-blue-50 text-blue-700 border border-blue-200",
  green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  gray: "bg-slate-100 text-slate-600 border border-slate-200",
  amber: "bg-amber-50 text-amber-700 border border-amber-200",
  red: "bg-red-50 text-red-700 border border-red-200",
};

export function BadgePill({
  children,
  variant = "blue",
  className,
}: BadgePillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
