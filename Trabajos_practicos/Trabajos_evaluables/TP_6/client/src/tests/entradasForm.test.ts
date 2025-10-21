import { expect, describe, it } from "vitest"
import { Pedido } from "@shared/types"
import { entradaFormSchema, entradasFormSchema } from "../lib/schemas.ts";

describe("Validación del formulario de compra de entradas", () => {

  describe("Fecha de visita", () => {

    it("Debe requerir fecha de visita", () => {
      const pedido: Pedido = {
        idPedido: 1,
        usuarioId: 1,
        entradas: [{
          id: 1, tipoEntradaId: 1, edadVisitante: 30, precio: 1000, utilizada: false,
          pedidoId: 0
        }],
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
        entradas: [{
          id: 1, tipoEntradaId: 1, edadVisitante: 30, precio: 1000, utilizada: false,
          pedidoId: 0
        }],
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
        entradas: [{
          id: 1, tipoEntradaId: 1, edadVisitante: 30, precio: 1000, utilizada: false,
          pedidoId: 0
        }],
        idFormaDePago: 1,
        fecha: "2025-12-25",
        total: 1000,
        };

      const result = entradasFormSchema.safeParse(pedido);
      expect(result.success).toBe(false);
    });

    it("Debe ser del dia actual o futuro", () => {
      const pedido: Pedido = {
        idPedido: 1,
        usuarioId: 1,
        entradas: [{
          id: 1, tipoEntradaId: 1, edadVisitante: 30, precio: 1000, utilizada: false,
          pedidoId: 0
        }],
        idFormaDePago: 1,
        fecha: "2025-08-16",
        total: 1000,
      };
    
      const result = entradasFormSchema.safeParse(pedido);
      expect(result.success).toBe(false);
    })

  });

  describe("Cantidad de entradas", () => {
    it("Debe requerir al menos una entrada", () => {
      const pedido: Pedido = {
        idPedido: 1,
        usuarioId: 1,
        entradas: [],
        idFormaDePago: 1,
       fecha: "2025-10-21",
        total: 1000,
      };

      const result = entradasFormSchema.safeParse(pedido);
      expect(result.success).toBe(false);
    });
  })

  it("No debe permitir mas de 10 entradas", () => {
    const pedido: Pedido = {
      idPedido: 1,
      usuarioId: 1,
      entradas: new Array(19).fill({ id: 1, tipoEntradaId: 1, edadVisitante: 30, precio: 1000, utilizada: false }),
      idFormaDePago: 1,
      fecha: "2025-10-21",
      total: 1000,
    };

    const result = entradasFormSchema.safeParse(pedido);
    expect(result.success).toBe(false);
  });

  it("Debe aceptar una cantidad entre 1 y 10", () => {
    const pedido: Pedido = {
      idPedido: 1,
      usuarioId: 1,
      entradas: new Array(9).fill({ id: 1, tipoEntradaId: 1, edadVisitante: 30, precio: 1000, utilizada: false }),
      idFormaDePago: 1,
      fecha: "2025-10-23",
      total: 1000,
    };

    const result = entradasFormSchema.safeParse(pedido);
    expect(result.success).toBe(true);
  });

  describe("Entrada", () => {
    it("Debe requerir la edad del visitante", () => {
      const pedido = {
        idPedido: 1,
        usuarioId: 1,
        entradas: [{ id: 1, tipoEntradaId: 1, edadVisitante: null, precio: 1000, utilizada: false }],
        idFormaDePago: 1,
        fecha: "2025-10-21",
        total: 1000,
      };

      const result = entradasFormSchema.safeParse(pedido);
      expect(result.success).toBe(false);
    });

    it("Debe requerir el tipo de entrada", () => {
      const pedido = {
        idPedido: 1,
        usuarioId: 1,
        entradas: [{ id: 1, tipoEntradaId: null, edadVisitante: 30, precio: 1000, utilizada: false }],
        idFormaDePago: 1,
        fecha: "2025-10-21",
        total: 1000,
      };

      const result = entradasFormSchema.safeParse(pedido);
      expect(result.success).toBe(false);
    });

    it("Debe fallar si la edad es negativa", () => {
      const entrada = { id: 1, tipoEntradaId: 1, edadVisitante: -3, precio: 1000, utilizada: false};
      const result = entradaFormSchema.safeParse(entrada);
      expect(result.success).toBe(false);
    });

    it("Debe fallar si la edad supera los 110 años", () => {
      const entrada = { id: 1, tipoEntradaId: 1, edadVisitante: 111, precio: 1000, utilizada: false};
      const result = entradaFormSchema.safeParse(entrada);
      expect(result.success).toBe(false);
    });

    it("Debe fallar si el tipo de entrada es invalido", () => {
      const entrada = { id: 1, tipoEntradaId: 99, edadVisitante: 30, precio: 1000, utilizada: false};
      const result = entradaFormSchema.safeParse(entrada);
      expect(result.success).toBe(false);
    });
    
  })

});