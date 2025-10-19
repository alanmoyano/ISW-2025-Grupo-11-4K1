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

const CUPO_MAXIMO_DIARIO = 100;

async function getEntradasVendidasPorFecha(fecha: string): Promise<number> {
  // Ejemplo mockeado
  if (fecha === "2025-11-05") {
    return 98; // Simulamos que ya se vendieron 98 esa fecha
  }
  return 50; // Simulamos que ya se vendieron 50 en otras fechas
}

export async function validarDisponibilidadCupo(
  pedido: Pedido,
  fetchEntradasVendidas: (fecha: string) => Promise<number>
): Promise<boolean> {
  const { fecha, entradas } = pedido;
  const cantidadSolicitada = entradas.length;

  if (cantidadSolicitada === 0) {
    return false; 
  }

  // Obtenemos las entradas ya vendidas usando la funcion que nos pasaron
  const entradasYaVendidas = await fetchEntradasVendidas(fecha);
  const cupoRestante = CUPO_MAXIMO_DIARIO - entradasYaVendidas;

  return cantidadSolicitada <= cupoRestante;
}
