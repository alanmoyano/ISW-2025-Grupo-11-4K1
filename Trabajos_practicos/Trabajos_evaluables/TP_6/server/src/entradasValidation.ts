import type { Entrada, Pedido } from "@shared/types";

const CUPOS = {
  MAX_ENTRADAS_POR_PEDIDO: 10,
  CUPO_MAXIMO_DIARIO: 100,
};

validarCantidadEntradas;
export function validarFechaVisita(fecha: string): boolean {
  const fechaVisita = new Date(fecha);

  // Normalizam la fecha de visita a medianoche
  fechaVisita.setUTCHours(0, 0, 0, 0);

  const hoy = new Date();
  // Normaliza la fecha de hoy a medianoche
  hoy.setUTCHours(0, 0, 0, 0);

  // Verificamos la antelación mínima de 2 días
  const fechaMaximaReserva = new Date(hoy);
  fechaMaximaReserva.setUTCDate(hoy.getUTCDate() + 2);
  const fechaAyer = new Date(hoy);
  fechaAyer.setUTCDate(hoy.getUTCDate() - 1);

  if (fechaVisita > fechaMaximaReserva || fechaVisita <= fechaAyer) {
    return false;
  }

  // Verificamos feriados (Navidad y Año Nuevo)

  const navidad = new Date(fechaVisita.getFullYear(), 11, 25);
  const anoNuevo = new Date(fechaVisita.getFullYear(), 0, 1);

  // Normalizamos los feriados para comparar
  navidad.setUTCHours(0, 0, 0, 0);
  anoNuevo.setUTCHours(0, 0, 0, 0);

  // usaa getTime() p. hacer la comparacion
  if (
    fechaVisita.getTime() === navidad.getTime() ||
    fechaVisita.getTime() === anoNuevo.getTime()
  ) {
    return false;
  }

  // Verifica q nno sea lunes
  if (fechaVisita.getUTCDay() === 1) {
    // 1 = Lunes
    return false;
  }

  // Si pasa todas las validaciones
  return true;
}

const CUPO_MAXIMO_DIARIO = 100;

export async function validarDisponibilidadCupo(
  fecha: string,
  cantidadSolicitada: number,
  fetchEntradasVendidas: (fecha: string) => Promise<number>
): Promise<boolean> {
  if (cantidadSolicitada <= 0) {
    return false;
  }

  const entradasYaVendidas = await fetchEntradasVendidas(fecha);
  const cupoRestante = CUPO_MAXIMO_DIARIO - entradasYaVendidas;

  return cantidadSolicitada <= cupoRestante;
}

// Valida la cantidad de entradas de un pedido
export function validarCantidadEntradas(entradas: Entrada[]): boolean {
  const cantidad = entradas.length;
  const MAX_ENTRADAS_POR_PEDIDO = 10;

  // Condición directa, sin ifs innecesarios
  return cantidad > 0 && cantidad <= MAX_ENTRADAS_POR_PEDIDO;
}
