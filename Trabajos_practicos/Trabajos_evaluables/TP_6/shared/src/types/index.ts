import { z } from "zod";

export type ApiResponse<T = string> = {
  message?: string;
  data: T;
  success: boolean;
};

export const TipoEntradaEnum = {
  REGULAR: 1,
  VIP: 2,
  MENOR: 3,
} as const;

const tipoEntradaLiterals = Object.values(TipoEntradaEnum).map((v) =>
  z.literal(v),
);

export const tipoEntradaIdSchema = z.union(
  tipoEntradaLiterals as [
    (typeof tipoEntradaLiterals)[0],
    ...typeof tipoEntradaLiterals,
  ],
);

export const tipoEntradaSchema = z.object({
  id: tipoEntradaIdSchema,
  nombre: z.string(),
  precio: z.number(),
});

export type TipoEntrada = z.infer<typeof tipoEntradaSchema>;

export const FormaPagoEnum = {
  EFECTIVO: 1,
  TARJETA: 2,
} as const;

const formaPagoLiterals = Object.values(FormaPagoEnum).map(v => z.literal(v));

export const idFormaPagoSchema = z.union(
  formaPagoLiterals as [typeof formaPagoLiterals[0], ...typeof formaPagoLiterals]
);

export const formaDePagoSchema = z.object({
  id: idFormaPagoSchema,
  nombre: z.string(),
});

export type FormaDePago = z.infer<typeof formaDePagoSchema>;

export const entradaSchema = z.object({
  id: z.number(),
  tipoEntradaId: tipoEntradaIdSchema,
  edadVisitante: z.number(),
  precio: z.number(),
  utilizada: z.boolean(),
  pedidoId: z.number(),
});

export type Entrada = z.infer<typeof entradaSchema>;

export const pedidoSchema = z.object({
  idPedido: z.number(),
  usuarioId: z.number(),
  entradas: z.array(entradaSchema),
  idFormaDePago: idFormaPagoSchema,
  fecha: z.string(),
  total: z.number(),
});

export type Pedido = z.infer<typeof pedidoSchema>;

export const usuarioSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  email: z.string(),
});

export type Usuario = z.infer<typeof usuarioSchema>;

export const BodyPostPedidoSchema = z.object({
  idFormaDePago: z.number(),
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "El formato de fecha debe ser YYYY-MM-DD"),
  entradas: z
    .array(entradaSchema.omit({ pedidoId: true, id: true }))
    .min(1, "Debe haber al menos una entrada")
    .max(10, "No puede comprar más de 10 entradas"),
  numeroTarjeta: z.number().optional(),
  fechaVencimiento: z.string().optional(),
  codigoSeguridad: z.number().optional(),
});

export type BodyPostPedido = z.infer<typeof BodyPostPedidoSchema>;
