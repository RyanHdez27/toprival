import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Button, Badge, Card, Input, Select, Icon, Divider } from "../components/ui";
import { api } from "../services/api";

type Screen =
  | "home"
  | "tournaments"
  | "rankings"
  | "requests"
  | "team"
  | "admin"
  | "dashboard"
  | "bracket"
  | "match"
  | "report"
  | "champion"
  | "login"
  | "register"
  | "detail"
  | "registration"
  | "confirmation";

type PaymentMethodType = "NEQUI" | "BANCOLOMBIA" | "PSE" | "CARD";

export function RegistrationScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const {
    selectedTournament,
    myTeam,
    currentUser,
    registerCurrentTeamToTournament,
    isAuthenticated,
    setLastPaymentReceipt,
    showAlert
  } = useApp();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<"solo" | "team">("team");
  const [nick, setNick] = useState(currentUser?.nickname || "GamerNick");
  const [discord, setDiscord] = useState(currentUser?.discordTag || "Nick#1337");

  // Estado del flujo de pago Wompi
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>("NEQUI");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [currentIntent, setCurrentIntent] = useState<any>(null);
  const tournament = selectedTournament || {
    id: "ff-live-01",
    title: "Torneo TopRival",
    game: "FreeFire",
    gameIcon: "🔥",
    mode: "Squads 4v4",
    startDate: "15 Sep 2026",
    startTime: "20:00 COT",
    entryFee: "Gratis",
  };

  const isPaidTournament = Boolean(
    tournament.entryFee &&
      !["gratis", "free", "$0", "0"].includes(tournament.entryFee.toLowerCase().trim())
  );

  // Inyectar script de Wompi Widget en segundo plano
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).WidgetCheckout) {
      const script = document.createElement("script");
      script.src = "https://checkout.wompi.co/widget.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleInitiatePayment = async () => {
    setIsProcessing(true);
    try {
      const teamIdToRegister = mode === "team" ? myTeam?.id : undefined;
      const intent = await api.payments.createIntent(tournament.id, {
        teamId: teamIdToRegister,
        nick,
        discord,
      });

      if (intent.isFree) {
        await registerCurrentTeamToTournament(tournament.id);
        setLastPaymentReceipt(null);
        onNavigate("confirmation");
        return;
      }

      setCurrentIntent(intent);

      // Si el widget de Wompi está inyectado, intentar abrirlo
      if ((window as any).WidgetCheckout && intent.publicKey && intent.signature) {
        try {
          const checkout = new (window as any).WidgetCheckout({
            currency: intent.currency || "COP",
            amountInCents: intent.amountInCents,
            reference: intent.reference,
            publicKey: intent.publicKey,
            signature: { integrity: intent.signature },
            redirectUrl: window.location.origin + "/#/confirmation",
          });

          checkout.open(async function (result: any) {
            const tx = result?.transaction;
            if (tx && tx.status === "APPROVED") {
              await registerCurrentTeamToTournament(tournament.id);
              setLastPaymentReceipt({
                reference: tx.reference || intent.reference || "WOMPI-TR",
                gateway: "WOMPI",
                amountFormatted: intent.amountFormatted || tournament.entryFee || "$15.000 COP",
                amountInCents: intent.amountInCents || 1500000,
                currency: "COP",
                paymentMethodType: tx.payment_method_type || selectedMethod,
                status: "APPROVED",
                tournamentTitle: tournament.title,
                customerName: nick,
                paidAt: new Date().toLocaleString("es-CO"),
                registrationId: tx.id || "reg-wompi",
              });
              onNavigate("confirmation");
            } else if (tx && tx.status === "DECLINED") {
              showAlert("Transacción Declinada", "El pago no fue aprobado por la entidad financiera.", "warning");
            } else if (tx && tx.status === "ERROR") {
              showAlert("Error en Transacción", "Ocurrió un error al procesar la transacción con el banco.", "danger");
            }
          });
          setIsProcessing(false);
          return;
        } catch (widgetErr) {
          console.warn("Wompi WidgetCheckout falló o fue bloqueado, abriendo pasarela modal interactiva:", widgetErr);
        }
      }

      // Si el widget no cargó o está en sandbox interactivo, abrir pasarela modal
      setPaymentModalOpen(true);
    } catch (err: any) {
      console.error("Detalle del error en pasarela:", err);
      showAlert(
        "Error en la Pasarela de Pago",
        err.message || "No se pudo comunicar con el servidor de pagos. Por favor verifica tu conexión.",
        "danger"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulatePaymentApproval = async () => {
    if (!currentIntent?.reference) return;
    setIsProcessing(true);
    try {
      const res = await api.payments.simulateSandboxApproval(currentIntent.reference, selectedMethod);
      if (res.success) {
        await registerCurrentTeamToTournament(tournament.id);
        setLastPaymentReceipt({
          reference: currentIntent.reference,
          gateway: "WOMPI",
          amountFormatted: currentIntent.amountFormatted || tournament.entryFee || "$15.000 COP",
          amountInCents: currentIntent.amountInCents || 1500000,
          currency: "COP",
          paymentMethodType: selectedMethod,
          status: "APPROVED",
          tournamentTitle: tournament.title,
          customerName: nick,
          paidAt: new Date().toLocaleString("es-CO"),
          registrationId: res.registrationId || "reg-wompi-sim",
        });
        setPaymentModalOpen(false);
        onNavigate("confirmation");
      }
    } catch (err: any) {
      showAlert("Error en Sandbox", err.message || "No se pudo procesar la transacción", "danger");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      if (isPaidTournament) {
        handleInitiatePayment();
      } else {
        registerCurrentTeamToTournament(tournament.id);
        setLastPaymentReceipt(null);
        onNavigate("confirmation");
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center px-4 py-8">
        <Card className="max-w-md w-full p-6 text-center space-y-4 border-[#D4860A]/40 bg-[#111113]">
          <div className="w-12 h-12 rounded-xl bg-[#D4860A]/20 flex items-center justify-center text-[#D4860A] mx-auto text-xl">
            <Icon.Swords />
          </div>
          <h2 className="text-xl font-bold text-[#FAFAFA]">Inscripción a Torneo</h2>
          <p className="text-sm text-[#A1A1AA]">
            Para inscribir a tu equipo o competir en <strong className="text-[#FAFAFA]">{tournament.title}</strong> necesitas tener una cuenta en TopRival.
          </p>
          <div className="pt-2 flex flex-col gap-2.5">
            <Button fullWidth size="lg" onClick={() => onNavigate("login")}>
              Iniciar Sesión
            </Button>
            <Button fullWidth variant="outline" size="lg" onClick={() => onNavigate("register")}>
              Crear Cuenta Gratis
            </Button>
            <button
              onClick={() => onNavigate("detail")}
              className="text-xs text-[#71717A] hover:text-[#FAFAFA] pt-2 cursor-pointer transition-colors"
            >
              ← Volver a los detalles del torneo
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col">
      {/* Header */}
      <div className="bg-[#111113] border-b border-[#27272A]">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-5">
          <button
            onClick={() => (step === 1 ? onNavigate("detail") : setStep(step - 1))}
            className="flex items-center gap-1 text-sm text-[#71717A] hover:text-[#A1A1AA] mb-4 cursor-pointer transition-colors"
          >
            ← {step === 1 ? "Volver al torneo" : "Paso anterior"}
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#D4860A]/20 flex items-center justify-center text-lg">
              {tournament.gameIcon}
            </div>
            <div>
              <h1 className="font-bold text-[#FAFAFA]">Inscripción — {tournament.title}</h1>
              <p className="text-sm text-[#71717A]">{tournament.game} · {tournament.mode} · {tournament.startDate}</p>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    s < step
                      ? "bg-[#22C55E] text-white"
                      : s === step
                      ? "bg-[#D4860A] text-white"
                      : "bg-[#27272A] text-[#71717A]"
                  }`}
                >
                  {s < step ? <Icon.Check /> : s}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${s === step ? "text-[#FAFAFA]" : "text-[#71717A]"}`}>
                  {["Modalidad", "Datos", "Confirmar"][s - 1]}
                </span>
                {s < 3 && <div className={`flex-1 w-8 h-px ${s < step ? "bg-[#22C55E]" : "bg-[#27272A]"}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 md:px-6 py-8">
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-[#FAFAFA] mb-2">Selecciona tu modalidad</h2>
            <p className="text-[#71717A] text-sm mb-6">¿Participas solo o con un equipo?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(["solo", "team"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`p-5 rounded-xl border-2 text-left cursor-pointer transition-all ${
                    mode === m
                      ? "border-[#D4860A] bg-[#D4860A]/10"
                      : "border-[#27272A] bg-[#111113] hover:border-[#3F3F46]"
                  }`}
                >
                  <div className="text-2xl mb-3">{m === "solo" ? "🎯" : "🛡️"}</div>
                  <div className="font-semibold text-[#FAFAFA] mb-1">
                    {m === "solo" ? "Jugador Individual" : "Con mi Equipo"}
                  </div>
                  <div className="text-sm text-[#71717A]">
                    {m === "solo"
                      ? "Participas como jugador libre. El organizador puede asignarte equipo."
                      : "Inscribes a tu equipo completo (mínimo 5 jugadores)."}
                  </div>
                  {mode === m && (
                    <div className="mt-3">
                      <Badge variant="primary">
                        <Icon.Check />
                        Seleccionado
                      </Badge>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-[#FAFAFA] mb-2">Tus datos</h2>
            <p className="text-[#71717A] text-sm mb-6">
              Confirma tu información para la inscripción.
            </p>
            <div className="space-y-4">
              <Input
                label="Nick en el juego"
                value={nick}
                onChange={setNick}
                placeholder="TuNick#0001"
                required
                hint="Debe coincidir exactamente con tu nombre en Valorant"
              />
              {mode === "team" && (
                <Select
                  label="Seleccionar equipo"
                  value={myTeam?.id || "solo"}
                  options={[
                    { value: myTeam?.id || "solo", label: `${myTeam?.name || "Sin Clan"} (${myTeam?.members?.length || 0} miembros)` },
                  ]}
                />
              )}
              <Card className="p-4 border-[#3B82F6]/20 bg-[#3B82F6]/5">
                <div className="flex items-start gap-2 text-sm text-[#A1A1AA]">
                  <span className="text-[#3B82F6] mt-0.5 shrink-0"><Icon.Info /></span>
                  Al inscribirte confirmas que cumples los requisitos de participación y aceptas el reglamento oficial de TopRival.
                </div>
              </Card>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#FAFAFA] mb-1">
                {isPaidTournament ? "Pago e Inscripción Oficial" : "Confirmar inscripción"}
              </h2>
              <p className="text-[#71717A] text-sm mb-4">
                {isPaidTournament
                  ? "Asegura tu cupo en el torneo a través de la pasarela oficial Wompi Bancolombia."
                  : "Revisa los datos antes de confirmar tu cupo."}
              </p>
            </div>

            <Card className="p-5 space-y-3">
              {[
                { label: "Torneo", value: tournament.title },
                { label: "Juego", value: tournament.game },
                { label: "Modalidad", value: mode === "solo" ? "Jugador Individual" : `Equipo: ${myTeam?.name || "Sin Clan"}` },
                { label: "Capitán / Nick", value: nick },
                { label: "Fecha de inicio", value: `${tournament.startDate} · ${tournament.startTime}` },
                { label: "Costo de inscripción", value: tournament.entryFee || "Gratis" },
              ].map((r) => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-[#71717A]">{r.label}</span>
                  <span className="text-[#FAFAFA] font-medium">{r.value}</span>
                </div>
              ))}
              <Divider />
              <div className="flex justify-between text-sm items-center">
                <span className="text-[#71717A]">Estado de cupo</span>
                {isPaidTournament ? (
                  <Badge variant="live">Pendiente de Pago</Badge>
                ) : (
                  <Badge variant="success">Cupo Inmediato Gratuito</Badge>
                )}
              </div>
            </Card>

            {/* Bloque Wompi si el torneo es de pago */}
            {isPaidTournament && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-[#D4860A]/30 bg-[#D4860A]/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💳</span>
                      <div>
                        <h4 className="text-sm font-bold text-[#FAFAFA]">Pasarela Oficial</h4>
                        <p className="text-[11px] text-[#71717A]">Pagos 100% seguros y encriptados en pesos colombianos</p>
                      </div>
                    </div>
                    <Badge variant="primary" className="text-[10px]">Verificado</Badge>
                  </div>

                  <div className="pt-2 border-t border-[#27272A] grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "NEQUI", label: "Nequi", icon: "📱", desc: "Push instantáneo" },
                      { id: "BANCOLOMBIA", label: "Bancolombia", icon: "🟡", desc: "Transferencia / QR" },
                      { id: "PSE", label: "PSE", icon: "🏛️", desc: "Cualquier banco" },
                      { id: "CARD", label: "Tarjetas", icon: "💳", desc: "Débito / Crédito" },
                    ].map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMethod(m.id as PaymentMethodType)}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          selectedMethod === m.id
                            ? "border-[#D4860A] bg-[#D4860A]/15 text-[#FAFAFA]"
                            : "border-[#27272A] bg-[#18181B] text-[#A1A1AA] hover:border-[#3F3F46]"
                        }`}
                      >
                        <div className="text-base mb-1">{m.icon}</div>
                        <div className="text-xs font-bold">{m.label}</div>
                        <div className="text-[10px] text-[#71717A] truncate">{m.desc}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#A1A1AA] pt-1">
                    <span>Total liquidado:</span>
                    <span className="text-base font-extrabold text-[#D4860A]">
                      {tournament.entryFee}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-[#22C55E]/20 bg-[#22C55E]/5 text-xs text-[#A1A1AA] flex items-center gap-2">
                  <span className="text-[#22C55E] text-sm shrink-0">🛡️</span>
                  <span>Sin comisiones bancarias adicionales para el jugador. Cupo reservado automáticamente vía webhook tras el pago.</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={isProcessing}>
              Anterior
            </Button>
          )}
          <Button fullWidth onClick={handleSubmit} disabled={isProcessing} className="justify-center font-bold">
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin text-sm">⏳</span> Conectando con pasarela de pagos...
              </span>
            ) : step < 3 ? (
              "Continuar"
            ) : isPaidTournament ? (
              `Pagar ${tournament.entryFee} de inscripción`
            ) : (
              "Confirmar Inscripción Gratuita"
            )}
          </Button>
        </div>

        {/* Modal interactivo de Wompi Sandbox */}
        {paymentModalOpen && currentIntent && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 border-[#D4860A]/50 bg-[#111113] space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-start border-b border-[#27272A] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#D4860A]/20 flex items-center justify-center text-lg">
                    💳
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#FAFAFA]">Checkout</h3>
                    <p className="text-xs text-[#71717A]">Transacción Segura Bancolombia</p>
                  </div>
                </div>
                <button
                  onClick={() => setPaymentModalOpen(false)}
                  className="text-[#71717A] hover:text-[#FAFAFA] text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs bg-[#18181B] p-3 rounded-lg border border-[#27272A]">
                <div className="flex justify-between">
                  <span className="text-[#71717A]">Torneo:</span>
                  <span className="font-semibold text-[#FAFAFA]">{currentIntent.tournament?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71717A]">Monto a Cobrar:</span>
                  <span className="font-bold text-[#D4860A] text-sm">{currentIntent.amountFormatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71717A]">Referencia Wompi:</span>
                  <span className="font-mono text-[10px] text-[#A1A1AA]">{currentIntent.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71717A]">Método Seleccionado:</span>
                  <Badge variant="primary" className="text-[10px]">{selectedMethod}</Badge>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-[#3B82F6]/30 bg-[#3B82F6]/10 text-xs text-[#93C5FD]">
                🧪 <strong>Entorno Sandbox Activo:</strong> Puedes simular la aprobación inmediata de este pago con {selectedMethod} para validar la reserva y asignación de cupo en la base de datos de producción.
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  fullWidth
                  variant="primary"
                  onClick={handleSimulatePaymentApproval}
                  disabled={isProcessing}
                  className="justify-center font-bold"
                >
                  {isProcessing ? "Validando en Wompi..." : `Simular Pago Aprobado (${selectedMethod})`}
                </Button>
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => setPaymentModalOpen(false)}
                  disabled={isProcessing}
                  className="justify-center"
                >
                  Cancelar
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
