import type Database from "bun:sqlite";
import type { TipoEntrada } from "@shared/types";
import { isTipoEntrada } from "@shared/utils";

export async function obtenerTiposDeEntrada(
  db: Database
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
