import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Button, Badge, Card, Icon } from "../components/ui";
import { api } from "../services/api";

type Screen = "home" | "tournaments" | "rankings" | "dashboard" | "bracket" | "match" | "report" | "champion" | "login" | "register" | "detail" | "registration" | "confirmation" | "requests" | "team" | "admin";

export function ReportResultScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { currentMatch, reportMatchResult, currentUser } = useApp();
  const [myScore, setMyScore] = useState(2);
  const [rivalScore, setRivalScore] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState<string>("https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&fit=crop&auto=format");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const myNick = currentUser?.nickname || currentMatch?.participantA?.name || "Tú";
  const rivalNick = (currentMatch?.participantA?.name === myNick ? currentMatch?.participantB?.name : currentMatch?.participantA?.name) || "Rival";
  const roundTitle = currentMatch?.roundName || "Ronda Oficial";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);

      // Previsualización inmediata en base64
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEvidencePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      // Subida al backend mediante API Multer
      try {
        setIsUploading(true);
        const res = await api.upload.image(file);
        if (res && res.url) {
          setEvidenceUrl(res.url);
        }
      } catch (err) {
        console.warn("Error uploading evidence to backend, keeping local preview:", err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSendResult = () => {
    reportMatchResult(
      myScore,
      rivalScore,
      evidencePreview || evidenceUrl
    );
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center mx-auto mb-5">
            <span className="text-[#22C55E] scale-150"><Icon.Check /></span>
          </div>
          <Badge variant="success" className="mb-4">Resultado Enviado</Badge>
          <h2 className="text-xl font-bold text-[#FAFAFA] mb-2">Resultado reportado</h2>
          <p className="text-[#A1A1AA] text-sm mb-6">
            Tu resultado ha sido enviado. El administrador validará el marcador.
            Si hay una disputa, será revisada en máximo 24 horas.
          </p>
          <div className="flex gap-3">
            <Button fullWidth onClick={() => onNavigate("bracket")}>
              Ver bracket
            </Button>
            <Button variant="outline" fullWidth onClick={() => onNavigate("champion")}>
              Resultado final
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B]">
      {/* Header */}
      <div className="bg-[#111113] border-b border-[#27272A]">
        <div className="max-w-lg mx-auto px-4 md:px-6 py-5">
          <button
            onClick={() => onNavigate("match")}
            className="flex items-center gap-1 text-sm text-[#71717A] hover:text-[#A1A1AA] mb-3 cursor-pointer transition-colors"
          >
            ← Volver al partido
          </button>
          <h1 className="text-xl font-bold text-[#FAFAFA]">Reportar Resultado</h1>
          <p className="text-sm text-[#71717A] mt-1">{roundTitle} — {myNick} vs {rivalNick}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 md:px-6 py-6 space-y-5">
        {/* Score selector */}
        <Card className="p-5">
          <h2 className="font-semibold text-[#FAFAFA] mb-5">Marcador final (Bo3)</h2>
          <div className="flex items-center justify-center gap-8">
            {/* My score */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-sm font-medium text-[#F5B830]">{myNick} (tú)</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMyScore(Math.max(0, myScore - 1))}
                  className="w-8 h-8 rounded-full bg-[#27272A] hover:bg-[#3F3F46] text-[#FAFAFA] font-bold transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono text-4xl font-bold text-[#FAFAFA] w-8 text-center">
                  {myScore}
                </span>
                <button
                  onClick={() => setMyScore(Math.min(2, myScore + 1))}
                  className="w-8 h-8 rounded-full bg-[#27272A] hover:bg-[#3F3F46] text-[#FAFAFA] font-bold transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <span className="font-mono text-2xl text-[#52525B]">—</span>

            {/* Rival score */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-sm font-medium text-[#A1A1AA]">{rivalNick}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setRivalScore(Math.max(0, rivalScore - 1))}
                  className="w-8 h-8 rounded-full bg-[#27272A] hover:bg-[#3F3F46] text-[#FAFAFA] font-bold transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono text-4xl font-bold text-[#FAFAFA] w-8 text-center">
                  {rivalScore}
                </span>
                <button
                  onClick={() => setRivalScore(Math.min(2, rivalScore + 1))}
                  className="w-8 h-8 rounded-full bg-[#27272A] hover:bg-[#3F3F46] text-[#FAFAFA] font-bold transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {myScore === rivalScore ? (
            <div className="mt-4 text-center text-xs text-[#F59E0B]">
              El marcador no puede estar empatado en Bo3
            </div>
          ) : (
            <div className="mt-4 text-center">
              <Badge variant={myScore > rivalScore ? "success" : "danger"}>
                {myScore > rivalScore ? "🏆 Ganaste" : "Perdiste este partido"}
              </Badge>
            </div>
          )}
        </Card>

        {/* Screenshot upload */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[#FAFAFA]">Evidencia fotográfica (requerida)</h2>
            <Badge variant="warning">Obligatorio</Badge>
          </div>
          <label className="block border-2 border-dashed border-[#D4860A]/50 bg-[#D4860A]/5 rounded-xl p-6 text-center hover:border-[#D4860A] transition-all cursor-pointer relative overflow-hidden">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {evidencePreview ? (
              <div className="space-y-3">
                <img
                  src={evidencePreview}
                  alt="Captura de evidencia"
                  className="w-full max-h-48 object-contain rounded-lg border border-[#27272A] bg-black/40 mx-auto shadow-md"
                />
                <div className="flex items-center justify-center gap-2 text-xs text-[#22C55E] font-medium">
                  <span>✓ {fileName || "Captura cargada con éxito"}</span>
                  {isUploading && <span className="text-[#F5B830] animate-pulse">• Subiendo al servidor...</span>}
                </div>
                <span className="text-[11px] text-[#71717A] block hover:text-[#D4860A] underline">
                  Haz clic para cambiar la imagen
                </span>
              </div>
            ) : (
              <>
                <div className="flex justify-center text-[#D4860A] mb-2">
                  <Icon.Upload />
                </div>
                <div className="text-sm font-semibold text-[#FAFAFA]">
                  Haz clic o arrastra tu captura de victoria/derrota
                </div>
                <div className="text-xs text-[#71717A] mt-1">
                  PNG, JPG o WEBP (máx. 10MB) • Requerido para evitar disputas arbitrales
                </div>
              </>
            )}
          </label>
        </Card>

        {/* Notes */}
        <Card className="p-5">
          <h2 className="font-semibold text-[#FAFAFA] mb-3">Notas adicionales</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Cualquier información relevante sobre el partido..."
            rows={3}
            className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2.5 text-sm text-[#FAFAFA] placeholder:text-[#52525B] focus:outline-none focus:border-[#D4860A] transition-colors resize-none"
          />
        </Card>

        {/* Warning */}
        <Card className="p-4 border-[#F59E0B]/20 bg-[#F59E0B]/5">
          <div className="flex items-start gap-2 text-xs text-[#A1A1AA]">
            <span className="text-[#F59E0B] shrink-0 mt-0.5"><Icon.AlertTriangle /></span>
            Reportar un resultado incorrecto puede resultar en descalificación. Asegúrate de que el marcador sea correcto.
          </div>
        </Card>

        <Button
          fullWidth
          size="lg"
          disabled={myScore === rivalScore}
          onClick={handleSendResult}
        >
          <Icon.Upload />
          Enviar resultado
        </Button>
      </div>
    </div>
  );
}
