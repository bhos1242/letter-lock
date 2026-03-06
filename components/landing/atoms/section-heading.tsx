import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  light?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  light = false,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p className="text-sm font-semibold text-blue-500 uppercase tracking-widest mb-3">
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "text-3xl md:text-4xl font-bold tracking-tight",
          light ? "text-white" : "text-slate-900"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-lg leading-relaxed",
            light ? "text-slate-300" : "text-slate-500"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
