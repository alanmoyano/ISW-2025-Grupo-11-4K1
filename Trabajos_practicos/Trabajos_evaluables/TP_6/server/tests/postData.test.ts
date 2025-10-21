import app from "@server/index";
import { testClient } from "hono/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as accesoDB from "../src/dbAccess";
import type { FormaDePago, Pedido, TipoEntrada, Entrada } from "@shared/types";

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

const Manana = new Date(Date.now() + 43200000);
const MananaStr = Manana.toISOString().split("T").length > 0 ? Manana.toISOString().split("T")[0] : "";

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
            precio: 5000,
            utilizada: false,
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
            precio: 5000,
            utilizada: false,
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
            precio: 5000,
            utilizada: false,
          },
        ],
        numeroTarjeta: 1234556789012345,
        fechaVencimiento: "12/29",
        codigoSeguridad: 666,
      },
    });
    expect(respone.status).toBe(402);
    const { data, success } = await respone.json();

    expect(data).toEqual(null);
    expect(success).toBe(false);
  });
});
