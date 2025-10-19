import type { Entrada, Pedido } from "@shared/types";

export function validarFechaVisita(pedidoVisita: Pedido): boolean {
  const { fecha } = pedidoVisita;
  const fechaVisita = new Date(fecha);

  // Normalizam la fecha de visita a medianoche
  fechaVisita.setUTCHours(0, 0, 0, 0);

  const hoy = new Date();
  // Normaliza la fecha de hoy a medianoche
  hoy.setUTCHours(0, 0, 0, 0);

  // Verificamos la antelación mínima de 2 días
  const fechaMinimaReserva = new Date(hoy);
  fechaMinimaReserva.setUTCDate(hoy.getUTCDate() + 2);

  if (fechaVisita < fechaMinimaReserva) {
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
  if (fechaVisita.getUTCDay() === 1) { // 1 = Lunes
    return false;
  }

  // Si pasa todas las validaciones
  return true;
}

export function validarCupoDiario(entradasVendidas: number): boolean {
  const CUPO_MAXIMO = 100;
  return entradasVendidas < CUPO_MAXIMO;
}