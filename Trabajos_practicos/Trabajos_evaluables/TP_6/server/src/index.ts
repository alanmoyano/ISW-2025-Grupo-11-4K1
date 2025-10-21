import { buildApiResponse, isBodyPostPedido } from "@shared/utils";
import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  guardarEntradasReferidasAPedido,
  guardarPedidoDeVisita,
  obtenerFormasDePago,
  obtenerTiposDeEntrada,
} from "./dbAccess";
import { initDatabase } from "./dbDefinition";
import type { BodyPostPedidoSchema } from "shared/dist";
import type { BodyPostPedido, Entrada, Pedido } from "@shared/types";
import { obtenerAutorizacionMercadoPago } from "./precioUtils";
import type { b } from "vitest/dist/chunks/mocker.d.BE_2ls6u.js";

const db = initDatabase();

export const app = new Hono()

  .use(cors())

  .get("/tipoEntradas", async (c) => {
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
  })

  .get("/formasDePago", async (c) => {
    try {
      const resultados = await obtenerFormasDePago(db);
      const data = buildApiResponse(resultados, true);
      return c.json(data, { status: 200 });
    } catch (error) {
      let message = "Error al obtener las formas de pago: ";

      if (Error.isError(error)) {
        message += error.message;
      } else {
        message += String(error);
      }
      return c.json(buildApiResponse(null, false, message), { status: 500 });
    }
  })

  .post("/pedido", async (c) => {
    const body: BodyPostPedido = await c.req.json();
    if (!isBodyPostPedido(body)) {
      return c.json(
        buildApiResponse(null, false, "El formato del pedido es incorrecto"),
        { status: 400 },
      );
    }

    const { idFormaDePago, fecha, entradas } = body;

    if (idFormaDePago === 2) {
      let autorizacion: boolean;
      const { numeroTarjeta, fechaVencimiento, codigoSeguridad } = body;
      if ((codigoSeguridad as number) === 666) {
        autorizacion = obtenerAutorizacionMercadoPago(false);
      } else {
        autorizacion = obtenerAutorizacionMercadoPago(true);
      }
      if (!autorizacion) {
        return c.json(
          buildApiResponse(null, false, "Pago con tarjeta no autorizado"),
          { status: 402 },
        );
      }
    }

    let pedidoADevolver: Pedido | null = null;

    let total = 0;

    for (const entrada of entradas) {
      total += entrada.precio;
    }

    const pedido: Pedido = await guardarPedidoDeVisita(
      db,
      1,
      idFormaDePago,
      fecha,
      total,
    );

    pedidoADevolver = pedido;

    for (const entrada of entradas) {
      const nuevaEntrada = await guardarEntradasReferidasAPedido(
        db,
        pedido.idPedido,
        entrada.tipoEntradaId,
        entrada.edadVisitante,
        entrada.precio,
      );
      pedidoADevolver.entradas.push(nuevaEntrada);
    }

    return c.json(
      buildApiResponse(pedidoADevolver, true, "Objetos creados con exito"),
      { status: 201 },
    );
  });

export default app;
