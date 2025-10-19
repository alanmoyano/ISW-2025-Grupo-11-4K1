import { Hono } from "hono";
import { cors } from "hono/cors";
import type { ApiResponse, TipoEntrada } from "@shared/types";
import { initDatabase } from "./dbDefinition";
import { obtenerTiposDeEntrada } from "./dbAccess";

const db = initDatabase();

export const app = new Hono()

  .use(cors())

  .use(async (c, next) => {
    c.set("db", db);
    await next();
  })

  .get("/", (c) => {
    return c.text("Hello Hono!");
  })

  .get("/hello", async (c) => {
    const data: ApiResponse = {
      message: "Hello BHVR!",
      success: true,
    };

    return c.json(data, { status: 200 });
  })

  .get("/entradas", async (c) => {
    const resultados = await obtenerTiposDeEntrada(c.get("db"));
    const data: ApiResponse = {
      message: resultados,
      success: true,
    };
    return c.json(data, { status: 200 });
  });

export default app;
