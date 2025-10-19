import app from "@server/index";
import type { Pedido } from "@shared/types";
import { describe, expect, it } from "vitest";
import { validarFechaVisita } from "@server/entradasValidation";

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
