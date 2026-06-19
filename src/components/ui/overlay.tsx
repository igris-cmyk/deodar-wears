"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { Button, IconButton } from "./primitives";

export function Drawer({
  label,
  trigger,
  children,
}: {
  label: string;
  trigger: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setOpen(true)}>
        {trigger}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/30" role="presentation">
          <div
            ref={panelRef}
            aria-label={label}
            aria-modal="true"
            className="ml-auto h-full w-full max-w-sm bg-[var(--surface)] p-6 shadow-2xl"
            role="dialog"
            tabIndex={-1}
          >
            <div className="mb-8 flex justify-end">
              <IconButton label="Close menu" onClick={() => setOpen(false)}>
                ×
              </IconButton>
            </div>
            {children}
          </div>
        </div>
      ) : null}
    </>
  );
}

export function Dialog({
  title,
  children,
  triggerLabel,
}: {
  title: string;
  children: ReactNode;
  triggerLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <section
            aria-modal="true"
            role="dialog"
            aria-labelledby="dialog-title"
            className="w-full max-w-lg border border-[var(--border-strong)] bg-[var(--surface)] p-6"
          >
            <h2 id="dialog-title" className="heading-3">
              {title}
            </h2>
            <div className="mt-4">{children}</div>
            <div className="mt-6">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
