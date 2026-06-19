import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "quiet" | "danger";

function buttonClass(variant: Variant = "primary") {
  const base =
    "inline-flex min-h-11 items-center justify-center gap-2 border px-4 py-2 text-sm font-semibold transition-colors";
  const variants = {
    primary: "border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-foreground)]",
    secondary: "border-[var(--border-strong)] bg-transparent text-[var(--foreground)]",
    quiet:
      "border-transparent bg-transparent text-[var(--foreground)] underline-offset-4 hover:underline",
    danger: "border-[var(--destructive)] bg-[var(--destructive)] text-white",
  };

  return `${base} ${variants[variant]}`;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentPropsWithoutRef<"button"> & { variant?: Variant }) {
  return <button className={`${buttonClass(variant)} ${className}`} {...props} />;
}

export function LinkButton({
  variant = "primary",
  className = "",
  ...props
}: ComponentPropsWithoutRef<typeof Link> & { variant?: Variant }) {
  return <Link className={`${buttonClass(variant)} ${className}`} {...props} />;
}

export function IconButton({
  label,
  className = "",
  ...props
}: ComponentPropsWithoutRef<"button"> & { label: string }) {
  return (
    <button
      aria-label={label}
      className={`inline-flex size-11 items-center justify-center border border-[var(--border-strong)] bg-transparent ${className}`}
      {...props}
    />
  );
}

export function Field({ children }: { children: ReactNode }) {
  return <div className="grid gap-2">{children}</div>;
}

export function FieldLabel(props: ComponentPropsWithoutRef<"label">) {
  return <label className="text-sm font-semibold" {...props} />;
}

export function FieldDescription(props: ComponentPropsWithoutRef<"p">) {
  return <p className="body-s text-[var(--foreground-muted)]" {...props} />;
}

export function FieldError(props: ComponentPropsWithoutRef<"p">) {
  return (
    <p role="alert" className="body-s min-h-5 text-[var(--destructive)]" {...props} />
  );
}

export function Input(props: ComponentPropsWithoutRef<"input">) {
  return (
    <input
      className="min-h-11 w-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-base"
      {...props}
    />
  );
}

export function PasswordInput(props: ComponentPropsWithoutRef<"input">) {
  return <Input autoComplete="current-password" type="password" {...props} />;
}

export function Textarea(props: ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      className="min-h-28 w-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-base"
      {...props}
    />
  );
}

export function Checkbox(props: ComponentPropsWithoutRef<"input">) {
  return <input className="size-5 accent-[var(--brand)]" type="checkbox" {...props} />;
}

export function Select(props: ComponentPropsWithoutRef<"select">) {
  return (
    <select
      className="min-h-11 w-full border border-[var(--border-strong)] bg-[var(--surface)] px-3"
      {...props}
    />
  );
}

export function Alert({
  tone = "info",
  children,
}: {
  tone?: "info" | "success" | "warning" | "error";
  children: ReactNode;
}) {
  const color = {
    info: "var(--info-raw)",
    success: "var(--success)",
    warning: "var(--warning)",
    error: "var(--destructive)",
  }[tone];

  return (
    <div
      role="status"
      className="border-l-4 bg-[var(--surface)] p-4"
      style={{ borderColor: color }}
    >
      {children}
    </div>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="utility inline-flex border border-[var(--border)] px-2 py-1">
      {children}
    </span>
  );
}

export function Separator() {
  return <hr className="border-0 border-t border-[var(--border)]" />;
}

export function Spinner() {
  return (
    <span aria-label="Loading" className="utility">
      Loading
    </span>
  );
}

export function Skeleton() {
  return <div aria-hidden className="h-8 w-full bg-[var(--surface-subtle)]" />;
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section className="border-y border-[var(--border)] py-8">
      <h2 className="heading-3">{title}</h2>
      {children ? (
        <div className="mt-3 body-s text-[var(--foreground-muted)]">{children}</div>
      ) : null}
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-[var(--border)] py-8">
      {eyebrow ? <p className="label text-[var(--accent)]">{eyebrow}</p> : null}
      <h1 className="heading-2 mt-3">{title}</h1>
      {children ? (
        <div className="body mt-4 max-w-[680px] text-[var(--foreground-muted)]">
          {children}
        </div>
      ) : null}
    </header>
  );
}

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1440px] px-4 md:px-8 xl:px-12 ${className}`}>
      {children}
    </div>
  );
}

export function Stack({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`grid gap-6 ${className}`}>{children}</div>;
}

export function Cluster({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>{children}</div>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return <span className="wordmark">{compact ? "DW" : "DEODAR WEARS"}</span>;
}
