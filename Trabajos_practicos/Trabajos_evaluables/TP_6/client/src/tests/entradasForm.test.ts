import { expect, describe, it } from "vitest"
import { Pedido } from "@shared/types"
import { entradasFormSchema } from "../lib/schemas.ts";

describe("Validación del formulario de compra de entradas", () => {

  describe("Fecha de visita", () => {

    it("Debe requerir fecha de visita", () => {
      const pedido: Pedido = {
        idPedido: 1,
        usuarioId: 1,
        entradas: [{ id: 1, tipoEntradaId: 1, edadVisitante: 30, precio: 1000, utilizada: false }],
        idFormaDePago: 1,
        fecha: "",
        total: 1000,
      };

      const result = entradasFormSchema.safeParse(pedido);
      expect(result.success).toBe(false);
    });

    it("No se puede seleccionar un lunes", () => {
      const pedido: Pedido = {
        idPedido: 1,
        usuarioId: 1,
        entradas: [{ id: 1, tipoEntradaId: 1, edadVisitante: 30, precio: 1000, utilizada: false }],
        idFormaDePago: 1,
        fecha: "2025-10-20",
        total: 1000,
      };

      const result = entradasFormSchema.safeParse(pedido);
      expect(result.success).toBe(false);
    });

    it("No se puede seleccionar un día festivo", () => {
      const pedido: Pedido = {
        idPedido: 1,
        usuarioId: 1,
        entradas: [{ id: 1, tipoEntradaId: 1, edadVisitante: 30, precio: 1000, utilizada: false }],
        idFormaDePago: 1,
        fecha: "2025-12-25",
        total: 1000,
        };

      const result = entradasFormSchema.safeParse(pedido);
      expect(result.success).toBe(false);
    });
  });

});