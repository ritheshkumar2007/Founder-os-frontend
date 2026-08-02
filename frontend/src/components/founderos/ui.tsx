import { Link } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { useState, type ReactNode, type TextareaHTMLAttributes, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  right,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  right?: ReactNode;
}) {
  return (
    <header className="os-window-open flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-primary font-mono font-medium">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-display font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {right}
    </header>
  );
}

export function Panel({
  title,
  children,
  className,
  action,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn("panel os-window-open rounded-2xl p-6 border border-border/80 bg-card text-card-foreground shadow-[var(--shadow-panel)]", className)}>
      {title || action ? (
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-border/60 pb-3">
          {title ? (
            <h2 className="text-xs font-mono font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

const btn =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function Button({
  variant = "primary",
  size,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "subtle";
  size?: "sm" | "md" | "lg" | string;
}) {
  const variants = {
    primary: "btn-system text-foreground hover:brightness-110 shadow-[var(--shadow-glow)]",
    outline: "btn-frosted border border-border text-foreground hover:border-primary/40 hover:text-accent-foreground",
    ghost: "text-muted-foreground hover:bg-white/5 hover:text-foreground",
    subtle: "bg-surface-2 border border-border/60 text-foreground hover:bg-white/5",
  } as const;
  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-4 py-2 text-sm rounded-xl",
    lg: "px-6 py-3 text-base rounded-xl",
  } as const;
  const sizeClass = size && size in sizes ? sizes[size as keyof typeof sizes] : "";
  return <button className={cn(btn, variants[variant], sizeClass, className)} {...props} />;
}

export function LinkButton({
  to,
  children,
  variant = "outline",
  className,
  disabled,
}: {
  to: string;
  children: ReactNode;
  variant?: "primary" | "outline";
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Link
      to={disabled ? undefined : (to as any)}
      onClick={(e) => {
        if (disabled) e.preventDefault();
      }}
      aria-disabled={disabled}
      className={cn(
        btn,
        variant === "primary"
          ? "btn-system text-foreground hover:brightness-110 shadow-[var(--shadow-glow)]"
          : "btn-frosted border border-border text-foreground hover:border-primary/40 hover:text-accent-foreground",
        disabled && "pointer-events-none opacity-40 shadow-none cursor-not-allowed",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase font-mono tracking-[0.18em] text-muted-foreground">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-muted-foreground/70">{hint}</span> : null}
    </label>
  );
}

const control =
  "w-full rounded-xl border border-input bg-surface/80 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition focus:border-primary/80 focus:ring-2 focus:ring-primary/20";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(control, props.className)} />;
}

export function TextArea(props: TextAreaHTMLProps) {
  return <textarea rows={3} {...props} className={cn(control, "resize-y", props.className)} />;
}
type TextAreaHTMLProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? <Check className="size-4 text-[#46E3A3]" /> : <Copy className="size-4" />}
      {copied ? "Copied" : label}
    </Button>
  );
}

export function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div className="space-y-2">
      {label ? (
        <div className="flex justify-between text-xs font-mono text-muted-foreground">
          <span>{label}</span>
          <span className="text-primary font-semibold">{Math.round(value)}%</span>
        </div>
      ) : null}
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2 border border-border/40">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#4F8CFF] to-[#64D8FF] transition-all duration-700 ease-out shadow-[0_0_12px_rgba(79,140,255,0.4)]"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-surface/70 p-4 transition-all duration-200 hover:border-primary/30">
      <p className="text-xs uppercase font-mono tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-foreground">{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-border/80 bg-surface/30 px-4 py-6 text-sm text-muted-foreground">
      {children}
    </p>
  );
}