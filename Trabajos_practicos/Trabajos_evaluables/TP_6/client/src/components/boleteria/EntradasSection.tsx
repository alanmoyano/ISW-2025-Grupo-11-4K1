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
import { ThemesContext } from "@/components/ThemesContext";

// --- Tipos (sin cambios) ---
export type TipoEntrada = {
  id: number;
  nombre: string;
  precio: number;
};
const MENOR_ID = 3;
export type EntradaUI = {
  id: string;
  tipoEntradaId: number;
  edadVisitante: number;
  precioCalculado: number;
};

// --- Función de Cálculo (sin cambios) ---
// Esta función está bien definida y aislada.
function calcularPrecio(
  tipoId: number,
  edad: number,
  tiposDeEntrada: TipoEntrada[],
) {
  // ... (lógica sin cambios)
  const tipo = tiposDeEntrada.find((t) => t.id === tipoId);
  if (!tipo) return { precioFinal: 0, precioOriginal: 0 };
  const original = tipo.precio;
  if (tipo.id === MENOR_ID) {
    return { precioFinal: original, precioOriginal: original };
  }
  let multiplier = 1;
  if (edad >= 3 && edad <= 10) multiplier = 0.5;
  else if (edad >= 60) multiplier = 0.5;
  const finalPrice = Math.round(original * multiplier);
  return { precioFinal: finalPrice, precioOriginal: original };
}

// --- Función de Rango (sin cambios) ---
function edadToRango(edad: number) {
  if (edad < 3) return "Infante";
  if (edad >= 3 && edad <= 10) return "Menor";
  if (edad >= 60) return "Adulto Mayor";
  return "Joven - Adulto";
}

// --- NUEVO SUB-COMPONENTE: EntradaCard ---
type EntradaCardProps = {
  entry: EntradaUI;
  tiposDeEntrada: TipoEntrada[];
  onEdit: (id: string) => void;
};

function EntradaCard({ entry, tiposDeEntrada, onEdit }: EntradaCardProps) {
  const tipoObj = tiposDeEntrada.find((t) => t.id === entry.tipoEntradaId);

  // Manejo de caso borde: el tipo de entrada no existe
  if (!tipoObj) {
    console.warn(
      `No se encontró el tipo de entrada ID: ${entry.tipoEntradaId}`,
    );
    return null;
  }

  const rango = edadToRango(entry.edadVisitante);
  const mostrarOriginal = entry.precioCalculado < tipoObj.precio;

  return (
    <div className="w-full rounded-xl border border-green-200 bg-white p-4 mb-4 flex items-center justify-between">
      <div>
        <div className="text-xl font-semibold text-green-800">{rango}</div>
        <div className="text-sm text-yellow-700 mt-1">{tipoObj.nombre}</div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-baseline gap-2">
          {mostrarOriginal && (
            <span className="text-xs text-gray-400 line-through mr-1">
              ${tipoObj.precio.toLocaleString()}
            </span>
          )}
          <span className="text-lg font-semibold text-green-700">
            ${entry.precioCalculado.toLocaleString()}
          </span>
        </div>
        <button
          onClick={() => onEdit(entry.id)}
          className="px-3 py-1 border border-green-300 rounded-full text-sm text-green-700 hover:bg-green-50"
        >
          Editar
        </button>
      </div>
    </div>
  );
}

// --- NUEVO SUB-COMPONENTE: EntryEditorModal ---
type EntryEditorModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (entryData: Omit<EntradaUI, "id"> & { id?: string }) => void;
  tiposDeEntrada: TipoEntrada[];
  initialData: EntradaUI | null; // null para 'Agregar', objeto para 'Editar'
};

function EntryEditorModal({
  open,
  onClose,
  onSave,
  tiposDeEntrada,
  initialData,
}: EntryEditorModalProps) {
  const [tipo, setTipo] = useState<number | null>(null);
  const [edad, setEdad] = useState<number | null>(null);

  // Efecto para poblar el modal al editar
  useEffect(() => {
    if (open) {
      setTipo(initialData?.tipoEntradaId ?? null);
      setEdad(initialData?.edadVisitante ?? null);
    }
  }, [open, initialData]);

  // Lógica de validación
  const validation = useMemo(() => {
    if (tipo === null) return { valid: false, error: "Seleccione un tipo." };
    if (edad === null || Number.isNaN(edad) || edad < 0) {
      return { valid: false, error: "Ingrese una edad válida." };
    }
    if (tipo === MENOR_ID && edad >= 3) {
      return { valid: false, error: "Debe ser menor a 3 años para este tipo." };
    }
    if (tipo !== MENOR_ID && edad < 3) {
      return { valid: false, error: "Use el tipo 'Menor de 3 años'." };
    }
    return { valid: true, error: null };
  }, [tipo, edad]);

  const handleSave = () => {
    if (!validation.valid || tipo === null || edad === null) return;

    const { precioFinal } = calcularPrecio(tipo, edad, tiposDeEntrada);
    onSave({
      id: initialData?.id, // Pasa el ID si estamos editando
      tipoEntradaId: tipo,
      edadVisitante: edad,
      precioCalculado: precioFinal,
    });
    onClose();
  };

  // Cálculo de precio para el resumen
  const priceSummary = useMemo(() => {
    if (tipo === null || edad === null) return null;
    const tipoObj = tiposDeEntrada.find((x) => x.id === tipo);
    if (!tipoObj) return null;

    const { precioFinal, precioOriginal } = calcularPrecio(
      tipo,
      edad,
      tiposDeEntrada,
    );
    const descuento = precioOriginal - precioFinal;

    return {
      original: precioOriginal,
      descuentoTexto: descuento > 0 ? `-$${descuento.toLocaleString()}` : "-",
      final: precioFinal,
    };
  }, [tipo, edad, tiposDeEntrada]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <div className="flex justify-between items-center">
          <div className="text-green-800 text-lg font-bold">
            {initialData ? "Editar Entrada" : "Agregar Entrada"}
          </div>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent dividers>
        <div className="flex flex-col gap-4">
          <FormControl fullWidth>
            <InputLabel id="tipo-label">Tipo de Entrada</InputLabel>
            <Select
              labelId="tipo-label"
              value={tipo ?? ""}
              label="Tipo de Entrada"
              onChange={(e) => setTipo(Number(e.target.value) as number)}
            >
              {tiposDeEntrada.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.nombre} — ${t.precio.toLocaleString()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Edad"
            type="number"
            value={edad ?? ""}
            onChange={(e) =>
              setEdad(
                e.target.value === ""
                  ? null
                  : Math.max(0, Number(e.target.value)),
              )
            }
            inputProps={{ min: 0 }}
            fullWidth
            // Mostramos el error de validación
            error={!validation.valid && edad !== null}
            helperText={
              !validation.valid && edad !== null ? validation.error : ""
            }
          />

          {/* Resumen de precios */}
          <div className="mt-2">
            {!priceSummary && (
              <div className="text-gray-500">
                Seleccione tipo y edad para ver el precio.
              </div>
            )}
            {priceSummary && (
              <div className="w-full">
                {/* ... (JSX del resumen de precios sin cambios) ... */}
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <div>Precio Entrada</div>
                  <div>${priceSummary.original.toLocaleString()}</div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <div>Descuento</div>
                  <div className="text-green-700 font-medium">
                    {priceSummary.descuentoTexto}
                  </div>
                </div>
                <div className="flex justify-between text-base font-semibold mt-2">
                  <div>Precio Final:</div>
                  <div className="text-green-800">
                    ${priceSummary.final.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      <DialogActions>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ borderColor: "green.400", color: "green.700" }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          // Deshabilitado si no es válido
          disabled={!validation.valid}
          sx={{
            backgroundColor: "green.700",
            "&:hover": { backgroundColor: "green.800" },
            "&:disabled": { backgroundColor: "grey.300" },
          }}
        >
          Aceptar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ---------------- EntradasSection (Ahora mucho más limpio) ---------------- */
export default function EntradasSection({
  quantity,
  entries,
  setEntries,
  tiposDeEntrada,
}: {
  quantity: number;
  entries: EntradaUI[];
  // REFACTOR: Tipo de prop corregido
  setEntries: React.Dispatch<React.SetStateAction<EntradaUI[]>>;
  tiposDeEntrada: TipoEntrada[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  // Guardamos la ENTRADA completa a editar, no solo el ID
  const [editingEntry, setEditingEntry] = useState<EntradaUI | null>(null);

  const handleSaveEntry = (
    entryData: Omit<EntradaUI, "id"> & { id?: string },
  ) => {
    // Si tiene ID, es una edición
    if (entryData.id) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryData.id
            ? { ...e, ...entryData } // Actualiza la entrada
            : e,
        ),
      );
    } else {
      // Si no, es una adición
      const newEntry: EntradaUI = {
        ...entryData,
        id: String(Date.now()) + Math.random().toString(36).slice(2, 7),
      };
      setEntries((prev) => [...prev, newEntry]);
    }
    setModalOpen(false);
    setEditingEntry(null);
  };

  const openAdd = () => {
    if (entries.length >= quantity) return;
    setEditingEntry(null); // Asegura que es modo 'add'
    setModalOpen(true);
  };

  const openEdit = (id: string) => {
    const entryToEdit = entries.find((e) => e.id === id);
    if (entryToEdit) {
      setEditingEntry(entryToEdit);
      setModalOpen(true);
    }
  };

  const disableAdd = entries.length >= quantity;

  return (
    <Box className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-gray-700 font-semibold">Entradas</h3>
      </div>

      {/* Lista de Entradas (ahora usa el sub-componente) */}
      <div>
        {entries.length === 0 && (
          <div className="text-gray-400 mb-2">
            No hay entradas agregadas aún.
          </div>
        )}
        {entries.map((entry) => (
          <EntradaCard
            key={entry.id}
            entry={entry}
            tiposDeEntrada={tiposDeEntrada}
            onEdit={openEdit}
          />
        ))}
      </div>

      {/* Botón Agregar */}
      {!disableAdd && (
        <div className="mb-4">
          <button
            onClick={openAdd}
            className="w-full bg-green-800 text-white py-3 rounded-lg shadow-md hover:bg-green-900 transition"
            aria-label="Agregar Entrada"
          >
            + Agregar Entrada
          </button>
        </div>
      )}

      {/* Modal (ahora es un componente separado) */}
      <EntryEditorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveEntry}
        tiposDeEntrada={tiposDeEntrada}
        initialData={editingEntry}
      />
    </Box>
  );
}
