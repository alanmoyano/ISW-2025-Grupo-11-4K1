import app from "@server/index";
import type { Pedido } from "@shared/types";
import { describe, expect, it } from "vitest";
import { validarFechaVisita } from "@server/entradasValidation";
import { validarCantidadEntradas } from "@server/entradasValidation";
import { pedidoSchema } from "shared/dist";

describe("Validar los datos que se cargan", () => {
  it("La fecha no debe ser un lunes o un dia festivo", async () => {
    const pedidoVisita: Pedido = {
      idPedido: 1,
      entradas: [
        {
          id: 1,
          tipoEntradaId: 2,
          edadVisitante: 30,
          precio: 1000,
          utilizada: false,
          pedidoId: 1,
        },
      ],
      fecha: "2025-12-25",
      idFormaDePago: 1,
      total: 1000,
      usuarioId: 1,
    };

    const pedidoVisita2: Pedido = {
      idPedido: 2,
      entradas: [
        {
          id: 1,
          tipoEntradaId: 2,
          edadVisitante: 30,
          precio: 1000,
          utilizada: false,
          pedidoId: 2,
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
      idPedido: 1,
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
      idPedido: 2,
      usuarioId: 1,
      entradas: Array(3).fill({
        id: 1,
        tipoEntradaId: 2,
        edadVisitante: 30,
        precio: 5000,
        pedidoId: 2,
      }),
      idFormaDePago: 1,
      fecha: "2025-12-27",
      total: 15000,
    };
    expect(validarCantidadEntradas(pedido)).toBe(true);
  });

  it("Debe rechazar un pedido con más de 10 entradas", () => {
    const pedido: Pedido = {
      idPedido: 3,
      usuarioId: 1,
      entradas: Array(15).fill({
        id: 1,
        tipoEntradaId: 2,
        edadVisitante: 30,
        precio: 5000,
        pedidoId: 3,
      }),
      idFormaDePago: 1,
      fecha: "2025-12-27",
      total: 75000,
    };
    expect(validarCantidadEntradas(pedido)).toBe(false);
  });

  it("No debe permitir fechas pasadas", () => {
    const pedidoFechaPasada: Pedido = {
      idPedido: 3,
      entradas: [
        {
          id: 1,
          tipoEntradaId: 2,
          edadVisitante: 30,
          precio: 1000,
          utilizada: false,
          pedidoId: 3,
        },
      ],
      fecha: "2024-10-10", //  fecha en el pasado
      idFormaDePago: 1,
      total: 1000,
      usuarioId: 1,
    };
    expect(validarFechaVisita(pedidoFechaPasada)).toBe(false);
  });
});
