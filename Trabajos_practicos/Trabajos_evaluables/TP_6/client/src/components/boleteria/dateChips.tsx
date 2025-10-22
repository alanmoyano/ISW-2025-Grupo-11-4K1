// src/components/boleteria/DateChips.tsx
import { useContext } from "react";
import { ThemesContext } from "../ThemesContext";
import { Box, Typography } from "@mui/material";
import dayjs from "dayjs";

type DateChipsProps = {
  availableDates: string[]; // YYYY-MM-DD
  selectedDate: string | null;
  onSelect: (date: string) => void;
  holidays?: string[]; // YYYY-MM-DD
  maxAdvanceDays?: number; // default 2
};

export function DateChips({
  availableDates,
  selectedDate,
  onSelect,
  holidays = [],
  maxAdvanceDays = 2,
}: DateChipsProps) {
  const {theme} = useContext(ThemesContext);
  const today = dayjs().startOf("day");
  const maxAllowed = today.add(maxAdvanceDays, "day");

  const isMonday = (d: dayjs.Dayjs) => d.day() === 1; // Sunday=0, Monday=1

  const validateDate = (dateStr: string): { selectable: boolean; reason?: string } => {
    const d = dayjs(dateStr).startOf("day");
    if (!d.isValid()) return { selectable: false, reason: "Fecha inválida" };
    if (d.isBefore(today)) return { selectable: false, reason: "No se puede seleccionar una fecha pasada" };
    if (d.isAfter(maxAllowed)) return { selectable: false, reason: `Sólo se permiten hasta ${maxAdvanceDays} días de anticipación` };
    if (isMonday(d)) return { selectable: false, reason: "No se puede seleccionar lunes" };
    if (holidays.includes(dateStr)) return { selectable: false, reason: "Feriado" };
    return { selectable: true };
  };

  return (
    <Box sx={{  
                display: "flex",
                overflowX: "auto",
                flexDirection: "row",
                alignItems: "center",
                mb: 2,
                border: "1px solid",
                borderColor: theme.colors.verdePakistani,
                borderRadius: 2,
                p: 1
            }}>
      {/* Título */}
      <Box m={1}>
        <Typography variant="subtitle1" sx={{ fontWeight: "medium", fontSize: 12, color: theme.colors.verdePakistani }}>
          {selectedDate ? "Fecha Seleccionada:" : "Seleccione una Fecha:"}
        </Typography>
      </Box>

      {/* Contenedor horizontal de chips */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          py: 1,
          // no mostrar scrollbar en webkit y firefox (estético)
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        }}
      >
        {availableDates.map((date) => {
          const { selectable } = validateDate(date);
          const isSelected = date === selectedDate;

          return (
              <Box
                onClick={() => {
                  if (!selectable) return;
                  onSelect(date);
                }}
                sx={{
                  cursor: selectable ? "pointer" : "not-allowed",
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  minWidth: 120,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  // bordes sólidos verdes siempre (si está deshabilitado, tono más claro)
                  border: "1px solid",
                  borderColor: theme.colors.verdePakistani,
                  // fill cuando está seleccionado
                  bgcolor: isSelected ? theme.colors.verdeIndia : "common.white",
                  color: isSelected ? "common.white" : selectable ? theme.colors.verdePakistani : "text.disabled",
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
