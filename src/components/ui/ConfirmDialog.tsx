"use client";

import { useState, useCallback, createContext, useContext, useRef } from "react";
import { AlertTriangle, HelpCircle } from "lucide-react";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    message: "",
  });
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setOpen(true);
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    setOpen(false);
    resolveRef.current?.(true);
  };

  const handleCancel = () => {
    setOpen(false);
    resolveRef.current?.(false);
  };

  const btnColor =
    options.variant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : options.variant === "warning"
        ? "bg-yellow-500 hover:bg-yellow-600 text-white"
        : "bg-goto-green hover:bg-goto-dark text-white";

  const iconConfig =
    options.variant === "danger"
      ? { bg: "bg-red-100", color: "text-red-600", Icon: AlertTriangle }
      : options.variant === "warning"
        ? { bg: "bg-yellow-100", color: "text-yellow-600", Icon: AlertTriangle }
        : { bg: "bg-goto-light", color: "text-goto-green", Icon: HelpCircle };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 animate-fade-in">
          <div className="bg-surface rounded-2xl shadow-2xl border border-border max-w-lg w-full mx-4 p-8">
            <div className="flex items-start gap-5">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconConfig.bg}`}>
                <iconConfig.Icon className={`h-6 w-6 ${iconConfig.color}`} />
              </div>
              <div className="flex-1">
                {options.title && (
                  <h3 className="text-xl font-bold text-txt-primary mb-2">
                    {options.title}
                  </h3>
                )}
                <p className="text-base text-txt-secondary leading-relaxed">{options.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={handleCancel}
                className="inline-flex items-center justify-center rounded-xl border border-border bg-surface-secondary px-6 py-3 text-base font-semibold text-txt-primary transition-all hover:bg-surface-tertiary"
              >
                {options.cancelText || "Batal"}
              </button>
              <button
                onClick={handleConfirm}
                className={`inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold transition-all ${btnColor}`}
              >
                {options.confirmText || "Ya, Lanjutkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
