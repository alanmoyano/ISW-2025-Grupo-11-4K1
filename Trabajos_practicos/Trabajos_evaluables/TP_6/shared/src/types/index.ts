import { z } from "zod";

export type ApiResponse<T = string> = {
  message?: string;
  data: T;
  success: boolean;
};

export const tipoEntradaSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  precio: z.number(),
});

export type TipoEntrada = z.infer<typeof tipoEntradaSchema>;

export const formaDePagoSchema = z.object({
  id: z.number(),
  nombre: z.string(),
});

export type FormaDePago = z.infer<typeof formaDePagoSchema>;

export const entradaSchema = z.object({
  id: z.number(),
  tipoEntradaId: z.number(),
  edadVisitante: z.number(),
  precio: z.number(),
  utilizada: z.boolean(),
});

export type Entrada = z.infer<typeof entradaSchema>;

export const pedidoSchema = z.object({
  idPedido: z.number(),
  usuarioId: z.number(),
  entradas: z.array(entradaSchema),
  idFormaDePago: z.number(),
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
