import { describe, expect, it, vi } from "vitest";
import type { Pedido } from "@shared/types";
import { validarDisponibilidadCupo } from "@server/entradasValidation";

const mockFetchEntradasVendidas = vi.fn();

describe("Validar capacidad y cupo", () => {
  it("deberia permitir la compra si hay cupo suficiente", async () => {
    const pedido: Pedido = {
      usuarioId: 1,
      idFormaDePago: 1,
      fecha: "2025-11-04",
      total: 25000,
      entradas: [
        { id: 1, tipoEntradaId: 1, edadVisitante: 30, precio: 5000 },
        { id: 2, tipoEntradaId: 1, edadVisitante: 32, precio: 5000 },
        { id: 3, tipoEntradaId: 1, edadVisitante: 8, precio: 2500 },
        { id: 4, tipoEntradaId: 2, edadVisitante: 65, precio: 7500 },
        { id: 5, tipoEntradaId: 1, edadVisitante: 5, precio: 2500 },
      ],
    };

    // Cupo restante = 100 - 50 = 50 / Pedido 5 (pasa)
    mockFetchEntradasVendidas.mockResolvedValue(50);

    const resultado = await validarDisponibilidadCupo(pedido, mockFetchEntradasVendidas);
    expect(resultado).toBe(true);
  });

  it("deberia rechazar la compra si el cupo es insuficiente", async () => {
    const pedido: Pedido = {
      usuarioId: 2,
      idFormaDePago: 2,
      fecha: "2025-11-05",
      total: 15000,
      numeroTarjeta: 4506460311935388,
      entradas: [
        { id: 6, tipoEntradaId: 1, edadVisitante: 40, precio: 5000, utilizada: false },
        { id: 7, tipoEntradaId: 1, edadVisitante: 41, precio: 5000, utilizada: false },
        { id: 8, tipoEntradaId: 1, edadVisitante: 12, precio: 5000, utilizada: false },
      ],
    };
    // Cupo restante = 100 - 98 = 2 / Pedido 3 (no pasa)
    mockFetchEntradasVendidas.mockResolvedValue(98);

    const resultado = await validarDisponibilidadCupo(pedido, mockFetchEntradasVendidas);
    expect(resultado).toBe(false);
  });

  it("deberia permitir la compra si se pide la cantidad exacta de cupo restante", async () => {
    const pedido: Pedido = {
      usuarioId: 3,
      idFormaDePago: 1,
      fecha: "2025-11-06",
      total: 10000,
      entradas: [
        { id: 9, tipoEntradaId: 1, edadVisitante: 25, precio: 5000 },
        { id: 10, tipoEntradaId: 1, edadVisitante: 25, precio: 5000 },
      ],
    };
    // Cupo restante = 100 - 98 = 2 / Pedido 2 (pasa)
    mockFetchEntradasVendidas.mockResolvedValue(98);

    const resultado = await validarDisponibilidadCupo(pedido, mockFetchEntradasVendidas);
    expect(resultado).toBe(true);
  });
});