import type Database from "bun:sqlite";
import type { TipoEntrada } from "@shared/types";
import { isTipoEntrada } from "@shared/utils";

export async function obtenerTiposDeEntrada(
  db: Database
): Promise<TipoEntrada[]> {
  const tiposEntrada: TipoEntrada[] = [];

  const resultado = db.query("SELECT * FROM tipo_entrada").all();

  console.log(resultado);

  for (let fila in resultado) {
    if (!isTipoEntrada(resultado[fila])) {
      throw new Error("Tipo de entrada inválido");
    }

    const nuevoTipoEntrada: TipoEntrada = {
      id: resultado[fila].id,
      nombre: resultado[fila].nombre,
      precio: resultado[fila].precio,
    };
    tiposEntrada.push(nuevoTipoEntrada);
  }

  return tiposEntrada;
}
