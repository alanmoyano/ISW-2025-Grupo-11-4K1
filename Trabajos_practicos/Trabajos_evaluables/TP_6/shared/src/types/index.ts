export type ApiResponse = {
  message: string;
  success: true;
};

export type TipoEntrada = {
  id: number;
  nombre: string;
  precio: number;
};

export type FormaDePago = {
  id: number;
  nombre: string;
};

export type Entrada = {
  id: number;
  tipoEntradaId: number;
  edadVisitante: number;
  precio: number;
};

export type Pedido = {
  usuarioId: number;
  entradas: Array<Entrada>;
  idFormaDePago: number;
  numeroTarjeta?: number;
  fechaVencimientoTarjeta?: string;
  cvvTarjeta?: number;
  fecha: string;
  total: number;
};

export type Usuario = {
  id: number;
  nombre: string;
  email: string;
};
