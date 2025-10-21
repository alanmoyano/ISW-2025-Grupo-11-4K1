import { z } from "zod";
import { tipoEntradaIdSchema } from "@shared/types";

const diasFestivos = new Set(["2025-12-25", "2025-01-01"]);

export const entradaFormSchema = z.object({
  edadVisitante: z
    .number({ message: "Debe indicar la edad del visitante" })
    .min(0, "La edad no puede ser negativa")
    .max(110, "La edad no puede ser mayor a 110"),
  tipoEntradaId: tipoEntradaIdSchema,
});

export const entradasFormSchema = z.object({
  fecha: z
    .string()
    .min(1, "Debe ingresar una fecha de visita")
    .refine((value) => {
      const date = new Date(value);
      if (date.getUTCDay() === 1) return false;
      if (date < new Date()) return false;
      if (diasFestivos.has(value)) return false;
      return true;
    }, {
      message: "No puede seleccionar un dia lunes o un dia festivo",
    }),
  entradas: z
    .array(entradaFormSchema)
    .min(1, "Debe ingresar al menos una entrada")
    .max(10, "No puede comprar más de 10 entradas"),
});