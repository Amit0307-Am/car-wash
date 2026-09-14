"use client";

type AdminAction = {
  key: string;
  label: string;
  action: string;
  variant?: "emerald" | "sky" | "red" | "slate";
  confirmText?: string;
};

type AdminActionFormsProps = {
  bookingId: string;
  returnTo: string;
  actions: AdminAction[];
};

export function AdminActionForms({ bookingId, returnTo, actions }: AdminActionFormsProps) {
  return (
    <>
      {actions.map((button) => {
        const variantClassName =
          button.variant === "emerald"
            ? "w-full rounded-full border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20"
            : button.variant === "sky"
              ? "w-full rounded-full border border-sky-500/50 bg-sky-500/10 px-3 py-2 text-sm font-medium text-sky-200 transition hover:bg-sky-500/20"
              : button.variant === "red"
                ? "w-full rounded-full border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/20"
                : "w-full rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10";

        return (
          <form
            key={button.key}
            action={`/api/admin/bookings/${bookingId}`}
            method="post"
            className="flex-1"
            onSubmit={(event) => {
              if (button.confirmText && !window.confirm(button.confirmText)) {
                event.preventDefault();
              }
            }}
          >
            <input type="hidden" name="action" value={button.action} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <button type="submit" className={variantClassName}>
              {button.label}
            </button>
          </form>
        );
      })}
    </>
  );
}
