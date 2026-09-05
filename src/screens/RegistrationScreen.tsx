import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Button, Badge, Card, Input, Select, Icon, Divider } from "../components/ui";
import { api } from "../services/api";
import { SquadModel } from "../types";

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
    showAlert,
    squads,
    addSquad,
  } = useApp();

  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<"solo" | "team">("team");
  const [nick, setNick] = useState(currentUser?.nickname || "GamerNick");
  const [discord, setDiscord] = useState(currentUser?.discordTag || "Nick#1337");

  // Estado de selección de escuadra/dúo/clan
  const [selectedSquadId, setSelectedSquadId] = useState<string>("");

  // Modal informativo para advertir restricción de solo en torneo Dúo / Escuadra
  const [showSoloRestrictionModal, setShowSoloRestrictionModal] = useState(false);

  // Modal para crear un nuevo Dúo o Escuadra directamente en el flujo de inscripción
  const [showCreateSquadModal, setShowCreateSquadModal] = useState(false);
  const [inlineSquadName, setInlineSquadName] = useState("");
  const [inlinePartnerNick, setInlinePartnerNick] = useState("");

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

  // Determinar requerimiento de formato según el modo del torneo
  const getFormatRequirement = (tMode: string = ""): "SOLO" | "DUO" | "SQUAD" => {
    const m = (tMode || "").toLowerCase();
    if (m.includes("1v1") || m.includes("solitario") || m.includes("solo") || m.includes("cara a cara")) {
      return "SOLO";
    }
    if (m.includes("2v2") || m.includes("duo") || m.includes("dúo") || m.includes("parejas")) {
      return "DUO";
    }
    return "SQUAD";
  };

  const tournamentRequirement = getFormatRequirement(tournament.mode);
  const isTeamOrDuoTournament = tournamentRequirement === "DUO" || tournamentRequirement === "SQUAD";

  // Inyectar script de Wompi Widget en segundo plano
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).WidgetCheckout) {
      const script = document.createElement("script");
      script.src = "https://checkout.wompi.co/widget.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Sincronizar nickname y discord cuando el perfil del usuario se actualice
  useEffect(() => {
    if (currentUser?.nickname && currentUser.nickname !== "Invitado") {
      setNick(currentUser.nickname);
    }
    if (currentUser?.discordTag) {
      setDiscord(currentUser.discordTag);
    }
  }, [currentUser]);

  // Si el torneo exige Dúo o Escuadra, forzar la modalidad predeterminada a equipo
  useEffect(() => {
    if (isTeamOrDuoTournament) {
      setMode("team");
    }
  }, [tournament.id, isTeamOrDuoTournament]);

  // Preparar opciones de grupos disponibles
  const matchingSquads = (squads || []).filter(
    (sq) => !sq.game || sq.game.toLowerCase() === tournament.game?.toLowerCase()
  );
  const otherSquads = (squads || []).filter(
    (sq) => sq.game && sq.game.toLowerCase() !== tournament.game?.toLowerCase()
  );
  const allUserSquads = [...matchingSquads, ...otherSquads];

  // Seleccionar automáticamente el primer grupo disponible si no hay seleccionado
  useEffect(() => {
    if (!selectedSquadId) {
      if (allUserSquads.length > 0) {
        setSelectedSquadId(allUserSquads[0].id);
      } else if (myTeam && myTeam.name && myTeam.name !== "Sin Clan Oficial" && myTeam.name !== "Lobo Solitario") {
        setSelectedSquadId(`clan-${myTeam.id}`);
      } else {
        setSelectedSquadId("clan-primary");
      }
    }
  }, [allUserSquads, myTeam, selectedSquadId]);

  // Obtener el nombre y el id representativo del grupo elegido
  const getSelectedParticipantInfo = () => {
    if (mode === "solo") {
      return { id: currentUser?.id || "player-me", name: nick || currentUser?.nickname || "Jugador" };
    }

    const foundSquad = (squads || []).find((sq) => sq.id === selectedSquadId);
    if (foundSquad) {
      return { id: foundSquad.id, name: foundSquad.name };
    }

    if (myTeam && myTeam.name && myTeam.name !== "Sin Clan Oficial" && myTeam.name !== "Lobo Solitario") {
      return { id: myTeam.id, name: myTeam.name };
    }

    return { id: currentUser?.id || "team-custom", name: `Escuadra de ${nick}` };
  };

  const selectedParticipant = getSelectedParticipantInfo();

  const handleSelectSolo = () => {
    if (isTeamOrDuoTournament) {
      setShowSoloRestrictionModal(true);
      return;
    }
    setMode("solo");
  };

  const handleCreateInlineSquad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineSquadName.trim()) return;

    const newSq: SquadModel = {
      id: `sq-${Date.now()}`,
      name: inlineSquadName.trim(),
      game: tournament.game,
      tournamentName: tournament.title,
      status: "ACTIVE",
      members: [
        { name: currentUser?.nickname || nick || "Capitán", role: "Capitán", userId: currentUser?.id },
        ...(inlinePartnerNick.trim()
          ? [{ name: inlinePartnerNick.trim(), role: "Titular" as const }]
          : []),
      ],
    };

    addSquad(newSq);
    setSelectedSquadId(newSq.id);
    setShowCreateSquadModal(false);
    setInlineSquadName("");
    setInlinePartnerNick("");
    showAlert(
      "Grupo Creado",
      `¡"${newSq.name}" ha sido creado y seleccionado para este torneo!`,
      "success"
    );
  };

  const handleInitiatePayment = async () => {
    setIsProcessing(true);
    try {
      const teamIdToRegister = mode === "team" ? selectedParticipant.id : undefined;
      const intent = await api.payments.createIntent(tournament.id, {
        teamId: teamIdToRegister,
        nick,
        discord,
      });

      if (intent.isFree) {
        await registerCurrentTeamToTournament(tournament.id, selectedParticipant);
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
              await registerCurrentTeamToTournament(tournament.id, selectedParticipant);
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
        await registerCurrentTeamToTournament(tournament.id, selectedParticipant);
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
    if (step === 1 && isTeamOrDuoTournament && mode === "solo") {
      setShowSoloRestrictionModal(true);
      return;
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      if (isPaidTournament) {
        handleInitiatePayment();
      } else {
        registerCurrentTeamToTournament(tournament.id, selectedParticipant);
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

  // Opciones para el Selector de Grupo (Dúo / Escuadra / Clan)
  const squadSelectOptions = [
    ...allUserSquads.map((sq) => ({
      value: sq.id,
      label: `👥 ${sq.name} (${sq.members.length} miembros${sq.game ? ` · ${sq.game}` : ""})`,
    })),
    ...(myTeam && myTeam.name && myTeam.name !== "Sin Clan Oficial" && myTeam.name !== "Lobo Solitario"
      ? [
          {
            value: `clan-${myTeam.id}`,
            label: `🛡️ Clan Oficial: ${myTeam.name} [${myTeam.tag}] (${myTeam.members.length} jugadores)`,
          },
        ]
      : []),
    {
      value: "clan-primary",
      label: `⚔️ Alineación Rápida (${nick}'s Squad)`,
    },
  ];

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
                  {["Modalidad", "Datos y Grupo", "Confirmar"][s - 1]}
                </span>
                {s < 3 && <div className={`flex-1 w-8 h-px ${s < step ? "bg-[#22C55E]" : "bg-[#27272A]"}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 md:px-6 py-8">
        {/* Banner Informativo con la Descripción Oficial del Torneo configurada por el Admin */}
        {tournament.description && (
          <div className="mb-6 p-4 rounded-xl border border-[#D4860A]/30 bg-[#D4860A]/5 space-y-1.5 animate-in fade-in">
            <div className="flex items-center gap-2 text-[#D4860A] font-bold text-xs uppercase tracking-wider">
              <span>📢</span> Información Importante de la Organización
            </div>
            <p className="text-xs text-[#FAFAFA] leading-relaxed whitespace-pre-line">
              {tournament.description}
            </p>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-[#FAFAFA] mb-1">Selecciona tu modalidad</h2>
            <p className="text-[#71717A] text-sm mb-4">
              Este torneo se disputa en formato <strong className="text-[#D4860A]">{tournament.mode}</strong> ({tournamentRequirement === "DUO" ? "Dúos" : tournamentRequirement === "SQUAD" ? "Escuadras" : "Individual"}).
            </p>

            {/* Aviso informativo si el torneo requiere Dúo o Escuadra */}
            {isTeamOrDuoTournament && (
              <div className="mb-5 p-3 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10 flex items-start gap-2.5 text-xs text-[#F59E0B]">
                <span className="text-base shrink-0">⚠️</span>
                <div>
                  <strong className="block font-semibold">Inscripción en grupo requerida:</strong>
                  Por reglamento oficial de este torneo, la participación es en{" "}
                  {tournamentRequirement === "DUO" ? "parejas (Dúo 2v2)" : "escuadra o equipo"}.
                  Los registros individuales como jugador solitario no están permitidos.
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Opción Equipo / Dúo */}
              <button
                onClick={() => setMode("team")}
                className={`p-5 rounded-xl border-2 text-left cursor-pointer transition-all relative ${
                  mode === "team"
                    ? "border-[#D4860A] bg-[#D4860A]/10 shadow-[0_0_20px_#D4860A1a]"
                    : "border-[#27272A] bg-[#111113] hover:border-[#3F3F46]"
                }`}
              >
                <div className="text-2xl mb-3">{tournamentRequirement === "DUO" ? "👥" : "🛡️"}</div>
                <div className="font-semibold text-[#FAFAFA] mb-1">
                  {tournamentRequirement === "DUO" ? "En Dúo (Pareja)" : "Con mi Escuadra / Clan"}
                </div>
                <div className="text-sm text-[#71717A]">
                  {tournamentRequirement === "DUO"
                    ? "Inscribe a tu dúo o selecciona el grupo creado con tu compañero de juego."
                    : "Inscribes a tu escuadra con los integrantes y alineación registrada."}
                </div>
                {mode === "team" && (
                  <div className="mt-3">
                    <Badge variant="primary">
                      <Icon.Check />
                      Recomendado
                    </Badge>
                  </div>
                )}
              </button>

              {/* Opción Solo */}
              <button
                onClick={handleSelectSolo}
                className={`p-5 rounded-xl border-2 text-left cursor-pointer transition-all relative ${
                  mode === "solo"
                    ? "border-[#D4860A] bg-[#D4860A]/10"
                    : isTeamOrDuoTournament
                    ? "border-[#27272A]/70 bg-[#111113]/60 opacity-60 hover:opacity-80 hover:border-[#EF4444]/50"
                    : "border-[#27272A] bg-[#111113] hover:border-[#3F3F46]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl">🎯</div>
                  {isTeamOrDuoTournament && (
                    <Badge variant="danger" className="text-[10px]">
                      Restringido
                    </Badge>
                  )}
                </div>
                <div className="font-semibold text-[#FAFAFA] mb-1 flex items-center gap-2">
                  Jugador Individual (Solo)
                  {isTeamOrDuoTournament && <span className="text-xs text-[#EF4444]">🔒</span>}
                </div>
                <div className="text-sm text-[#71717A]">
                  {isTeamOrDuoTournament
                    ? `No disponible en torneos de ${tournamentRequirement === "DUO" ? "Dúos" : "Escuadras"}.`
                    : "Participas como jugador libre o individual en formato 1v1 / FFA."}
                </div>
                {mode === "solo" && (
                  <div className="mt-3">
                    <Badge variant="primary">
                      <Icon.Check />
                      Seleccionado
                    </Badge>
                  </div>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-[#FAFAFA] mb-2">Tus datos y alineación</h2>
            <p className="text-[#71717A] text-sm mb-6">
              Confirma tu información y selecciona el grupo con el que vas a competir.
            </p>

            <div className="space-y-5">
              <Input
                label="Nick en el juego"
                value={nick}
                onChange={setNick}
                placeholder="TuNick#0001"
                required
                hint={`Debe coincidir exactamente con tu nombre en ${tournament.game}`}
              />

              <Input
                label="Discord / Contacto"
                value={discord}
                onChange={setDiscord}
                placeholder="Usuario#1234"
                hint="Para recibir accesos a salas privadas y coordinación de partidas"
              />

              {/* Selector de Dúo o Escuadra */}
              {mode === "team" && (
                <div className="p-4 rounded-xl border border-[#27272A] bg-[#141417] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <label className="text-sm font-semibold text-[#FAFAFA] flex items-center gap-2">
                        <span>{tournamentRequirement === "DUO" ? "👥 Dúo con el que deseas competir" : "🛡️ Escuadra o Clan a inscribir"}</span>
                        <Badge variant="primary" className="text-[10px]">Requerido</Badge>
                      </label>
                      <p className="text-xs text-[#71717A]">
                        Selecciona el grupo específico creado para este torneo o crea uno nuevo al instante.
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCreateSquadModal(true)}
                      className="shrink-0 text-xs py-1.5 px-3 border-[#D4860A]/40 hover:border-[#D4860A] text-[#D4860A]"
                    >
                      + Crear {tournamentRequirement === "DUO" ? "Dúo" : "Escuadra"}
                    </Button>
                  </div>

                  <Select
                    value={selectedSquadId}
                    onChange={(v) => setSelectedSquadId(v)}
                    options={squadSelectOptions}
                  />

                  {/* Detalle visual del grupo seleccionado */}
                  <div className="text-xs text-[#A1A1AA] bg-[#18181B] p-3 rounded-lg border border-[#27272A] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📌</span>
                      <span>
                        Inscribiendo como: <strong className="text-[#FAFAFA]">{selectedParticipant.name}</strong>
                      </span>
                    </div>
                    <button
                      onClick={() => setShowCreateSquadModal(true)}
                      className="text-[#D4860A] hover:underline font-medium cursor-pointer"
                    >
                      Cambiar o crear otro
                    </button>
                  </div>
                </div>
              )}

              <Card className="p-4 border-[#3B82F6]/20 bg-[#3B82F6]/5">
                <div className="flex items-start gap-2 text-sm text-[#A1A1AA]">
                  <span className="text-[#3B82F6] mt-0.5 shrink-0"><Icon.Info /></span>
                  <span>
                    Al inscribirte confirmas que cumples los requisitos de participación del modo <strong>{tournament.mode}</strong> y aceptas el reglamento oficial de TopRival.
                  </span>
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
                {
                  label: "Modalidad",
                  value: mode === "solo"
                    ? "Jugador Individual"
                    : `${tournamentRequirement === "DUO" ? "Dúo" : "Escuadra"}: ${selectedParticipant.name}`,
                },
                { label: "Capitán / Registrante", value: nick },
                { label: "Contacto / Discord", value: discord },
                { label: "Fecha de inicio", value: `${tournament.startDate} · ${tournament.startTime}` },
                { label: "Costo de inscripción", value: tournament.entryFee || "Gratis" },
                ...(tournament.description
                  ? [{ label: "Nota / Instrucciones", value: tournament.description }]
                  : []),
              ].map((r) => (
                <div key={r.label} className="flex justify-between text-sm gap-4">
                  <span className="text-[#71717A] shrink-0">{r.label}</span>
                  <span className="text-[#FAFAFA] font-medium text-right">{r.value}</span>
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

        {/* MODAL INFORMATIVO: Restricción Solo en Torneo Dúo / Escuadra */}
        {showSoloRestrictionModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 border-[#EF4444]/40 bg-[#111113] space-y-5 animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-2xl text-[#EF4444] mx-auto">
                {tournamentRequirement === "DUO" ? "👥" : "🛡️"}
              </div>

              <div className="text-center space-y-2">
                <Badge variant="danger" className="text-xs">Modalidad No Permitida</Badge>
                <h3 className="text-lg font-bold text-[#FAFAFA]">
                  {tournamentRequirement === "DUO"
                    ? "Inscripción Exclusiva para Dúos"
                    : "Inscripción Exclusiva para Escuadras"}
                </h3>
                <p className="text-sm text-[#A1A1AA] leading-relaxed">
                  Este torneo tiene formato <strong className="text-[#FAFAFA]">{tournament.mode}</strong>. No es posible inscribirse como jugador individual (solo).
                </p>
                <p className="text-xs text-[#71717A]">
                  Debes seleccionar o crear un {tournamentRequirement === "DUO" ? "Dúo" : "Escuadra"} con tu compañero o compañeros de equipo para asegurar tu cupo en la competencia.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#D4860A]/30 bg-[#D4860A]/10 text-xs text-[#F5B830] space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <span>💡</span> ¿No tienes un {tournamentRequirement === "DUO" ? "Dúo" : "Escuadra"} lista?
                </div>
                <div>
                  Puedes crearla rápidamente ahora mismo o buscar compañeros activos en la sección de Equipos y Agentes Libres.
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-1">
                <Button
                  fullWidth
                  variant="primary"
                  onClick={() => {
                    setShowSoloRestrictionModal(false);
                    setMode("team");
                    setShowCreateSquadModal(true);
                  }}
                  className="justify-center font-bold"
                >
                  + Crear {tournamentRequirement === "DUO" ? "mi Dúo" : "mi Escuadra"} Ahora
                </Button>
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => {
                    setShowSoloRestrictionModal(false);
                    setMode("team");
                  }}
                  className="justify-center"
                >
                  Entendido, elegir un grupo existente
                </Button>
                <button
                  onClick={() => {
                    setShowSoloRestrictionModal(false);
                    onNavigate("team");
                  }}
                  className="text-xs text-[#71717A] hover:text-[#FAFAFA] pt-1 text-center cursor-pointer transition-colors"
                >
                  🔍 Ir al tablón de Agentes Libres a reclutar compañeros →
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* MODAL PARA CREAR DÚO O ESCUADRA RÁPIDA INLINE */}
        {showCreateSquadModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 border-[#D4860A]/40 bg-[#111113] space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center border-b border-[#27272A] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#D4860A]/20 flex items-center justify-center text-base">
                    {tournamentRequirement === "DUO" ? "👥" : "🛡️"}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#FAFAFA] text-base">
                      Crear {tournamentRequirement === "DUO" ? "Nuevo Dúo" : "Nueva Escuadra"}
                    </h3>
                    <p className="text-xs text-[#71717A]">{tournament.game} · {tournament.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateSquadModal(false)}
                  className="text-[#71717A] hover:text-[#FAFAFA] cursor-pointer text-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateInlineSquad} className="space-y-4">
                <Input
                  label={`Nombre del ${tournamentRequirement === "DUO" ? "Dúo" : "Grupo / Escuadra"}`}
                  placeholder={tournamentRequirement === "DUO" ? "Ej: Dúo Dinámico, Los Hermanos..." : "Ej: Nova Strike, Los Furia..."}
                  value={inlineSquadName}
                  onChange={setInlineSquadName}
                  required
                  hint="Este nombre aparecerá en el bracket oficial de emparejamientos"
                />

                <Input
                  label={tournamentRequirement === "DUO" ? "Nick de tu Compañero de Dúo (Opcional)" : "Nick de un Integrante o Refuerzo (Opcional)"}
                  placeholder="Ej: Partner#1234"
                  value={inlinePartnerNick}
                  onChange={setInlinePartnerNick}
                  hint="Puedes añadir más jugadores o intercambiarlos antes de iniciar el torneo"
                />

                <div className="p-3 rounded-lg border border-[#27272A] bg-[#18181B] text-xs text-[#A1A1AA] flex items-start gap-2">
                  <span className="text-[#D4860A]">👑</span>
                  <span>
                    Serás registrado como el <strong>Capitán</strong> de este grupo con tu nick: <span className="text-[#FAFAFA] font-medium">{nick}</span>.
                  </span>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateSquadModal(false)}
                    className="flex-1 justify-center"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!inlineSquadName.trim()}
                    className="flex-1 justify-center font-bold"
                  >
                    Guardar y Usar
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

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
                  <span className="text-[#71717A]">Participante:</span>
                  <span className="font-semibold text-[#D4860A]">{selectedParticipant.name}</span>
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
