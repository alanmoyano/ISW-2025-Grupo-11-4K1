import type { Entrada } from "@shared/types";


const PRECIOS_BASE = {
  1: 5000, // ID 1: Regular
  2: 10000, // ID 2: VIP
};

// Este es el tipo de dato que el test (y el cliente) envían.
// Es una 'Entrada' pero sin 'id' y 'precio', ya que esos datos los genera el servidor.
type EntradaDesdeCliente = Omit<Entrada, "id" | "precio">;

/*
 * Calcula el precio de una única entrada aplicando las reglas de descuento.
 * Esta función es una ayuda interna para mantener el código limpio.
 * @param entrada La entrada a calcular.
 * @returns El precio final de la entrada.
 */
function calcularPrecioEntrada(entrada: EntradaDesdeCliente): number {
  const precioBase = PRECIOS_BASE[entrada.tipoEntradaId as keyof typeof PRECIOS_BASE];

  // REQUISITO: Menores o iguales a 3 años no pagan.
  if (entrada.edadVisitante <= 3) {
    return 0;
  }

  // REQUISITO: Menores o iguales a 10 y mayores o iguales a 60 pagan la mitad.
  if (entrada.edadVisitante <= 10 || entrada.edadVisitante >= 60) {
    return precioBase * 0.5;
  }

  
  return precioBase;
}

/**


 * @param entradas Array de objetos de tipo EntradaDesdeCliente.
 * @returns El monto total a pagar.
 */
export function calcularPrecioTotal(entradas: EntradaDesdeCliente[]): number {
  // Usamos .reduce() para sumar el precio calculado de cada entrada en la lista.
  return entradas.reduce(
    (total, entrada) => total + calcularPrecioEntrada(entrada),
    0, 
  );
}