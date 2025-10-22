// src/components/boleteria/EntradasSection.tsx
import React, { useState, useMemo, useEffect, useContext } from "react";
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
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { ThemesContext } from "@/components/ThemesContext";

/**
 * Evitamos la importación circular — enum local (mantener sincronía con boleteria.tsx).
 */
export const TipoEntradaEnum = {
  REGULAR: 1,
  VIP: 2,
} as const;

export type TipoEntradaId = (typeof TipoEntradaEnum)[keyof typeof TipoEntradaEnum];

type TipoEntrada = { id: TipoEntradaId; nombre: string; precio: number };

/* Tipos locales (coincidir con los de boleteria.tsx) */
const TIPO_ENTRADAS: TipoEntrada[] = [
  { id: TipoEntradaEnum.REGULAR, nombre: "Regular", precio: 5000 },
  { id: TipoEntradaEnum.VIP, nombre: "Premium", precio: 10000 },
];

export type EntradaUI = {
  id: string;
  tipoEntradaId: TipoEntradaId;
  edadVisitante: number;
  precioCalculado: number;
};

function calcularPrecio(tipoId: TipoEntradaId, edad: number) {
  const tipo = TIPO_ENTRADAS.find((t) => t.id === tipoId)!;
  const original = tipo.precio;
  let multiplier = 1;
  if (edad < 3) multiplier = 0;
  else if (edad >= 3 && edad <= 10) multiplier = 0.5;
  else if (edad >= 60) multiplier = 0.5;
  else multiplier = 1;
  const finalPrice = Math.round(original * multiplier);
  return { precioFinal: finalPrice, precioOriginal: original };
}

function edadToRango(edad: number) {
  if (edad < 3) return "Infante";
  if (edad >= 3 && edad <= 10) return "Menor";
  if (edad >= 60) return "Adulto Mayor";
  return "Joven - Adulto";
}

/* ---------------- EntradasSection ---------------- */
export default function EntradasSection({
  quantity,
  entries,
  setEntries,
  onAcceptEntries,
}: {
  quantity: number;
  entries: EntradaUI[];
  setEntries: (updater: (prev: EntradaUI[]) => EntradaUI[]) => void;
  onAcceptEntries?: () => void;
}) {
  const { theme } = useContext(ThemesContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // modal states
  const [tipo, setTipo] = useState<TipoEntradaId>(TIPO_ENTRADAS[0].id);
  const [edad, setEdad] = useState<number>(0);

  useEffect(() => {
    if (!modalOpen) {
      setTipo(TIPO_ENTRADAS[0].id);
      setEdad(0);
      setEditingId(null);
    }
  }, [modalOpen]);

  const editingInitial = useMemo(() => entries.find((e) => e.id === editingId), [editingId, entries]);

  useEffect(() => {
    if (editingInitial) {
      setTipo(editingInitial.tipoEntradaId);
      setEdad(editingInitial.edadVisitante);
    }
  }, [editingInitial]);

  const guardarEntrada = () => {
    if (Number.isNaN(edad) || edad < 0) return alert("Edad inválida");
    const { precioFinal } = calcularPrecio(tipo, edad);

    if (editingId) {
      setEntries((prev) => prev.map((e) => (e.id === editingId ? { ...e, tipoEntradaId: tipo, edadVisitante: edad, precioCalculado: precioFinal } : e)));
    } else {
      if (entries.length >= quantity) {
        // safety
        setModalOpen(false);
        return;
      }
      const newEntry: EntradaUI = {
        id: String(Date.now()) + Math.random().toString(36).slice(2, 7),
        tipoEntradaId: tipo,
        edadVisitante: edad,
        precioCalculado: precioFinal,
      };
      setEntries((prev) => [...prev, newEntry]);
    }
    setModalOpen(false);
    setEditingId(null);
  };

  const openAdd = () => {
    if (entries.length >= quantity) return;
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (id: string) => {
    setEditingId(id);
    setModalOpen(true);
  };

  const disableAdd = entries.length >= quantity;

  return (
    <Box className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-gray-700 font-semibold">Entradas</h3>
      </div>

      {/* Entries list */}
      <div>
        {entries.length === 0 && <div className="text-gray-400 mb-2">No hay entradas agregadas aún.</div>}

        {entries.map((entry) => {
          const tipoObj = TIPO_ENTRADAS.find((t) => t.id === entry.tipoEntradaId)!;
          const rango = edadToRango(entry.edadVisitante);
          const mostrarOriginal = entry.precioCalculado < tipoObj.precio;

          return (
            <div
              key={entry.id}
              className="w-full rounded-xl border border-green-200 bg-white p-4 mb-4 flex items-center justify-between"
            >
              {/* left: range + type */}
              <div>
                <div className="text-xl font-semibold text-green-800">{rango}</div>
                <div className="text-sm text-yellow-700 mt-1">{tipoObj.nombre}</div>
              </div>

              {/* right: price (original tachado si aplica) + edit */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-baseline gap-2">
                  {mostrarOriginal && (
                    <span className="text-xs text-gray-400 line-through mr-1">
                      ${tipoObj.precio.toLocaleString()}
                    </span>
                  )}
                  <span className="text-lg font-semibold text-green-700">${entry.precioCalculado.toLocaleString()}</span>
                </div>

                <button
                  onClick={() => openEdit(entry.id)}
                  className="px-3 py-1 border border-green-300 rounded-full text-sm text-green-700 hover:bg-green-50"
                >
                  Editar
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {/* big green add button (full width under title) */}
      {!disableAdd ? (
        <div className="mb-4">
          <button
            onClick={openAdd}
            className="w-full bg-green-800 text-white py-3 rounded-lg shadow-md hover:bg-green-900 transition"
            aria-label="Agregar Entrada"
          >
            + Agregar Entrada
          </button>
        </div>
      ) : (
        // when reached quantity, show accept button that calls onAcceptEntries
        <div className="mb-4">
          <button
            onClick={() => onAcceptEntries?.()}
            className="w-full bg-green-700 text-white py-3 rounded-lg shadow-md hover:bg-green-800 transition"
          >
            Aceptar
          </button>
        </div>
      )}

      {/* Modal add / edit */}
      <Dialog open={modalOpen} onClose={() => { setModalOpen(false); setEditingId(null); }} fullWidth maxWidth="sm">
        <DialogTitle>
          <div className="flex justify-between items-center">
            <div className="text-green-800 text-lg font-bold">{editingId ? "Editar Entrada:" : "Agregar Entrada:"}</div>
            <IconButton onClick={() => { setModalOpen(false); setEditingId(null); }}>
              <CloseIcon />
            </IconButton>
          </div>
        </DialogTitle>

        <DialogContent dividers>
          <div className="flex flex-col gap-4">
            <FormControl fullWidth>
              <InputLabel id="tipo-label">Tipo de Entrada</InputLabel>
              <Select labelId="tipo-label" value={tipo} label="Tipo de Entrada" onChange={(e) => setTipo(Number(e.target.value) as TipoEntradaId)}>
                {TIPO_ENTRADAS.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.nombre} — ${t.precio.toLocaleString()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField label="Edad" type="number" value={edad} onChange={(e) => setEdad(Math.max(0, Number(e.target.value)))} inputProps={{ min: 0 }} fullWidth />

            {/* Pricing summary (Precio Entrada / Descuento / Precio Final) */}
            <div className="mt-2">
              {(() => {
                const tipoObj = TIPO_ENTRADAS.find((x) => x.id === tipo)!;
                const original = tipoObj.precio;
                const { precioFinal } = calcularPrecio(tipo, edad);
                const descuento = original - precioFinal;
                const descuentoTexto = descuento > 0 ? `-$${descuento.toLocaleString()}` : "-";
                return (
                  <div className="w-full">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <div>Precio Entrada</div>
                      <div>${original.toLocaleString()}</div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <div>Descuento</div>
                      <div className="text-green-700 font-medium">{descuentoTexto}</div>
                    </div>
                    <div className="flex justify-between text-base font-semibold mt-2">
                      <div>Precio Final:</div>
                      <div className="text-green-800">${precioFinal.toLocaleString()}</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={() => { setModalOpen(false); setEditingId(null); }} sx={{ borderColor: "green.400", color: "green.700" }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={guardarEntrada} sx={{ backgroundColor: "green.700", "&:hover": { backgroundColor: "green.800" } }}>
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
