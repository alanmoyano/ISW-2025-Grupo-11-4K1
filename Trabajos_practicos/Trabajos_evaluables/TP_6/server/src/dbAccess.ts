import type Database from "bun:sqlite";
import type { Entrada, FormaDePago, Pedido, TipoEntrada } from "@shared/types";
import { isFormaDePago, isTipoEntrada } from "@shared/utils";
import { calcularPrecioEntrada } from "./precioUtils";

export async function obtenerTiposDeEntrada(
  db: Database,
): Promise<TipoEntrada[]> {
  const tiposEntrada: TipoEntrada[] = [];

  const resultado = db.query("SELECT * FROM tipo_entrada").all();

  for (const tipoEntrada of resultado) {
    if (!isTipoEntrada(tipoEntrada)) {
      throw new Error("Tipo de entrada inválido");
    }

    const nuevoTipoEntrada: TipoEntrada = {
      id: tipoEntrada.id,
      nombre: tipoEntrada.nombre,
      precio: tipoEntrada.precio,
    };
    tiposEntrada.push(nuevoTipoEntrada);
  }

  return tiposEntrada;
}

export async function obtenerFormasDePago(
  db: Database,
): Promise<FormaDePago[]> {
  const FormasPago: FormaDePago[] = [];

  const resultado = db.query("SELECT * FROM forma_de_pago").all();

  for (const fila of resultado) {
    if (!isFormaDePago(fila)) {
      throw new Error("Forma de pago inválida");
    }

    const nuevaFormaPago: FormaDePago = {
      id: fila.id,
      nombre: fila.nombre,
    };
    FormasPago.push(nuevaFormaPago);
  }
  return FormasPago;
}

export async function guardarPedidoDeVisita(
  db: Database,
  idUsuario: number,
  idFormaDePago: 1 | 2,
  fecha: string,
  total: number,
): Promise<Pedido> {
  const query =
    db.prepare(`INSERT INTO pedido (usuario_id, id_forma_de_pago, fecha, total)
    VALUES (?, ?, ?, ?)`);

  const resultado = query.run(idUsuario, idFormaDePago, fecha, total);

  const nuevoPedido: Pedido = {
    idPedido: resultado.lastInsertRowid as number,
    usuarioId: idUsuario,
    idFormaDePago: idFormaDePago,
    fecha: fecha,
    total: total,
    entradas: [],
  };

  return nuevoPedido;
}

export async function guardarEntradasReferidasAPedido(
  db: Database,
  idPedido: number,
  tipoEntradaId: 1 | 2 | 3,
  edadVisitante: number,
): Promise<Entrada> {
  const query =
    db.prepare(`INSERT INTO entrada (pedido_id, tipo_entrada_id, edad_visitante, precio, utilizada)
    VALUES (?, ?, ?, ?, ?)`);
  
  const nuevaEntrada: Entrada = {
    id: 0,
    tipoEntradaId: tipoEntradaId,
    edadVisitante: edadVisitante,
    precio: 0,
    utilizada: false,
    pedidoId: idPedido,
  };

  nuevaEntrada.precio = calcularPrecioEntrada(nuevaEntrada);

  const resultado = query.run(
    idPedido,
    tipoEntradaId,
    edadVisitante,
    nuevaEntrada.precio,
    false,
  );

  nuevaEntrada.id = resultado.lastInsertRowid as number;

  return nuevaEntrada;
}
