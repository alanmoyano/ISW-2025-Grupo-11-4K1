import type Database from "bun:sqlite";
import { type TipoEntrada } from "@shared/types";
import { isTipoEntrada, isFormaDePago } from "@shared/utils";
import type { FormaDePago } from "shared/dist";

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

  for (let fila of resultado) {
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
