import { app } from "@server/index";

import type { Entrada, Pedido } from "@shared/types";
import { testClient } from "hono/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as accesoDB from "@server/dbAccess";
import eventDispatcher from "@server/eventDispatcher";

const mockGuardarPedidoDeVisita = vi.spyOn(accesoDB, "guardarPedidoDeVisita");
const mockGuardarEntradasReferidasAPedido = vi.spyOn(
  accesoDB,
  "guardarEntradasReferidasAPedido",
);

vi.mock("../src/dbAccess", () => ({
  // Exporta una instancia MOCKEADA de la DB que no hace nada real
  db: {
    // Si la DB tiene métodos como prepare, run, query, etc., deben ser mocks
    prepare: vi.fn(() => ({ run: vi.fn(() => ({ lastInsertRowid: 1 })) })),
    // Asegúrate de mockear todos los métodos que tu código original usa
  },
}));

afterEach(() => {
  eventDispatcher.removeAllListeners();
});

const hoy = new Date();

const Manana = new Date(hoy.getTime() + 86400000);
const Ayer = new Date(hoy.getTime() - 86400000);
const MananaStr: string = Manana.toISOString().split("T")[0] || "2025-10-22";
const AyerStr: string = Ayer.toISOString().split("T")[0] || "2025-10-29";

describe("Post Data tests", () => {
  const PedidoValidoEsperadoEfectivo: Pedido = {
    idPedido: 1,
    usuarioId: 1,
    idFormaDePago: 1,
    fecha: MananaStr,
    total: 5000,
    entradas: [
      {
        id: 1,
        tipoEntradaId: 1,
        edadVisitante: 30,
        precio: 5000,
        utilizada: false,
        pedidoId: 1,
      },
    ],
  };

  const EntradasValidasPedidoEfectivo: Entrada = {
    id: 1,
    tipoEntradaId: 1,
    edadVisitante: 30,
    precio: 5000,
    utilizada: false,
    pedidoId: 1,
  };

  const PedidoValidoEsperadoTarjeta: Pedido = {
    idPedido: 2,
    usuarioId: 1,
    idFormaDePago: 2,
    fecha: MananaStr,
    total: 5000,
    entradas: [
      {
        id: 2,
        tipoEntradaId: 1,
        edadVisitante: 30,
        precio: 5000,
        utilizada: false,
        pedidoId: 2,
      },
    ],
  };

  const EntradasValidasPedidoConTarjeta: Entrada = {
    id: 2,
    tipoEntradaId: 1,
    edadVisitante: 30,
    precio: 5000,
    utilizada: false,
    pedidoId: 2,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(`Deberia postear un pedido pagado en efectivo, programado para el dia de mañana,
    con 1 entrada regular, para una persona de 30 años, la cual no recibe descuento,
    devolviendome el pedido creado,
    junto a las entradas creadas y el status 201`, async () => {
    mockGuardarPedidoDeVisita.mockResolvedValueOnce(
      PedidoValidoEsperadoEfectivo,
    );
    mockGuardarEntradasReferidasAPedido.mockResolvedValueOnce(
      EntradasValidasPedidoEfectivo,
    );
    const respone = await testClient(app).pedido.$post({
      json: {
        idFormaDePago: 1,
        fecha: MananaStr,
        entradas: [
          {
            tipoEntradaId: 1,
            edadVisitante: 30,
          },
        ],
      },
    });
    expect(respone.status).toBe(201);

    expect(mockGuardarEntradasReferidasAPedido).toHaveBeenCalledTimes(1);

    const { data, success } = await respone.json();

    expect(data).toEqual(PedidoValidoEsperadoEfectivo);
    expect(success).toBe(true);
  });
  it(`Deberia postear un pedido pagado con tarjeta el cual es autorizado,
    programado para el dia de mañana, con 1 entrada regular,
    para una persona de 30 años, la cual no recibe descuento,
    devolviendome el pedido creado,
    junto a las entradas creadas y el status 201`, async () => {
    mockGuardarPedidoDeVisita.mockResolvedValueOnce(
      PedidoValidoEsperadoTarjeta,
    );
    mockGuardarEntradasReferidasAPedido.mockResolvedValueOnce(
      EntradasValidasPedidoConTarjeta,
    );
    const respone = await testClient(app).pedido.$post({
      json: {
        idFormaDePago: 2,
        fecha: MananaStr,
        entradas: [
          {
            tipoEntradaId: 1,
            edadVisitante: 30,
          },
        ],
        numeroTarjeta: 1234556789012345,
        fechaVencimiento: "12/29",
        codigoSeguridad: 123,
      },
    });
    expect(respone.status).toBe(201);
    const { data, success } = await respone.json();

    expect(data).toEqual(PedidoValidoEsperadoTarjeta);
    expect(success).toBe(true);
  });
  it(`Deberia fallar al intentar crear un pedido pagado con tarjeta la cual no es autorizada,
    no devolviendo ningun objeto y el status 402`, async () => {
    const respone = await testClient(app).pedido.$post({
      json: {
        idFormaDePago: 2,
        fecha: MananaStr,
        entradas: [
          {
            tipoEntradaId: 1,
            edadVisitante: 30,
          },
        ],
        numeroTarjeta: 1234556789012345,
        fechaVencimiento: "12/29",
        codigoSeguridad: 666,
      },z
    });
    expect(respone.status).toBe(402);
    const { data, success } = await respone.json();

    expect(data).toEqual(null);
    expect(success).toBe(false);
  });

  it(`Deberia fallar al intentar crear un pedido en una fecha anterior al dia actual,
    no devolviendo ningun objeto y el status 400`, async () => {
    const respone = await testClient(app).pedido.$post({
      json: {
        idFormaDePago: 1,
        fecha: AyerStr,
        entradas: [
          {
            tipoEntradaId: 1,
            edadVisitante: 30,
          },
        ],
      },
    });
    expect(respone.status).toBe(400);
    const { data, success } = await respone.json();

    expect(data).toEqual(null);
    expect(success).toBe(false);
  });
  it(`Deberia fallar al intentar crear un pedido sin seleccionar forma de pago,
    no devolviendo ningun objeto y el status 400`, async () => {
    const respone = await testClient(app).pedido.$post({
      json: {
        fecha: AyerStr,
        entradas: [
          {
            tipoEntradaId: 1,
            edadVisitante: 30,
          },
        ],
      },
    });
    expect(respone.status).toBe(400);
    const { data, success } = await respone.json();

    expect(data).toEqual(null);
    expect(success).toBe(false);
  });
  it(`Deberia fallar al intentar crear un pedido con 11 entradas seleccionadas,
    no devolviendo ningun objeto y el status 400`, async () => {
    const respone = await testClient(app).pedido.$post({
      json: {
        fecha: AyerStr,
        entradas: Array(11).fill({
          tipoEntradaId: 1,
          edadVisitante: 30,
        }),
      },
    });
    expect(respone.status).toBe(400);
    const { data, success } = await respone.json();

    expect(data).toEqual(null);
    expect(success).toBe(false);
  });
});
