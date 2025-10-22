import { app } from "@server/index";
import { testClient } from "hono/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FormaDePago, TipoEntrada } from "@shared/types";
import * as accesoDB from "../src/dbAccess";

const mockObtenerTiposDeEntrada = vi.spyOn(accesoDB, "obtenerTiposDeEntrada");
const mockObtenerFormaDePago = vi.spyOn(accesoDB, "obtenerFormasDePago");

describe("Get Data test", () => {
  // 2. Definir los datos que la BD *debe* devolverconst mockObtenerTiposDeEntrada = vi.spyOn(accesoDB, "obtenerTiposDeEntrada");
  const datosEsperadosTipoEntradas: TipoEntrada[] = [
    { id: 1, nombre: "Regular", precio: 5000 },
    { id: 2, nombre: "VIP", precio: 10000 },
    { id: 3, nombre: "Menor de 3 años", precio: 0 },
  ];

  beforeEach(() => {
    // 3. Configurar el mock para que devuelva los datos esperados
    mockObtenerTiposDeEntrada.mockResolvedValue(datosEsperadosTipoEntradas);
  });

  const datosEsperadosFormasPago: FormaDePago[] = [
    { id: 1, nombre: "Efectivo" },
    { id: 2, nombre: "Tarjeta" },
  ];

  beforeEach(() => {
    mockObtenerFormaDePago.mockResolvedValue(datosEsperadosFormasPago);
  });

  it("Deberia obtener las entradas desde la base de datos a traves de ese endpoint", async () => {
    const response = await testClient(app).tipoEntradas.$get();

    expect(response.status).toBe(200);
    const { data, success } = await response.json();

    expect(data).toEqual(datosEsperadosTipoEntradas);
    expect(success).toBe(true);
  });
  it("Deberia obtener las formas de pago disponibles desde la base de datos a traves de ese endpoint", async () => {
    const response = await testClient(app).formasDePago.$get();

    expect(response.status).toBe(200);
    const { data, success } = await response.json();

    expect(data).toEqual(datosEsperadosFormasPago);
    expect(success).toBe(true);
  });
});
