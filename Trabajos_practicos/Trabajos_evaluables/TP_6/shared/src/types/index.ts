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
  utilizada: boolean
};

export type Pedido = {
  idPedido: number;
  usuarioId: number;
  entradas: Array<Entrada>;
  idFormaDePago: number;
  fecha: string;
  total: number;
};

export type Usuario = {
  id: number;
  nombre: string;
  email: string;
};
