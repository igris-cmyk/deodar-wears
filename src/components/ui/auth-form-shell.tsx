import type { ReactNode } from "react";

export function AuthFormShell({
  title,
  children,
  aside,
}: {
  title: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="grid gap-8 border-y border-[var(--border)] py-10">
      <div>
        <p className="label text-[var(--accent)]">Identity</p>
        <h1 className="heading-2 mt-3">{title}</h1>
      </div>
      {children}
      {aside ? (
        <div className="body-s text-[var(--foreground-muted)]">{aside}</div>
      ) : null}
    </section>
  );
}
