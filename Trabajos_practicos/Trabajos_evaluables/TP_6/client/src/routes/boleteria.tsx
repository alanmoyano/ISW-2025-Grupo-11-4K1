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

type EntradaUI = {
  id: string; // local id para editar
  tipoEntradaId: TipoEntradaId;
  edadVisitante: number;
  precioCalculado: number;
};

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

// --- Entry Card ---
function EntryCard({
  entry,
  onEdit,
}: {
  entry: EntradaUI;
  onEdit: (id: string) => void;
}) {
  const tipo = TIPO_ENTRADAS.find((t) => t.id === entry.tipoEntradaId)!;
  const mostrarOriginal = entry.precioCalculado < tipo.precio;

  return (
    <div className="w-full rounded-lg border border-green-200 bg-white p-4 mb-4 flex justify-between items-center shadow-sm">
      <div>
        <div className="flex items-center gap-3">
          <h4 className="text-2xl font-semibold text-green-800">
            {tipo.nombre}
          </h4>
          {tipo.id === TipoEntradaEnum.VIP && (
            <span className="text-yellow-500 ml-1">♛ Premium</span>
          )}
        </div>
        <div className="text-sm text-gray-500">Edad: {entry.edadVisitante}</div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div>
          {mostrarOriginal && (
            <span className="text-xs text-gray-400 line-through mr-2">
              ${tipo.precio.toLocaleString()}
            </span>
          )}
          <span className="text-lg font-semibold text-green-700">${entry.precioCalculado.toLocaleString()}</span>
        </div>
        <Button variant="outlined" size="small" onClick={() => onEdit(entry.id)} startIcon={<EditIcon />}>
          Editar
        </Button>
      </div>
    </div>
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
  const {theme} = useContext(ThemesContext);
  // Ejemplo de fechas (podés traer del backend)
  const availableDates = ["2025-10-22", "2025-10-23", "2025-10-24"];

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [entries, setEntries] = useState<EntradaUI[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<number | null>(FormaPagoEnum.EFECTIVO);
  const [cardInfo, setCardInfo] = useState<{ numero?: string; venc?: string; cvv?: string }>({});

  // Abrir modal para nuevo
  const openAddModal = () => {
    if (entries.length >= 10) return alert("No podés agregar más de 10 entradas");
    setEditingId(null);
    setModalOpen(true);
  };

  // Abrir modal para editar
  const openEditModal = (id: string) => {
    setEditingId(id);
    setModalOpen(true);
  };

  const handleSaveEntry = (payload: { tipoEntradaId: TipoEntradaId; edadVisitante: number }) => {
    const { tipoEntradaId, edadVisitante } = payload;
    const { precioFinal } = calcularPrecio(tipoEntradaId, edadVisitante);

    if (editingId) {
      setEntries((prev) =>
        prev.map((e) => (e.id === editingId ? { ...e, tipoEntradaId, edadVisitante, precioCalculado: precioFinal } : e)),
      );
      setEditingId(null);
    } else {
      const newEntry: EntradaUI = {
        id: String(Date.now()) + Math.random().toString(36).slice(2, 7),
        tipoEntradaId,
        edadVisitante,
        precioCalculado: precioFinal,
      };
      setEntries((prev) => [...prev, newEntry]);
    }

    // sync quantity if entries grow
    setQuantity((q) => Math.max(q, entries.length + 1));
  };

  // Si se reduce la cantidad por debajo de entradas existentes, cortarlas
  const handleQuantityChange = (v: number) => {
    if (v < entries.length) {
      if (!confirm("Reducir la cantidad eliminará entradas ya agregadas. Continuar?")) return;
      setEntries((prev) => prev.slice(0, v));
    }
    setQuantity(v);
  };

  const total = useMemo(() => entries.reduce((s, e) => s + e.precioCalculado, 0), [entries]);

  // Submit
  const handleSubmit = async () => {
    if (!selectedDate) return alert("Seleccioná una fecha");
    if (entries.length < 1) return alert("Tenés que agregar al menos una entrada");
    if (entries.length > 10) return alert("No podés comprar más de 10 entradas");
    if (!paymentMethod) return alert("Seleccioná una forma de pago");

    const body = {
      idFormaDePago: paymentMethod,
      fecha: selectedDate,
      entradas: entries.map((e) => ({
        tipoEntradaId: e.tipoEntradaId,
        edadVisitante: e.edadVisitante,
      })),
      ...(paymentMethod === FormaPagoEnum.MERCADO_PAGO
        ? {
            numeroTarjeta: cardInfo.numero ? Number(cardInfo.numero.replace(/\s+/g, "")) : undefined,
            fechaVencimiento: cardInfo.venc,
            codigoSeguridad: cardInfo.cvv ? Number(cardInfo.cvv) : undefined,
          }
        : {}),
    };

    try {
      const res = await fetch("/pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error en el servidor");
      }

      alert("Pedido enviado correctamente");
      // reset o redirect
      setEntries([]);
    } catch (err: any) {
      console.error(err);
      alert("Error al enviar pedido: " + (err.message ?? err));
    }
  };

  // Edit modal initial
  const editingInitial = editingId ? entries.find((e) => e.id === editingId) : undefined;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-800">Boletería</h1>
      </div>

      <h3 className="text-gray-700 font-semibold mb-2" style={{color:theme.colors.verdePakistani}}>Fechas Disponibles</h3>
      <DateChips
        availableDates={availableDates}
        selectedDate={selectedDate}
        onSelect={(d) => setSelectedDate(d)}
        holidays={["2025-12-25", "2025-01-01"]}
        maxAdvanceDays={2}
      />


      <QuantitySelector value={quantity} onChange={handleQuantityChange} />

      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-gray-700 font-semibold" style={{color:theme.colors.verdePakistani}}>Entradas</h3>
        <div className="flex items-center gap-3">
          <Button variant="outlined" onClick={openAddModal} startIcon={<AddIcon />}>
            Agregar Entrada
          </Button>
        </div>
      </div>

      <div>
        {entries.length === 0 && <div className="text-gray-400">No hay entradas agregadas aún.</div>}

        {entries.map((e) => (
          <EntryCard key={e.id} entry={e} onEdit={openEditModal} />
        ))}

        <div className="mt-2 p-3 border border-green-100 rounded">
          <div className="flex justify-between">
            <div className="text-sm text-gray-600">Total:</div>
            <div className="font-semibold text-green-700">${total.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <PaymentSelector
          selected={paymentMethod}
          onSelect={(id) => setPaymentMethod(id)}
          onCardChange={(c) => setCardInfo(c)}
          cardInfo={cardInfo}
        />
      </div>

      <div className="mt-6">
        <Typography variant="body2" className="mb-2" >
          Recordá abonar en Boletería las entradas para poder ingresar al parque. Las entradas te llegarán por mail.
        </Typography>

        <div className="flex gap-3">
          <Button variant="contained" color="success" fullWidth onClick={handleSubmit}>
            Aceptar
          </Button>
        </div>
      </div>

      <EntryModal
        open={modalOpen}
        initial={editingInitial}
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
        }}
        onSave={handleSaveEntry}
      />
    </div>
  );
}

// TanStack route export (si usas createFileRoute pattern)
export const Route = createFileRoute("/boleteria")({
  component: Boleteria,
});
