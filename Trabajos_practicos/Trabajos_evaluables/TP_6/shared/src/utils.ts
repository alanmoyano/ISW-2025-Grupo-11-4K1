import {
  BodyPostPedidoSchema,
  entradaSchema,
  formaDePagoSchema,
  pedidoSchema,
  tipoEntradaSchema,
  usuarioSchema,
  type ApiResponse,
  type BodyPostPedido,
  type Entrada,
  type FormaDePago,
  type Pedido,
  type TipoEntrada,
  type Usuario,
} from "@shared/types";

export function buildApiResponse<T>(
  data: T,
  success: boolean,
  message?: string,
): ApiResponse<T> {
  return { data, message, success };
}

export function isTipoEntrada(value: unknown): value is TipoEntrada {
  return tipoEntradaSchema.safeParse(value).success;
}

export function isFormaDePago(value: unknown): value is FormaDePago {
  return formaDePagoSchema.safeParse(value).success;
}

export function isEntrada(value: unknown): value is Entrada {
  return entradaSchema.safeParse(value).success;
}

export function isPedido(value: unknown): value is Pedido {
  return pedidoSchema.safeParse(value).success;
}

export function isUsuario(value: unknown): value is Usuario {
  return usuarioSchema.safeParse(value).success;
}

export function isBodyPostPedido(value: unknown): value is BodyPostPedido {
  return BodyPostPedidoSchema.safeParse(value).success;
}
