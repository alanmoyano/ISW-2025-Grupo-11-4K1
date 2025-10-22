// src/routes/boleteria.tsx
import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import RemoveIcon from "@mui/icons-material/Remove";
import { createFileRoute } from "@tanstack/react-router";
import { useContext } from "react";
import { ThemesContext } from "../components/ThemesContext";
import { DateChips} from "@/components/boleteria/DateChips";
import EntradasSection, { EntradaUI } from "@/components/boleteria/entradasSection";
import FormaDePagoSection from "@/components/boleteria/formaDePagoSection";


// --- Tipos y constantes (ajustá precios si querés) ---
export const TipoEntradaEnum = {
  REGULAR: 1,
  VIP: 2,
} as const;

type TipoEntradaId = (typeof TipoEntradaEnum)[keyof typeof TipoEntradaEnum];

const TIPO_ENTRADAS = [
  { id: TipoEntradaEnum.REGULAR, nombre: "Regular", precio: 5000 },
  { id: TipoEntradaEnum.VIP, nombre: "Premium", precio: 10000 }
];

export const FormaPagoEnum = { EFECTIVO: 1, MERCADO_PAGO: 2 } as const;

//type EntradaUI = {
//  id: string; // local id para editar
//  tipoEntradaId: TipoEntradaId;
//  edadVisitante: number;
//  precioCalculado: number;
//};

// --- Helpers de precio ---
function calcularPrecio(tipoId: TipoEntradaId, edad: number): { precioFinal: number; precioOriginal: number } {
  const tipo = TIPO_ENTRADAS.find((t) => t.id === tipoId)!;
  const original = tipo.precio;
  let multiplier = 1;
  if (edad < 3) multiplier = 0;
  else if ((edad >= 3 && edad <= 10)) multiplier = 0.5;
  else if (edad >= 60) multiplier = 0.5;
  else multiplier = 1;
  const finalPrice = Math.round(original * multiplier);
  return { precioFinal: finalPrice, precioOriginal: original };
}

// --- Selector de Cantidad ---
function QuantitySelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const {theme} = useContext(ThemesContext);
  return (
    <div className="mb-6 flex items-center gap-4" style={{flexDirection:"column", alignItems:"start"}}>
      <h3 className="text-gray-700 font-semibold" style={{color:theme.colors.verdePakistani}}>Cantidad de Entradas (Máx 10)</h3>
      <div className="flex items-center gap-2">
        <IconButton
          onClick={() => onChange(Math.max(1, value - 1))}
          size="small"
          className="border border-green-300"
        >
          <RemoveIcon />
        </IconButton>
        <div className="px-4 py-2 border rounded-md text-center min-w-[48px]">{value}</div>
        <IconButton
          onClick={() => onChange(Math.min(10, value + 1))}
          size="small"
          className="border border-green-300"
        >
          <AddIcon />
        </IconButton>
      </div>
    </div>
  );
}

// --- Entry Modal (add / edit) ---
function EntryModal({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: Partial<EntradaUI>;
  onClose: () => void;
  onSave: (e: { tipoEntradaId: TipoEntradaId; edadVisitante: number }) => void;
}) {
  const [tipo, setTipo] = useState<TipoEntradaId>(initial?.tipoEntradaId ?? TipoEntradaEnum.REGULAR);
  const [edad, setEdad] = useState<number>(initial?.edadVisitante ?? 0);

  const { precioFinal, precioOriginal } = calcularPrecio(tipo, edad);

  // reset when open/initial changes
  React.useEffect(() => {
    setTipo(initial?.tipoEntradaId ?? TipoEntradaEnum.REGULAR);
    setEdad(initial?.edadVisitante ?? 0);
  }, [open, initial]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle className="flex justify-between items-center">
        <span className="text-green-700 font-semibold">Agregar Entrada:</span>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <div className="flex flex-col gap-4">
          <FormControl fullWidth>
            <InputLabel id="tipo-label">Tipo de Entrada</InputLabel>
            <Select
              labelId="tipo-label"
              value={tipo}
              label="Tipo de Entrada"
              onChange={(e) => setTipo(Number(e.target.value) as TipoEntradaId)}
            >
              {TIPO_ENTRADAS.map((t) => (
                <MenuItem value={t.id} key={t.id}>
                  {t.nombre} — ${t.precio.toLocaleString()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Edad"
            type="number"
            value={edad}
            onChange={(e) => setEdad(Math.max(0, Number(e.target.value)))}
            fullWidth
            inputProps={{ min: 0 }}
          />

          <div className="mt-2">
            <Typography variant="body2">Precio Entrada</Typography>
            <div className="flex justify-between items-baseline">
              <div>
                {precioFinal < precioOriginal ? (
                  <div>
                    <span className="line-through text-sm text-gray-400 mr-3">
                      ${precioOriginal.toLocaleString()}
                    </span>
                    <span className="font-semibold">${precioFinal.toLocaleString()}</span>
                  </div>
                ) : (
                  <span className="font-semibold">${precioFinal.toLocaleString()}</span>
                )}
              </div>
              <div className="text-sm text-gray-500">Edad: {edad}</div>
            </div>
          </div>
        </div>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            if (Number.isNaN(edad) || edad < 0) return alert("Edad inválida");
            onSave({ tipoEntradaId: tipo, edadVisitante: edad });
            onClose();
          }}
        >
          Aceptar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// --- Selector de forma de pago ---
function PaymentSelector({
  selected,
  onSelect,
  onCardChange,
  cardInfo,
}: {
  selected: number | null;
  onSelect: (id: number) => void;
  onCardChange: (card: { numero?: string; venc?: string; cvv?: string }) => void;
  cardInfo: { numero?: string; venc?: string; cvv?: string };
}) {
  return (
    <div className="mb-6">
      <h3 className="text-gray-700 font-semibold mb-2">Forma de Pago</h3>
      <div className="flex gap-4 items-start">
        <div
          onClick={() => onSelect(FormaPagoEnum.EFECTIVO)}
          className={`cursor-pointer p-4 rounded-lg border ${
            selected === FormaPagoEnum.EFECTIVO ? "border-green-600 bg-green-50" : "border-gray-200 bg-white"
          }`}
        >
          <div className="text-green-700 font-semibold">Efectivo</div>
          <div className="text-sm text-gray-500">Aboná en Boletería</div>
        </div>

        <div
          onClick={() => onSelect(FormaPagoEnum.MERCADO_PAGO)}
          className={`cursor-pointer p-4 rounded-lg border ${
            selected === FormaPagoEnum.MERCADO_PAGO ? "border-green-600 bg-green-50" : "border-gray-200 bg-white"
          }`}
        >
          <div className="text-green-700 font-semibold">MERCADO_PAGO</div>
          <div className="text-sm text-gray-500">Pago con MERCADO_PAGO</div>
          {selected === FormaPagoEnum.MERCADO_PAGO && (
            <div className="mt-3 flex flex-col gap-2 max-w-xs">
              <TextField
                label="Número de MERCADO_PAGO"
                value={cardInfo.numero ?? ""}
                onChange={(e) => onCardChange({ ...cardInfo, numero: e.target.value })}
                size="small"
              />
              <div className="flex gap-2">
                <TextField
                  label="Fecha venc."
                  placeholder="MM/AA"
                  value={cardInfo.venc ?? ""}
                  onChange={(e) => onCardChange({ ...cardInfo, venc: e.target.value })}
                  size="small"
                />
                <TextField
                  label="CVV"
                  value={cardInfo.cvv ?? ""}
                  onChange={(e) => onCardChange({ ...cardInfo, cvv: e.target.value })}
                  size="small"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Página Principal Boletería ---
export default function Boleteria() {
  const isMobile = useMediaQuery("(max-width:768px)");
  const { theme } = useContext(ThemesContext);

  // fechas (puedes cargarlas desde backend)
  const availableDates = ["2025-10-22", "2025-10-23", "2025-10-24"];

  // pasos del formulario
  type Step = "fecha" | "cantidad" | "entradas" | "pago" | "revisar";
  const steps: Step[] = ["fecha", "cantidad", "entradas", "pago", "revisar"];
  const [step, setStep] = useState<Step>("fecha");
  const currentStepIndex = steps.indexOf(step);

  // datos principales
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [entries, setEntries] = useState<EntradaUI[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<number | null>(FormaPagoEnum.EFECTIVO);
  const [cardInfo, setCardInfo] = useState<{ numero?: string; venc?: string; cvv?: string }>({});
  const [sending, setSending] = useState(false);

  // navegación / validaciones de avance
  const canNextFromFecha = !!selectedDate;
  const canNextFromCantidad = quantity >= 1 && quantity <= 10;
  const canNextFromEntradas = entries.length === quantity; // exige exacto
  const canNextFromPago = !!paymentMethod;

  // callbacks
  const handleAcceptEntries = () => {
    if (entries.length !== quantity) {
      return alert(`Debes agregar exactamente ${quantity} entradas para continuar`);
    }
    setStep("pago");
    const el = document.getElementById("payment-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // total dinámico
  const total = useMemo(() => entries.reduce((s, e) => s + e.precioCalculado, 0), [entries]);

  // Si se reduce la cantidad por debajo de entradas existentes, cortarlas
  const handleQuantityChange = (v: number) => {
    if (v < entries.length) {
      if (!confirm("Reducir la cantidad eliminará entradas ya agregadas. Continuar?")) return;
      setEntries((prev) => prev.slice(0, v));
    }
    setQuantity(v);
  };

  // Construye el body del request
  const buildRequestBody = () => {
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
  };

  // Envío final — imprime request y response en consola solamente
  const handleSubmit = async () => {
    if (!selectedDate) return alert("Seleccioná una fecha");
    if (entries.length !== quantity) return alert(`Debes agregar exactamente ${quantity} entradas`);
    if (!paymentMethod) return alert("Seleccioná una forma de pago");

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
        const msg = (parsed && (parsed.message || parsed.error)) || `Error en el servidor (${res.status})`;
        throw new Error(msg);
      }

      alert("Pedido enviado correctamente");
      // reset
      setEntries([]);
      setSelectedDate(null);
      setQuantity(1);
      setPaymentMethod(FormaPagoEnum.EFECTIVO);
      setStep("fecha");
    } catch (err: any) {
      console.error(err);
      alert("Error al enviar pedido: " + (err?.message ?? err));
    } finally {
      setSending(false);
    }
  };

  // util: decide si renderizar un paso (solo se renderizan los pasos <= currentStepIndex)
  const shouldRenderStep = (s: Step) => steps.indexOf(s) <= currentStepIndex;

  // ui: mostrar botón "Siguiente" solo cuando ese paso es el paso actual
  const renderNextButtonIfCurrent = (s: Step, onClick: () => void, disabled?: boolean, label?: string) => {
    if (step !== s) return null;
    return (
      <button
        onClick={onClick}
        className={`px-4 py-2 rounded-md bg-green-700 text-white ${disabled ? "opacity-50" : "hover:bg-green-800"}`}
        disabled={!!disabled}
      >
        {label ?? "Siguiente"}
      </button>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-800">Boletería</h1>
        <div className="text-sm text-gray-600">{`${currentStepIndex + 1} / ${steps.length}`}</div>
      </div>

      {/* --- Paso Fecha --- */}
      {shouldRenderStep("fecha") && (
        <div className="mb-6">
          <h3 className="text-gray-700 font-semibold mb-2" style={{ color: theme.colors.verdePakistani }}>
            Fechas Disponibles
          </h3>
          <DateChips
            availableDates={availableDates}
            selectedDate={selectedDate}
            onSelect={(d) => setSelectedDate(d)}
            holidays={["2025-12-25", "2025-01-01"]}
            maxAdvanceDays={2}
          />

          <div className="mt-3 flex gap-2">
            {/* Volver solo cuando este paso es el actual (aquí no se mostrará porque es el primero) */}
            {step === "fecha" && renderNextButtonIfCurrent("fecha", () => {
              if (!canNextFromFecha) return alert("Seleccioná una fecha para continuar");
              setStep("cantidad");
            }, !canNextFromFecha, "Siguiente: Cantidad")}
          </div>
        </div>
      )}

      {/* --- Paso Cantidad --- */}
      {shouldRenderStep("cantidad") && (
        <div className="mb-6 border-t pt-6">
          <QuantitySelector value={quantity} onChange={handleQuantityChange} />
          <div className="flex gap-2 mt-3">
            {/* Volver solo si este paso es actual */}
            {step === "cantidad" && <button onClick={() => setStep("fecha")} className="px-4 py-2 rounded-md border">Volver</button>}
            {renderNextButtonIfCurrent("cantidad", () => {
              if (!canNextFromCantidad) return alert("Ingresá una cantidad válida");
              setStep("entradas");
            }, !canNextFromCantidad, "Siguiente: Entradas")}
          </div>
        </div>
      )}

      {/* --- Paso Entradas --- */}
      {shouldRenderStep("entradas") && (
        <div className="mb-6 border-t pt-6">
          <EntradasSection
            quantity={quantity}
            entries={entries}
            setEntries={(updater) => setEntries((prev) => (typeof updater === "function" ? (updater as any)(prev) : updater))}
            onAcceptEntries={handleAcceptEntries}
          />

          <div className="flex gap-2 mt-3">
            {/* Volver solo si este paso es actual */}
            {step === "entradas" && <button onClick={() => setStep("cantidad")} className="px-4 py-2 rounded-md border">Volver</button>}
            {renderNextButtonIfCurrent("entradas", () => {
              if (!canNextFromEntradas) return alert(`Debes agregar exactamente ${quantity} entradas para continuar`);
              setStep("pago");
            }, !canNextFromEntradas, "Siguiente: Pago")}
          </div>
        </div>
      )}

      {/* --- Paso Pago --- */}
      {shouldRenderStep("pago") && (
        <div id="payment-section" className="mb-6 border-t pt-6">
          <FormaDePagoSection selected={paymentMethod} onSelect={(id) => setPaymentMethod(id)} />

          <div className="flex gap-2 mt-3">
            {/* Volver solo si este paso es actual */}
            {step === "pago" && <button onClick={() => setStep("entradas")} className="px-4 py-2 rounded-md border">Volver</button>}
            {renderNextButtonIfCurrent("pago", () => {
              if (!canNextFromPago) return alert("Seleccioná una forma de pago");
              setStep("revisar");
            }, !canNextFromPago, "Siguiente: Revisar")}
          </div>
        </div>
      )}

      {/* --- Paso Revisar & Enviar --- */}
      {shouldRenderStep("revisar") && (
        <div className="mb-6 border-t pt-6">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-gray-700 font-semibold">Resumen</h3>
              <div className="text-sm text-gray-600">
                Total: <span className="font-semibold text-green-700">${total.toLocaleString()}</span>
              </div>
            </div>

            <div className="mb-3">
              <div><strong>Fecha:</strong> {selectedDate ?? "-"}</div>
              <div><strong>Cantidad elegida:</strong> {quantity}</div>
              <div><strong>Entradas agregadas:</strong> {entries.length}</div>
              <div><strong>Forma de pago:</strong> {paymentMethod === FormaPagoEnum.EFECTIVO ? "Efectivo" : paymentMethod === FormaPagoEnum.MERCADO_PAGO ? "Mercado Pago" : "-"}</div>
            </div>

            <div className="mb-4">
              <button onClick={handleSubmit} className={`px-4 py-2 rounded-md bg-green-800 text-white ${sending ? "opacity-60" : "hover:bg-green-900"}`} disabled={sending}>
                {sending ? "Enviando..." : "Enviar pedido"}
              </button>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            {/* Volver solo si este paso es actual */}
            {step === "revisar" && <button onClick={() => setStep("pago")} className="px-4 py-2 rounded-md border">Volver</button>}
          </div>
        </div>
      )}
    </div>
  );
}




// TanStack route export (si usas createFileRoute pattern)
export const Route = createFileRoute("/boleteria")({
  component: Boleteria,
});
