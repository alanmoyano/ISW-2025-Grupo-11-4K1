import type Database from "bun:sqlite";
import type { TipoEntrada } from "@shared/types";

export async function obtenerTiposDeEntrada(db: Database): Promise<any> {
  const tiposEntrada: Array<TipoEntrada> = [];

  const resultado: unknown[] = db.query("SELECT * FROM tipo_entrada").all();

  for (let fila in resultado) {
    const nuevoTipoEntrada: TipoEntrada = {
      id: resultado[fila].id,
      nombre: resultado[fila].nombre,
      precio: resultado[fila].precio,
    };
    tiposEntrada.push(nuevoTipoEntrada);
  }

  return tiposEntrada;
}
