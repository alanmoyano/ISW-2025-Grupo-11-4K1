import { describe, it, expect } from "vitest";
import type { Entrada } from "@shared/types";
import { calcularPrecioTotal } from "../src/precioUtils";

// Se define un tipo local para el test que representa los datos que envía el cliente.

type EntradaDesdeCliente = Omit<Entrada, "id" | "precio">;

// El bloque `describe` agrupa todos los tests relacionados con la lógica de precios.
describe("Lógica de Cálculo de Precios", () => {
  // verifica que los menores de 3 años no pagan.
  it("debería devolver 0 para un niño de 3 años o menos", () => {
    const entradas: EntradaDesdeCliente[] = [
      { tipoEntradaId: 1, edadVisitante: 3, utilizada: false, pedidoId: 1 },
    ];
    const resultado = calcularPrecioTotal(entradas);
    expect(resultado).toBe(0);
  });

  // verifica el descuento del 50% para niños en entradas regulares (hasta 10 años).
  it("debería aplicar 50% de descuento a un niño de 10 años (Regular)", () => {
    const entradas: EntradaDesdeCliente[] = [
      { tipoEntradaId: 1, edadVisitante: 10, utilizada: false, pedidoId: 1 },
    ];
    // Precio Regular: 5000. Descuento 50%: 2500.
    const resultado = calcularPrecioTotal(entradas);
    expect(resultado).toBe(2500);
  });

  // verifica el descuento del 50% para niños en entradas vip (hasta 10 años).
  it("debería aplicar 50% de descuento a un niño de 10 años (Regular)", () => {
    const entradas: EntradaDesdeCliente[] = [
      { tipoEntradaId: 2, edadVisitante: 10, utilizada: false, pedidoId: 1 },
    ];
    // Precio Regular: 5000. Descuento 50%: 2500.
    const resultado = calcularPrecioTotal(entradas);
    expect(resultado).toBe(5000);
  });

  // verifica el descuento del 50% para mayores en entradas regulares(desde 60 años).
  it("debería aplicar 50% de descuento a un mayor de 60 años (VIP)", () => {
    const entradas: EntradaDesdeCliente[] = [
      { tipoEntradaId: 1, edadVisitante: 60, utilizada: false, pedidoId: 1 },
    ];
    // Precio VIP: 10000. Descuento 50%: 5000.
    const resultado = calcularPrecioTotal(entradas);
    expect(resultado).toBe(2500);
  });

  // verifica el descuento del 50% para mayores en entradas vip (desde 60 años).
  it("debería aplicar 50% de descuento a un mayor de 60 años (VIP)", () => {
    const entradas: EntradaDesdeCliente[] = [
      { tipoEntradaId: 2, edadVisitante: 60, utilizada: false, pedidoId: 1 },
    ];
    // Precio VIP: 10000. Descuento 50%: 5000.
    const resultado = calcularPrecioTotal(entradas);
    expect(resultado).toBe(5000);
  });

  // controla el precio completo para un adulto.
  it("debería cobrar el precio completo a un adulto de 30 años (Regular)", () => {
    const entradas: EntradaDesdeCliente[] = [
      { tipoEntradaId: 1, edadVisitante: 30, utilizada: false, pedidoId: 1 },
    ];
    const resultado = calcularPrecioTotal(entradas);
    expect(resultado).toBe(5000);
  });

  // Test para verificar el cálculo total de un grupo con diferentes edades y pases.
  it("debería calcular correctamente el total para un grupo mixto", () => {
    const entradas: EntradaDesdeCliente[] = [
      { tipoEntradaId: 1, edadVisitante: 35, utilizada: false, pedidoId: 1 }, // Regular, adulto: 5000
      { tipoEntradaId: 2, edadVisitante: 65, utilizada: false, pedidoId: 1 }, // VIP, mayor: 5000 (50% de 10000)
      { tipoEntradaId: 1, edadVisitante: 8, utilizada: false, pedidoId: 1 }, // Regular, niño: 2500 (50% de 5000)
      { tipoEntradaId: 1, edadVisitante: 2, utilizada: false, pedidoId: 1 }, // Regular, infante: 0
    ];
    // Total ¿12500
    const resultado = calcularPrecioTotal(entradas);
    expect(resultado).toBe(12500);
  });
});
