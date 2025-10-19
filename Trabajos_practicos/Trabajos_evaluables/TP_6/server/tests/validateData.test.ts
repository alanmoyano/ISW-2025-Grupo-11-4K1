import app from "@server/index";
import type { Pedido } from "@shared/types";
import { describe, expect, it } from "vitest";
import { validarFechaVisita } from "@server/entradasValidation";
import { validarAlgorimoLuhn, validarLongitudNumeroTarjeta } from "@server/formaPagoValidation";

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

  it("Si la forma de pago es tarjeta de debito/credito, deben ingresar un numero entre 16 y 19 digitos", async () => {
    const numeroDeTarjetaValido = 4506460311935388;
    const numeroDeTarjetaInvalido = 123456789;

    expect(validarLongitudNumeroTarjeta(numeroDeTarjetaValido)).toBe(true);
    expect(validarLongitudNumeroTarjeta(numeroDeTarjetaInvalido)).toBe(false);
  });
  it("Si la forma de pago es tarjeta de debito/credito, deben ingresar un numero de tarjeta que siga el algoritmo de Luhn", async () => {
    const numeroDeTarjetaValido = 4506460311935388;
    const numeroDeTarjetaInvalido = 1234567890123456;

    expect(validarAlgorimoLuhn(numeroDeTarjetaValido)).toBe(true);
    expect(validarAlgorimoLuhn(numeroDeTarjetaInvalido)).toBe(false);
  });
});
