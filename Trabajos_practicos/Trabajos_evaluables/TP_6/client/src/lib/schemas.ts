import { z } from "zod";
import { tipoEntradaIdSchema } from "@shared/types";
import { isValidFechaVisita } from "./utils";

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
    .refine(isValidFechaVisita, {
      message: "No puede seleccionar un día lunes, feriado o anterior al actual",
    }),
  entradas: z
    .array(entradaFormSchema)
    .min(1, "Debe ingresar al menos una entrada")
    .max(10, "No puede comprar más de 10 entradas"),
});