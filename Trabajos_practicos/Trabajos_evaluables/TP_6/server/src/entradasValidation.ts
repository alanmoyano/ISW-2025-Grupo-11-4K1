import type { Entrada } from "@shared/types";
import type { Pedido } from "@shared/types";

export function validarFechaVisita(pedidoVisita: Pedido): boolean {
  const { fecha } = pedidoVisita;

  const fechaVisita = new Date(fecha);

  // verificamos si la fecha no es navidad o año nuevo
  const navidad = new Date(fechaVisita.getFullYear(), 11, 25);
  const anoNuevo = new Date(fechaVisita.getFullYear(), 0, 1);

  if (
    fechaVisita.getUTCDate() === navidad.getUTCDate() ||
    fechaVisita.getUTCDate() === anoNuevo.getUTCDate()
  ) {
    return false;
  }

  // verificamos si la fecha no es lunes (0=domingo, 1=lunes, ..., 6=sábado)
  if (fechaVisita.getUTCDay() === 1) {
    return false;
  }

  return true;
}
