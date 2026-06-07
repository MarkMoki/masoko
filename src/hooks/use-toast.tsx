import { createContext, useContext } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, ReactNode, useCallback } from "react";

type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error";
  priority?: number;
};

type ToastContextType = {
  toasts: ToastProps[];
  toast: (props: {
    title?: string;
    description?: string;
    variant?: "default" | "success" | "error";
  }) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastVariants = cva(
  "pointer-events-auto relative flex w-full max-w-sm items-start justify-between gap-4 rounded-md border px-6 py-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-ring",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        success: "bg-green-50 border-green-200 text-green-900",
        error: "bg-red-50 border-red-200 text-red-900",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const toastListRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback(
    ({
      title,
      description,
      variant = "default",
    }: {
      title?: string;
      description?: string;
      variant?: "default" | "success" | "error";
    }) => {
      const id = Math.random().toString(36).slice(2);
      const priority = variant === "error" ? 2 : variant === "success" ? 1 : 0;
      setToasts((prev) => [...prev, { id, title, description, variant, priority }].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0)));
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (toasts.length > 0) {
      const lastToast = toastListRef.current?.lastElementChild;
      if (lastToast) {
        (lastToast as HTMLElement).focus();
      }
    }
  }, [toasts.length]);

  return (
    <ToastContext.Provider value={{ toasts, toast: showToast, dismiss }}>
      {children}
      <div
        ref={toastListRef}
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-0 right-0 z-[100] flex flex-col gap-2 p-4 w-full max-w-sm sm:w-auto"
      >
        {toasts.map(({ id, title, description, variant }) => (
          <div
            key={id}
            className={cn(toastVariants({ variant }))}
            tabIndex={-1}
            role="alert"
          >
            <div className="flex-1">
              {title && (
                <div className="text-sm font-semibold">
                  {title}
                </div>
              )}
              {description && (
                <div className="text-sm opacity-90 mt-1">
                  {description}
                </div>
              )}
            </div>
            <button
              onClick={() => dismiss(id)}
              className="absolute right-2 top-2 rounded p-1 text-xs hover:bg-muted focus:ring-2 focus:ring-ring"
              aria-label="Close toast"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function Toaster() {
  return null;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}