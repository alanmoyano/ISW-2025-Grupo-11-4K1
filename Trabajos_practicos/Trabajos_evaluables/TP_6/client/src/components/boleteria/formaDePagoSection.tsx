// src/components/boleteria/formaDePagoSection.tsx
import React, { useContext } from "react";
import { Box, Typography } from "@mui/material";
import { FormaPagoEnum } from "@/routes/boleteria";
import { ThemesContext } from "@/components/ThemesContext";

// Importa tus svgs (si tu bundler devuelve URL al import).
// Ajustá las rutas si tus assets están en otra carpeta.
import LogoPagoEfectivo from "@/assets/logos/LogoPagoEfectivo.svg";
import LogoMercadoPago from "@/assets/logos/LogoMercadoPago.svg";

type Props = {
  selected: number | null;
  onSelect: (id: number) => void;
};

export default function FormaDePagoSection({ selected, onSelect }: Props) {
  const { theme } = useContext(ThemesContext);
  // color principal (fallback por si no existiera theme)
  const green = theme?.colors?.verdePakistani ?? "#2f8f4f";
  const greenDark = theme?.colors?.verdePakistani ?? "#256837";

  const options = [
    { id: FormaPagoEnum.EFECTIVO, label: "Efectivo", logo: LogoPagoEfectivo },
    { id: FormaPagoEnum.MERCADO_PAGO, label: "Mercado Pago", logo: LogoMercadoPago },
  ];

  return (
    <Box className="mb-6">
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Forma de Pago
      </Typography>

      <Box sx={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
        {options.map((opt) => {
          const isSelected = selected === opt.id;

          return (
            <Box
              key={opt.id}
              role="button"
              aria-pressed={isSelected}
              tabIndex={0}
              onClick={() => onSelect(opt.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(opt.id);
                }
              }}
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
                  boxShadow: isSelected ? "0 6px 14px rgba(39, 124, 62, 0.12)" : "none",
                  transition: "all 160ms ease",
                }}
              >
                {/* img: usamos filter para invertir el logo cuando está sobre fondo verde */}
                <img
                  src={opt.logo}
                  alt={opt.label}
                  style={{
                    width: 36,
                    height: 36,
                    display: "block",
                    filter: isSelected ? "brightness(0) invert(1)" : "grayscale(1) opacity(0.9)",
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
                {opt.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
