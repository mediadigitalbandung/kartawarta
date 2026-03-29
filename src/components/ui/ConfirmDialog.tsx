"use client";

import { useState, useCallback, createContext, useContext, useRef } from "react";
import { AlertTriangle } from "lucide-react";

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

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 animate-fade-in">
          <div className="bg-white rounded-[12px] shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start gap-4">
              {options.variant === "danger" && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              )}
              <div className="flex-1">
                {options.title && (
                  <h3 className="text-lg font-semibold text-txt-primary mb-1">
                    {options.title}
                  </h3>
                )}
                <p className="text-sm text-txt-secondary">{options.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCancel}
                className="btn-secondary px-4 py-2 text-sm"
              >
                {options.cancelText || "Batal"}
              </button>
              <button
                onClick={handleConfirm}
                className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-all ${btnColor}`}
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
