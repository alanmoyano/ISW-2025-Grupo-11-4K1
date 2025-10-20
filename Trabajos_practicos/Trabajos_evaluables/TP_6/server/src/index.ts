import { buildApiResponse } from "@shared/utils";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { obtenerTiposDeEntrada } from "./dbAccess";
import { initDatabase } from "./dbDefinition";

const db = initDatabase();

export const app = new Hono()

  .use(cors())

  .get("/entradas", async (c) => {
    try {
      const resultados = await obtenerTiposDeEntrada(db);
      const data = buildApiResponse(resultados, true);
      return c.json(data, { status: 200 });
    } catch (error) {
      let message = "Error al obtener los tipos de entrada: ";

      if (Error.isError(error)) {
        message += error.message;
      } else {
        message += String(error);
      }

      return c.json(buildApiResponse(null, false, message), { status: 500 });
    }
  });

export default app;
