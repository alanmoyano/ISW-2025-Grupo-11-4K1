import React, {
  JSX,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit"; // Importamos el icono de edición
import RemoveIcon from "@mui/icons-material/Remove";
import { IconButton } from "@mui/material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ThemesContext } from "../components/ThemeContext";
import DateChips from "../components/boleteria/Date-Chips";
import EntradasSection, {
  EntradaUI,
} from "../components/boleteria/Entradas-Section";
import FormaDePagoSection from "../components/boleteria/FormasDePagoSection";

export interface TipoEntrada {
  id: number;
  nombre: string;
  precio: number;
}

export interface FormaDePago {
  id: number;
  nombre: string;
}

export const FormaPagoEnum = {
  EFECTIVO: 1,
  MERCADO_PAGO: 2,
} as const;

// --- Tipos de Pasos ---
type Step = "fecha" | "cantidad" | "entradas" | "pago" | "revisar";
const STEPS: Step[] = ["fecha", "cantidad", "entradas", "pago", "revisar"];

// --- Componente de Carga y Error (sin cambios) ---
function LoadingState() {
  return (
    <div className="p-6 max-w-5xl mx-auto text-center">Cargando datos...</div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="p-6 max-w-5xl mx-auto text-center text-red-600">
      Error: {error}
    </div>
  );
}

// --- Componente Selector de Cantidad (Refactorizado) ---
function QuantitySelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const { theme } = useContext(ThemesContext);
  return (
    <div
      className="mb-6 flex items-center gap-4"
      style={{ flexDirection: "column", alignItems: "start" }}
    >
      <h3
        className="text-gray-700 font-semibold"
        style={{ color: theme.colors.verdePakistani }}
      >
        Cantidad de Entradas (Máx 10)
      </h3>
      <div className="flex items-center gap-2">
        <IconButton
          onClick={() => onChange(Math.max(1, value - 1))}
          size="small"
          className="border"
          // Uso del color de tema para el borde
          style={{ borderColor: theme.colors.verdeClaro }}
        >
          <RemoveIcon />
        </IconButton>
        <div className="px-4 py-2 border rounded-md text-center min-w-[48px]">
          {value}
        </div>
        <IconButton
          onClick={() => onChange(Math.min(10, value + 1))}
          size="small"
          className="border"
          // Uso del color de tema para el borde
          style={{ borderColor: theme.colors.verdeClaro }}
        >
          <AddIcon />
        </IconButton>
      </div>
    </div>
  );
}

// --- Página Principal Boletería ---
export default function Boleteria() {
  const { theme } = useContext(ThemesContext);
  const navigate = useNavigate();

  // fechas (sin cambios)
  const availableDates = ["2025-10-22", "2025-10-23", "2025-10-24"];

  // pasos del formulario
  const [step, setStep] = useState<Step>("fecha");
  const currentStepIndex = STEPS.indexOf(step);

  // --- Estados de datos (sin cambios) ---
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [entries, setEntries] = useState<EntradaUI[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<number | null>(
    FormaPagoEnum.EFECTIVO,
  );
  const [cardInfo] = useState<{
    numero?: string;
    venc?: string;
    cvv?: string;
  }>({});
  const [sending, setSending] = useState(false);

  // --- Estados para datos del backend (sin cambios) ---
  const [tiposDeEntrada, setTiposDeEntrada] = useState<TipoEntrada[]>([]);
  const [formasDePago, setFormasDePago] = useState<FormaDePago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Carga de datos desde el Backend (sin cambios) ---
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        setError(null);
        // Fetch Tipos de Entrada
        const resTipos = await fetch("http://localhost:3000/tipoEntradas");
        if (!resTipos.ok) throw new Error("Error al cargar tipos de entrada");
        const dataTipos = await resTipos.json();
        if (dataTipos.success) {
          setTiposDeEntrada(dataTipos.data);
        } else {
          throw new Error(dataTipos.message || "Error en API de tipos");
        }

        // Fetch Formas de Pago
        const resFormas = await fetch("http://localhost:3000/formasDePago");
        if (!resFormas.ok) throw new Error("Error al cargar formas de pago");
        const dataFormas = await resFormas.json();
        if (dataFormas.success) {
          setFormasDePago(dataFormas.data);
        } else {
          throw new Error(
            dataFormas.message || "Error en API de formas de pago",
          );
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error al cargar datos iniciales.");
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // --- Lógica de negocio y Callbacks (sin cambios) ---
  const canNextFromFecha = !!selectedDate;
  const canNextFromCantidad = quantity >= 1 && quantity <= 10;
  const canNextFromEntradas = entries.length === quantity;
  const canNextFromPago = !!paymentMethod;

  // Array para obtener la validación de paso
  const validationMap = [
    canNextFromFecha,
    canNextFromCantidad,
    canNextFromEntradas,
    canNextFromPago,
    true,
  ];

  const total = useMemo(
    () => entries.reduce((s, e) => s + e.precioCalculado, 0),
    [entries],
  );

  const handleQuantityChange = (v: number) => {
    if (v < entries.length) {
      setEntries((prev) => prev.slice(0, v));
    }
    setQuantity(v);
  };

  const buildRequestBody = useCallback(() => {
    // ... (lógica buildRequestBody sin cambios) ...
    const body: any = {
      idFormaDePago: paymentMethod ?? null,
      fecha: selectedDate,
      entradas: entries.map((e) => ({
        tipoEntradaId: e.tipoEntradaId,
        edadVisitante: e.edadVisitante,
      })),
    };

    if (paymentMethod === FormaPagoEnum.MERCADO_PAGO) {
      if (cardInfo.numero) {
        const num = Number(String(cardInfo.numero).replace(/\s+/g, ""));
        if (!Number.isNaN(num)) body.numeroTarjeta = num;
      }
      if (cardInfo.venc) body.fechaVencimiento = cardInfo.venc;
      if (cardInfo.cvv) {
        const cvvNum = Number(cardInfo.cvv);
        if (!Number.isNaN(cvvNum)) body.codigoSeguridad = cvvNum;
      }
    }
    return body;
  }, [paymentMethod, selectedDate, entries, cardInfo]);

  // eslint-disable-next-line consistent-return
  const handleSubmit = useCallback(async () => {
    if (!canNextFromFecha) return alert("Seleccioná una fecha");
    if (!canNextFromEntradas)
      return alert(`Debes agregar exactamente ${quantity} entradas`);
    if (!canNextFromPago) return alert("Seleccioná una forma de pago");

    const body = buildRequestBody();
    console.log("Request body:", body);

    setSending(true);
    try {
      const res = await fetch("http://localhost:3000/pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let parsed;
      try {
        parsed = await res.json();
      } catch (err) {
        parsed = { ok: res.ok, status: res.status, text: await res.text() };
      }

      console.log("Response:", parsed);

      if (!res.ok) {
        const msg =
          (parsed && (parsed.message || parsed.error)) ||
          `Error en el servidor (${res.status})`;
        throw new Error(msg);
      }

      alert("Pedido enviado correctamente");
      // reset
      setEntries([]);
      setSelectedDate(null);
      setQuantity(1);
      setPaymentMethod(FormaPagoEnum.EFECTIVO);
      setStep("fecha");
      navigate({ to: "/" });
    } catch (err: any) {
      console.error(err);
      alert(`Error al enviar pedido: ${err?.message ?? err}`);
    } finally {
      setSending(false);
    }
  }, [
    canNextFromFecha,
    canNextFromEntradas,
    canNextFromPago,
    quantity,
    buildRequestBody,
    navigate,
  ]);

  // --- Mapeo de contenido de pasos (sin cambios en la estructura, solo estilos) ---
  const stepContentMap: Record<Step, JSX.Element> = {
    fecha: (
      <>
        <h3
          className="text-gray-700 font-semibold mb-2"
          style={{ color: theme.colors.verdePakistani }}
        >
          Fechas Disponibles
        </h3>
        <DateChips
          availableDates={availableDates}
          selectedDate={selectedDate}
          onSelect={(d) => setSelectedDate(d)}
          holidays={["2025-12-25", "2025-01-01"]}
          maxAdvanceDays={2}
        />
      </>
    ),
    cantidad: (
      <QuantitySelector value={quantity} onChange={handleQuantityChange} />
    ),
    entradas: (
      <EntradasSection
        quantity={quantity}
        entries={entries}
        setEntries={setEntries}
        tiposDeEntrada={tiposDeEntrada}
      />
    ),
    pago: (
      <div id="payment-section">
        <FormaDePagoSection
          selected={paymentMethod}
          onSelect={(id) => setPaymentMethod(id)}
          formasDePago={formasDePago}
        />
      </div>
    ),
    revisar: (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-gray-700 font-semibold">Resumen</h3>
          <div className="text-sm text-gray-600">
            Total:{" "}
            <span
              className="font-semibold"
              // Uso del color de tema
              style={{ color: theme.colors.verdeIndia }}
            >
              ${total.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="mb-3">
          <div>
            <strong>Fecha:</strong> {selectedDate ?? "-"}
          </div>
          <div>
            <strong>Cantidad de entradas:</strong> {entries.length}
          </div>
          <div>
            <strong>Forma de pago:</strong>{" "}
            {formasDePago.find((f) => f.id === paymentMethod)?.nombre ?? "-"}
          </div>
        </div>

        {/* Botón de envío integrado en el paso de Revisar (Refactorizado) */}
        <div className="mb-4">
          <button
            type="submit"
            onClick={handleSubmit}
            className={`px-4 py-2 rounded-md text-white ${
              sending ? "opacity-60" : "hover:opacity-90"
            }`}
            style={{ backgroundColor: theme.colors.verdePakistani }}
            disabled={sending}
          >
            {sending ? "Enviando..." : "Enviar pedido"}
          </button>
        </div>
      </div>
    ),
  };

  const stepTitles: Record<Step, string> = {
    fecha: "1. Seleccionar Fecha",
    cantidad: "2. Cantidad de Entradas",
    entradas: "3. Detalle de Entradas",
    pago: "4. Forma de Pago",
    revisar: "5. Revisar y Confirmar",
  };

  // --- Lógica para aplicar estilos de tema al Stepper ---
  const getStepStyles = (
    isCurrent: boolean,
    isComplete: boolean,
  ): React.CSSProperties => {
    if (isCurrent) {
      return {
        borderColor: theme.colors.verdePakistani,
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        backgroundColor: "white",
      };
    }
    if (isComplete) {
      return {
        borderColor: theme.colors.verdeClaro,
        backgroundColor: theme.colors.nyanza,
      };
    }
    return {
      borderColor: theme.colors.gris,
      backgroundColor: theme.colors.grisClaro,
      opacity: 0.6,
    };
  };

  // --- Renderizado Principal (Renders all steps for stepper effect) ---
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1
          className="text-3xl font-bold"
          style={{ color: theme.colors.verdePakistani }}
        >
          Boletería
        </h1>
        <div className="text-sm text-gray-600">{`${currentStepIndex + 1} / ${
          STEPS.length
        }`}</div>
      </div>

      {STEPS.map((stepKey, index) => {
        const isCurrent = index === currentStepIndex;
        const isComplete = index < currentStepIndex;
        const canNext = validationMap[index];

        return (
          <div
            key={stepKey}
            className="mb-6 p-4 border rounded-lg transition-all duration-300"
            style={getStepStyles(isCurrent, isComplete)} // Estilos dinámicos
          >
            {/* Encabezado del paso */}
            <div
              role="button"
              tabIndex={isComplete ? 0 : -1}
              className={`flex justify-between items-center ${
                isComplete ? "cursor-pointer" : ""
              }`}
              onClick={() => isComplete && setStep(stepKey)}
              onKeyDown={(e) => {
                if (isComplete && (e.key === "Enter" || e.key === " ")) {
                  setStep(stepKey);
                  e.preventDefault();
                }
              }}
            >
              <h2
                className={`text-xl font-bold ${
                  isComplete ? "text-gray-600" : ""
                }`}
                // Color del título del paso
                style={{
                  color: isComplete
                    ? theme.colors.grisOscuro
                    : theme.colors.verdePakistani,
                }}
              >
                {stepTitles[stepKey]}
              </h2>
              {/* Muestra icono de edición si el paso está completo */}
              {isComplete && (
                <EditIcon className="text-gray-500 cursor-pointer" />
              )}
            </div>

            {/* Contenido y Navegación */}
            <div
              className={`transition-all duration-300 overflow-hidden ${isCurrent ? "max-h-screen mt-4 pt-4 border-t" : "max-h-0"}`}
            >
              {/* Renderizar contenido */}
              {stepContentMap[stepKey]}

              {/* Botones de navegación (solo en el paso actual y no en 'revisar') */}
              {isCurrent && stepKey !== "revisar" && (
                <div className="flex gap-2 mt-3">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => setStep(STEPS[index - 1])}
                      className="px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-100"
                    >
                      Volver
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setStep(STEPS[index + 1])}
                    disabled={!canNext}
                    className={`px-4 py-2 rounded-md text-white ${
                      !canNext
                        ? "cursor-not-allowed opacity-50"
                        : "hover:opacity-90"
                    }`}
                    // Estilos de tema para el botón Siguiente
                    style={{
                      backgroundColor: !canNext
                        ? theme.colors.verdeClaro
                        : theme.colors.verdeIndia,
                    }}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
            {/* Texto de resumen para pasos completados */}
            {isComplete && !isCurrent && stepKey !== "revisar" && (
              <div className="text-sm text-gray-500 pt-2">
                Paso completado. Click en el título para editar.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// TanStack route export (sin cambios)
export const Route = createFileRoute("/boleteria")({
  component: Boleteria,
});
