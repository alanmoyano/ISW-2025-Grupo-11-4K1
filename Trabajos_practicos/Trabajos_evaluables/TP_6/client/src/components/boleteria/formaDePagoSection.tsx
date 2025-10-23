// src/components/boleteria/formaDePagoSection.tsx
import React, { useContext } from "react";
import { Box, Typography } from "@mui/material";
import { ThemesContext } from "@/components/ThemesContext";
import LogoPagoEfectivo from "@/assets/logos/LogoPagoEfectivo.svg";
import LogoMercadoPago from "@/assets/logos/LogoMercadoPago.svg"; 

// --- Tipos (sin cambios) ---
type FormaDePago = {
  id: number;
  nombre: string;
};

type Props = {
  selected: number | null;
  onSelect: (id: number) => void;
  formasDePago: FormaDePago[]; 
};

// Mapeo (sin cambios)
const logoMap: { [key: number]: string } = {
  1: LogoPagoEfectivo,
  2: LogoMercadoPago,
};

// --- NUEVO SUB-COMPONENTE: PaymentOption ---
type PaymentOptionProps = {
  option: FormaDePago;
  isSelected: boolean;
  onSelect: (id: number) => void;
  colors: { green: string; greenDark: string };
};

function PaymentOption({ option, isSelected, onSelect, colors }: PaymentOptionProps) {
  // Se usa un logo por defecto si el ID no está en el map.
  // TODO: Considerar un icono genérico en lugar de repetir 'Efectivo'.
  const logo = logoMap[option.id] || LogoPagoEfectivo; 
  const { green, greenDark } = colors;

  const handleSelect = () => {
    onSelect(option.id);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect();
    }
  };

  return (
    <Box
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        userSelect: "none",
        width: 120,
        gap: 1,
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "9999px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `2px solid ${isSelected ? green : "#cfd8d6"}`,
          bgcolor: isSelected ? green : "transparent",
          boxShadow: isSelected
            ? "0 6px 14px rgba(39, 124, 62, 0.12)"
            : "none",
          transition: "all 160ms ease",
        }}
      >
        <img
          src={logo}
          alt={option.nombre}
          style={{
            width: 36,
            height: 36,
            display: "block",
            filter: isSelected
              ? "brightness(0) invert(1)"
              : "grayscale(1) opacity(0.9)",
            transition: "filter .18s ease, opacity .18s ease",
          }}
        />
      </Box>
      <Typography
        variant="body2"
        sx={{
          mt: 0.5,
          fontWeight: 600,
          color: isSelected ? greenDark : "text.secondary",
          fontSize: 13,
        }}
      >
        {option.nombre}
      </Typography>
    </Box>
  );
}

// --- Componente Principal (Ahora más limpio) ---
export default function FormaDePagoSection({
  selected,
  onSelect,
  formasDePago, 
}: Props) {
  const { theme } = useContext(ThemesContext);
  
  // Se definen los colores una vez
  const colors = {
      green: theme?.colors?.verdePakistani ?? "#2f8f4f",
      greenDark: theme?.colors?.verdePakistani ?? "#256837"
  };

  return (
    <Box className="mb-6">
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Forma de Pago
      </Typography>

      <Box sx={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
        {formasDePago.map((opt) => (
          <PaymentOption
            key={opt.id}
            option={opt}
            isSelected={selected === opt.id}
            onSelect={onSelect}
            colors={colors}
          />
        ))}
      </Box>
    </Box>
  );
}