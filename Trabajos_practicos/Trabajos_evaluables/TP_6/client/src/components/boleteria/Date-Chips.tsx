// src/components/boleteria/DateChips.tsx
// @ts-expect-error
import React, { useContext, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import dayjs from "dayjs";
import { ThemesContext } from "../ThemeContext";

// --- Constantes ---
const CUTOFF_HOUR = 21; // 9 PM

// --- Tipos ---
interface DateChipsProps {
  availableDates: string[]; // YYYY-MM-DD
  selectedDate: string | null;
  onSelect: (date: string) => void;
  holidays: string[]; // YYYY-MM-DD
  maxAdvanceDays: number; // default 2
}

interface ValidationStatus {
  selectable: boolean;
  reason?: string;
}

// --- Hook de Validación (refactorizado) ---
// Se mueve la lógica de validación a un hook o función pura
// para hacerla más reutilizable y testeable.
function useDateValidation(
  holidays: string[],
  maxAdvanceDays: number,
): (dateStr: string) => ValidationStatus {
  // Obtenemos 'now' y 'today' una sola vez cuando el hook se inicializa
  const now = useMemo(() => dayjs(), []);
  const today = useMemo(() => now.startOf("day"), [now]);
  const maxAllowed = useMemo(
    () => today.add(maxAdvanceDays, "day"),
    [today, maxAdvanceDays],
  );

  // Creamos un Set de feriados para búsquedas O(1)
  const holidaySet = useMemo(() => new Set(holidays), [holidays]);

  const validateDate = (dateStr: string): ValidationStatus => {
    const d = dayjs(dateStr).startOf("day");
    if (!d.isValid()) return { selectable: false, reason: "Fecha inválida" };

    // 1. Validar si es HOY y ya pasó la hora de corte
    const isToday = d.isSame(today, "day");
    if (isToday) {
      // Usamos 'now' (que tiene la hora actual) para comparar
      if (now.hour() >= CUTOFF_HOUR) {
        return {
          selectable: false,
          reason: `Hora límite superada (${CUTOFF_HOUR}:00 hs)`,
        };
      }
    }

    // 2. Validaciones de fecha
    if (d.isBefore(today)) return { selectable: false, reason: "Fecha pasada" };
    if (d.isAfter(maxAllowed))
      return {
        selectable: false,
        reason: `Máx ${maxAdvanceDays} días de anticipación`,
      };
    if (d.day() === 1) return { selectable: false, reason: "Lunes cerrado" }; // Monday=1
    if (holidaySet.has(dateStr))
      return { selectable: false, reason: "Feriado" };

    return { selectable: true };
  };

  // Devolvemos la función validadora
  return validateDate;
}

// --- Componente ---
export default function DateChips({
  availableDates,
  selectedDate,
  onSelect,
  holidays = [],
  maxAdvanceDays = 2,
}: DateChipsProps) {
  const { theme } = useContext(ThemesContext);

  // Obtenemos la función validadora del hook
  const validateDate = useDateValidation(holidays, maxAdvanceDays);

  function getColor(isSelected: boolean, selectable: boolean) {
    if (isSelected) return "common.white";
    if (selectable) return theme.colors.verdePakistani;
    return "text.disabled";
  }

  return (
    <Box
      sx={{
        display: "flex",
        // ... (estilos de 'Box' sin cambios)
        flexDirection: "row",
        alignItems: "center",
        mb: 2,
        border: "1px solid",
        borderColor: theme.colors.verdePakistani,
        borderRadius: 2,
        p: 1,
      }}
    >
      {/* Título (sin cambios) */}
      <Box m={1}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: "medium",
            fontSize: 12,
            color: theme.colors.verdePakistani,
          }}
        >
          {selectedDate ? "Fecha Seleccionada:" : "Seleccione una Fecha:"}
        </Typography>
      </Box>

      {/* Contenedor horizontal de chips (sin cambios) */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          py: 1,
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        }}
      >
        {availableDates.map((date) => {
          const { selectable, reason } = validateDate(date);
          const isSelected = date === selectedDate;

          // REFACTOR: Lógica de renderizado simplificada.
          // El chip de hoy después de las 21:00 hs ahora se renderiza
          // pero como 'disabled' (selectable=false), lo cual es mejor UX
          // que hacerlo desaparecer.

          return (
            <Box
              key={date}
              onClick={() => selectable && onSelect(date)}
              // Se agrega 'title' para mostrar el motivo del bloqueo en hover
              title={!selectable ? reason : undefined}
              sx={{
                cursor: selectable ? "pointer" : "not-allowed",
                opacity: selectable ? 1 : 0.6, // Se atenúa si no es seleccionable
                px: 3,
                py: 1,
                borderRadius: 2,
                minWidth: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                border: "1px solid",
                borderColor: theme.colors.verdePakistani,
                bgcolor: isSelected ? theme.colors.verdeIndia : "common.white",
                color: getColor(isSelected, selectable),
                fontWeight: "bold",
                transition: "transform .12s, box-shadow .12s",
                boxShadow: isSelected ? 3 : "none",
                "&:hover": selectable ? { transform: "translateY(-3px)" } : {},
              }}
            >
              <Box textAlign="center">
                <div>{dayjs(date).format("DD-MM-YYYY")}</div>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
