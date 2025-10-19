import app from "@server/index";
import { describe, expect, it } from "vitest";
import type { TipoEntrada } from "shared/src/types/index";

describe("Get Data test", () => {
  it("Obtener entradas desde la base de datos", async () => {
    const response = await app.request("/entradas");

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data.entradas).toEqual([
      { id: 1, nombre: "Regular", precio: 5000 },
      { id: 2, nombre: "VIP", precio: 10000 },
      { id: 3, nombre: "Menor de 3 años", precio: 0 },
    ]);
  });
});
