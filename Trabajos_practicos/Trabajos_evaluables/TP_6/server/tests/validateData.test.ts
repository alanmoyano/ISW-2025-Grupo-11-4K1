import app from "@server/index";
import type { Pedido } from "@shared/types";
import { describe, expect, it } from "vitest";
import { validarFechaVisita } from "@server/entradasValidation";
import { validarCantidadEntradas} from "@server/entradasValidation";

describe("Validar los datos que se cargan", () => {
  it("La fecha no debe ser un lunes o un dia festivo", async () => {
    const pedidoVisita: Pedido = {
      entradas: [
        {
          id: 1,
          tipoEntradaId: 2,
          edadVisitante: 30,
          precio: 1000,
        },
      ],
      fecha: "2025-12-25",
      idFormaDePago: 1,
      total: 1000,
      usuarioId: 1,
    };

    const pedidoVisita2: Pedido = {
      entradas: [
        {
          id: 1,
          tipoEntradaId: 2,
          edadVisitante: 30,
          precio: 1000,
        },
      ],
      fecha: "2025-11-03",
      idFormaDePago: 1,
      total: 1000,
      usuarioId: 1,
    };

    expect(validarFechaVisita(pedidoVisita)).toBe(false);
    expect(validarFechaVisita(pedidoVisita2)).toBe(false);
  });
});


describe("Validar cantidad de entradas", () => {
  it("Debe rechazar un pedido sin entradas", () => {
    const pedido: Pedido = {
      usuarioId: 1,
      entradas: [],
      idFormaDePago: 1,
      fecha: "2025-12-27",
      total: 0,
    };
    expect(validarCantidadEntradas(pedido)).toBe(false);
  });

  it("Debe aceptar un pedido con 1 a 10 entradas", () => {
    const pedido: Pedido = {
      usuarioId: 1,
      entradas: Array(3).fill({
        id: 1,
        tipoEntradaId: 2,
        edadVisitante: 30,
        precio: 5000,
      }),
      idFormaDePago: 1,
      fecha: "2025-12-27",
      total: 15000,
    };
    expect(validarCantidadEntradas(pedido)).toBe(true);
  });

  it("Debe rechazar un pedido con más de 10 entradas", () => {
    const pedido: Pedido = {
      usuarioId: 1,
      entradas: Array(15).fill({
        id: 1,
        tipoEntradaId: 2,
        edadVisitante: 30,
        precio: 5000,
      }),
      idFormaDePago: 1,
      fecha: "2025-12-27",
      total: 75000,
    };
    expect(validarCantidadEntradas(pedido)).toBe(false);
  });
});