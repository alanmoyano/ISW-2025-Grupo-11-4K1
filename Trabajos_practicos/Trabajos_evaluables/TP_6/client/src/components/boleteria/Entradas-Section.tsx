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
// Asegúrate de que la importación de ThemeContext sea la correcta
import { ThemesContext } from "../ThemeContext"; 

// --- Tipos y Constantes---
export interface TipoEntrada {
  id: number;
  nombre: string;
  precio: number;
}
// Aunque la lógica de precios (edad <= 3 es 0) hace que este ID sea
// menos crítico, lo mantenemos por si la data del backend lo sigue usando.
const MENOR_ID = 3; 

export interface EntradaUI {
  id: string;
  tipoEntradaId: number;
  edadVisitante: number;
  precioCalculado: number;
}

// --- Función de Cálculo (AJUSTADA AL BACKEND TEST) ---
/**
 * Calcula el precio basado en los tests del backend (precioUtils.test.ts).
 * 1. Edad <= 3 es siempre 0.
 * 2. Edad 4-10 tiene 50% de descuento.
 * 3. Edad >= 60 tiene 50% de descuento.
 */
function calcularPrecio(
  tipoId: number,
  edad: number,
  tiposDeEntrada: TipoEntrada[],
) {
  const tipo = tiposDeEntrada.find((t) => t.id === tipoId);
  if (!tipo) return { precioFinal: 0, precioOriginal: 0 };
  
  const original = tipo.precio;

  // AJUSTE 1: Basado en precioUtils.test.ts (Test 1: edad 3 = $0)
  // Esta regla tiene prioridad.
  if (edad <= 3) {
    // Devolvemos 0, pero mantenemos el 'precioOriginal' del ticket seleccionado
    // por si es útil para analíticas, aunque el backend test 1 no lo especifica.
    // Si el tipo es MENOR_ID, el original ya es 0.
    return { precioFinal: 0, precioOriginal: original };
  }

  // Si el tipo es MENOR_ID (precio 0) y la edad es > 3 (ej. 4),
  // el precio final seguirá siendo 0, lo cual es incorrecto.
  // La validación en el modal ahora previene esto.
  // (Aunque la validación estricta de MENOR_ID fue removida,
  // la lógica de precio 0 para edad <= 3 la reemplaza).

  let multiplier = 1;
  
  // AJUSTE 2: El rango de descuento para niños ahora es de 4 a 10.
  if (edad > 3 && edad <= 10) multiplier = 0.5;
  else if (edad >= 60) multiplier = 0.5;

  const finalPrice = Math.round(original * multiplier);
  return { precioFinal: finalPrice, precioOriginal: original };
}

// --- Función de Rango (AJUSTADA AL BACKEND TEST) ---
/**
 * Mapea la edad a un rango.
 * "Infante" (0-3) es el grupo gratuito según precioUtils.test.ts.
 */
function edadToRango(edad: number) {
  // AJUSTE 3: Infante ahora incluye 3 años, para coincidir con el precio 0.
  if (edad <= 3) return "Infante"; 
  if (edad > 3 && edad <= 10) return "Menor";
  if (edad >= 60) return "Adulto Mayor";
  return "Joven - Adulto";
}

const MAX_AGE = 110;

// ----------------------------------------------------------------------
// --- COMPONENTE: EntradaCard (Sin cambios) ---
// ----------------------------------------------------------------------
interface EntradaCardProps {
  entry: EntradaUI;
  tiposDeEntrada: TipoEntrada[];
  onEdit: (id: string) => void;
}

function EntradaCard({ entry, tiposDeEntrada, onEdit }: EntradaCardProps) {
  const { theme } = useContext(ThemesContext);
  const tipoObj = tiposDeEntrada.find((t) => t.id === entry.tipoEntradaId);

  if (!tipoObj) {
    console.warn(
      `No se encontró el tipo de entrada ID: ${entry.tipoEntradaId}`,
    );
    return null;
  }

  const rango = edadToRango(entry.edadVisitante);
  const mostrarOriginal = entry.precioCalculado < tipoObj.precio;

  return (
    <div
      className="w-full rounded-xl border bg-white p-4 mb-4 flex items-center justify-between"
      style={{ borderColor: theme.colors.verdePakistani }}
    >
      <div>
        <div
          className="text-xl font-semibold"
          style={{ color: theme.colors.verdePakistani }}
        >
          {rango}
        </div>
        <div className="text-sm text-yellow-700 mt-1">{tipoObj.nombre}</div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-baseline gap-2">
          {mostrarOriginal && (
            <span className="text-xs text-gray-400 line-through mr-1">
              ${tipoObj.precio.toLocaleString()}
            </span>
          )}
          <span
            className="text-lg font-semibold"
            style={{ color: theme.colors.verdeIndia }}
          >
            ${entry.precioCalculado.toLocaleString()}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onEdit(entry.id)}
          className="px-3 py-1 border rounded-full text-sm hover:opacity-90 transition"
          style={{
            borderColor: theme.colors.verdeClaro,
            color: theme.colors.verdeIndia,
          }}
        >
          Editar
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// --- COMPONENTE: EntryEditorModal (Validación AJUSTADA) ---
// ----------------------------------------------------------------------
interface EntryEditorModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (entryData: Omit<EntradaUI, "id"> & { id?: string }) => void;
  tiposDeEntrada: TipoEntrada[];
  initialData: EntradaUI | null;
}

function EntryEditorModal({
  open,
  onClose,
  onSave,
  tiposDeEntrada,
  initialData,
}: EntryEditorModalProps) {
  const { theme } = useContext(ThemesContext);
  const [tipo, setTipo] = useState<number | null>(null);
  const [edad, setEdad] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setTipo(initialData?.tipoEntradaId ?? null);
      setEdad(initialData?.edadVisitante ?? null);
    }
  }, [open, initialData]);

  // Lógica de validación (AJUSTADA)
  const validation = useMemo(() => {
    if (tipo === null) return { valid: false, error: "Seleccione un tipo." };
    if (edad === null || Number.isNaN(edad) || edad < 0) {
      return { valid: false, error: "Ingrese una edad válida (0 o mayor)." };
    } 

    if (edad > MAX_AGE) {
      return { valid: false, error: `La edad máxima permitida es ${MAX_AGE} años.` };
  }

    // REGLA AGREGADA: Si la edad es 3 o menor, el tipo DEBE ser 'Menor de 3 años' (MENOR_ID).
    if (tipo !== MENOR_ID && edad <= 3) {
      return { valid: false, error: "Si la edad es 3 o menor, debe seleccionar el tipo 'Menor de 3 años'." };
     }

    // REGLA MANTENIDA: El tipo "Menor de 3 años" solo puede tener edad <= 3.
    if (tipo === MENOR_ID && edad > 3) {
      return { valid: false, error: "El tipo 'Menor de 3 años' es solo para 0-3 años." };
     }

    return { valid: true, error: null };
  }, [tipo, edad]);

  const handleSave = () => {
    if (!validation.valid || tipo === null || edad === null) return;

    const { precioFinal } = calcularPrecio(tipo, edad, tiposDeEntrada);
    onSave({
      id: initialData?.id,
      tipoEntradaId: tipo,
      edadVisitante: edad,
      precioCalculado: precioFinal,
    });
    onClose();
  };

  const priceSummary = useMemo(() => {
    // No calcular si faltan datos o la validación básica falla
    if (tipo === null || edad === null || !validation.valid) return null; 
    
    const tipoObj = tiposDeEntrada.find((x) => x.id === tipo);
    if (!tipoObj) return null;
    
    // Usamos la nueva función de cálculo
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
  }, [tipo, edad, tiposDeEntrada, validation.valid]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <div className="flex justify-between items-center">
          <div
            className="text-lg font-bold"
            style={{ color: theme.colors.verdePakistani }}
          >
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
              onChange={(e) => setTipo(Number(e.target.value))}
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
            inputProps={{ min: 0, max: MAX_AGE }} 
            fullWidth
            error={!validation.valid && (edad !== null && edad >= 0)} // Mostrar error si es inválido
            helperText={
              !validation.valid && (edad !== null && edad >= 0) ? validation.error : ""
            }
          />

          {/* Resumen de precios (sin cambios en JSX) */}
          <div className="mt-2">
            {!priceSummary && (
              <div className="text-gray-500">
                Seleccione tipo y edad para ver el precio.
              </div>
            )}
            {priceSummary && (
              <div className="w-full">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <div>Precio Entrada</div>
                  <div>${priceSummary.original.toLocaleString()}</div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <div>Descuento</div>
                  <div
                    className="font-medium"
                    style={{ color: theme.colors.verdeIndia }}
                  >
                    {priceSummary.descuentoTexto}
                  </div>
                </div>
                <div className="flex justify-between text-base font-semibold mt-2">
                  <div>Precio Final:</div>
                  <div
                    style={{ color: theme.colors.verdePakistani }}
                  >
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
          sx={{
            borderColor: theme.colors.verdeClaro,
            color: theme.colors.verdeIndia,
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!validation.valid}
          sx={{
            backgroundColor: theme.colors.verdeIndia,
            "&:hover": { backgroundColor: theme.colors.verdePakistani },
            "&:disabled": { 
              backgroundColor: theme.colors.grisOscuro,
              color: "white" // Mejorar legibilidad en modo disabled
            },
          }}
        >
          Aceptar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ----------------------------------------------------------------------
// --- COMPONENTE: EntradasSection (Sin cambios) ---
// ----------------------------------------------------------------------
export default function EntradasSection({
  quantity,
  entries,
  setEntries,
  tiposDeEntrada,
}: {
  quantity: number;
  entries: EntradaUI[];
  setEntries: React.Dispatch<React.SetStateAction<EntradaUI[]>>;
  tiposDeEntrada: TipoEntrada[];
}) {
  const { theme } = useContext(ThemesContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<EntradaUI | null>(null);

  const handleSaveEntry = (
    entryData: Omit<EntradaUI, "id"> & { id?: string },
  ) => {
    if (entryData.id) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryData.id ? { ...e, ...entryData } : e,
        ),
      );
    } else {
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
    setEditingEntry(null);
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
      <div className="flex items-center justify-between mb-3" >
        <h3 className="text-gray-700 font-semibold" style={{color: theme.colors.verdePakistani}}>Entradas</h3>
      </div>

      {/* Lista de Entradas */}
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
            type="button"
            onClick={openAdd}
            className="w-full text-white py-3 rounded-lg shadow-md hover:opacity-90 transition"
            style={{ backgroundColor: theme.colors.verdePakistani }}
            aria-label="Agregar Entrada"
          >
            + Agregar Entrada
          </button>
        </div>
      )}

      {/* Modal */}
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