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

export function TournamentShareModal({
  tournament,
  isOpen,
  onClose,
}: {
  tournament: {
    id: string;
    title: string;
    game: string;
    gameIcon?: string;
    mode?: string;
    startDate?: string;
    entryFee?: string;
    prizePool?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !tournament) return null;

  // URL directa y única para este torneo
  const shareUrl = `${window.location.origin}${window.location.pathname}#/tournament/${tournament.id}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(shareUrl)}&bgcolor=18-18-27&color=212-134-10&margin=8`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    const text = `🔥 ¡Compite en el torneo de ${tournament.game}: "${tournament.title}" en TopRival! ⚔️\n🏆 Premio: ${tournament.prizePool || "Oficial"}\n📅 Fecha: ${tournament.startDate || "Próximamente"}\n🔗 Inscríbete o consulta el bracket aquí:\n${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111113] border border-[#D4860A]/40 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-black/80 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#27272A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4860A]/20 border border-[#D4860A]/40 flex items-center justify-center text-lg">
              {tournament.gameIcon || "🏆"}
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#FAFAFA] line-clamp-1">{tournament.title}</h3>
              <p className="text-[11px] text-[#71717A]">{tournament.game} · {tournament.mode || "Competitivo"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#71717A] hover:text-[#FAFAFA] text-lg font-bold cursor-pointer w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#18181B] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center text-center space-y-5">
          {/* QR Code Container */}
          <div className="relative p-4 rounded-2xl bg-[#18181B] border border-[#27272A] shadow-inner flex flex-col items-center">
            <img
              src={qrApiUrl}
              alt={`QR para ${tournament.title}`}
              className="w-48 h-48 rounded-xl object-contain"
              loading="lazy"
            />
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#D4860A] font-semibold tracking-wide uppercase">
              <span>📱</span> Escanea para acceder al torneo
            </div>
          </div>

          {/* Direct link input */}
          <div className="w-full space-y-2 text-left">
            <label className="text-xs font-semibold text-[#A1A1AA] flex items-center justify-between">
              <span>Enlace Directo del Torneo:</span>
              <span className="text-[10px] text-[#71717A] font-mono">ID: {tournament.id}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-[#18181B] border border-[#27272A] focus:border-[#D4860A] rounded-xl px-3 py-2 text-xs text-[#FAFAFA] font-mono truncate focus:outline-none"
              />
              <Button
                size="sm"
                variant={copied ? "primary" : "outline"}
                onClick={handleCopyLink}
                className="shrink-0 text-xs px-3"
              >
                {copied ? "¡Copiado!" : "Copiar"}
              </Button>
            </div>
          </div>

          {/* Social share buttons */}
          <div className="w-full pt-1 flex gap-2.5">
            <Button
              fullWidth
              variant="outline"
              size="sm"
              onClick={handleWhatsAppShare}
              className="justify-center text-xs border-[#22C55E]/30 text-[#22C55E] hover:bg-[#22C55E]/10"
            >
              💬 Compartir en WhatsApp
            </Button>
            <Button
              fullWidth
              variant="primary"
              size="sm"
              onClick={handleCopyLink}
              className="justify-center text-xs font-bold"
            >
              {copied ? "✓ Enlace Copiado" : "🔗 Copiar Enlace"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
