import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-neon-green text-carbon-950 shadow-glow hover:bg-green-300",
        variant === "secondary" && "border border-white/15 bg-white/10 text-white hover:bg-white/15",
        variant === "ghost" && "text-slate-300 hover:bg-white/10 hover:text-white",
        className
      )}
      {...props}
    />
  );
}
