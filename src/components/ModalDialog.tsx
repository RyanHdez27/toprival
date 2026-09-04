import { useState, useEffect, useRef } from "react";
import { Button } from "./ui";

export interface ModalConfig {
  isOpen: boolean;
  type: "alert" | "confirm" | "prompt";
  variant?: "info" | "success" | "warning" | "danger";
  title: string;
  message: string;
  defaultValue?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  onResolve: (value: any) => void;
}

export function ModalDialog({ config, onClose }: { config: ModalConfig | null; onClose: (val: any) => void }) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (config?.isOpen) {
      setInputValue(config.defaultValue || "");
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [config]);

  if (!config || !config.isOpen) return null;

  const {
    type,
    variant = type === "confirm" ? "warning" : "info",
    title,
    message,
    placeholder = "Escribe aquí...",
    confirmText = type === "alert" ? "Entendido" : "Confirmar",
    cancelText = "Cancelar",
  } = config;

  const handleConfirm = () => {
    if (type === "prompt") {
      onClose(inputValue.trim() || config.defaultValue || null);
    } else if (type === "confirm") {
      onClose(true);
    } else {
      onClose(true);
    }
  };

  const handleCancel = () => {
    if (type === "confirm") {
      onClose(false);
    } else if (type === "prompt") {
      onClose(null);
    } else {
      onClose(true);
    }
  };

  const iconMap = {
    info: "ℹ️",
    success: "✓",
    warning: "⚠️",
    danger: "✕",
  };

  const borderMap = {
    info: "border-[#3B82F6]/30 shadow-[0_0_30px_#3B82F615]",
    success: "border-[#22C55E]/30 shadow-[0_0_30px_#22C55E15]",
    warning: "border-[#D4860A]/40 shadow-[0_0_30px_#D4860A15]",
    danger: "border-[#EF4444]/40 shadow-[0_0_30px_#EF444415]",
  };

  const badgeColorMap = {
    info: "bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30",
    success: "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30",
    warning: "bg-[#D4860A]/15 text-[#D4860A] border-[#D4860A]/30",
    danger: "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30",
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && type === "alert") {
          handleCancel();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") handleCancel();
        if (e.key === "Enter" && type !== "prompt") handleConfirm();
      }}
    >
      <div
        className={`bg-[#111113] border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 ${borderMap[variant]}`}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#27272A] flex items-center gap-3 bg-[#18181B]/50">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm border shrink-0 ${badgeColorMap[variant]}`}>
            {iconMap[variant]}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-[#FAFAFA] truncate leading-tight">{title}</h3>
            <span className="text-[10px] text-[#71717A] uppercase tracking-wider font-semibold font-mono">
              TopRival · Mensaje del Sistema
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs md:text-sm text-[#A1A1AA] leading-relaxed whitespace-pre-wrap">{message}</p>

          {type === "prompt" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              className="pt-1"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-[#18181B] border border-[#27272A] focus:border-[#D4860A] rounded-xl px-3.5 py-2.5 text-xs md:text-sm text-[#FAFAFA] placeholder:text-[#52525B] focus:outline-none transition-colors"
              />
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#27272A] bg-[#18181B]/40 flex items-center justify-end gap-2.5">
          {type !== "alert" && (
            <Button size="sm" variant="outline" onClick={handleCancel}>
              {cancelText}
            </Button>
          )}
          <Button
            size="sm"
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
