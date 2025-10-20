import app from "@server/index";
import { testClient } from "hono/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as accesoDB from "../src/dbAccess";

const mockObtenerTiposDeEntrada = vi.spyOn(accesoDB, "obtenerTiposDeEntrada");

describe("Get Data test", () => {
  // 2. Definir los datos que la BD *debe* devolver
  const datosEsperados = [
    { id: 1, nombre: "Regular", precio: 5000 },
    { id: 2, nombre: "VIP", precio: 10000 },
    { id: 3, nombre: "Menor de 3 años", precio: 0 },
  ];

  beforeEach(() => {
    // 3. Configurar el mock para que devuelva los datos esperados
    mockObtenerTiposDeEntrada.mockResolvedValue(datosEsperados);
  });

  it("Deberia obtener las entradas desde la base de datos a traves de ese endpoint", async () => {
    const response = await testClient(app).entradas.$get();

    expect(response.status).toBe(200);
    const { data, success } = await response.json();

    expect(data).toEqual(datosEsperados);
    expect(success).toBe(true);
  });
});
