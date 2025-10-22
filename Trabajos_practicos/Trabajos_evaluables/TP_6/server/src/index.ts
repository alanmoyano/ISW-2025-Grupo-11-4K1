import { buildApiResponse, isBodyPostPedido } from "@shared/utils";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { BodyPostPedido, Entrada, Pedido } from "@shared/types";
import {
  guardarEntradasReferidasAPedido,
  guardarPedidoDeVisita,
  obtenerFormasDePago,
  obtenerTiposDeEntrada,
  obtenerCantidadEntradasVendidasPorFecha,
} from "./dbAccess";
import initDatabase from "./dbDefinition";
import {
  calcularPrecioTotal,
  obtenerAutorizacionMercadoPago,
} from "./precioUtils";
import {
  validarCantidadEntradas,
  validarFechaVisita,
  validarDisponibilidadCupo,
} from "./entradasValidation";
import eventDispatcher from "./eventDispatcher";
import SimulatedNotificacionService from "./notificaciones/simulated-notificacion.service";
import EnviarEmailConfirmacionListener from "./notificaciones/enviar-email-confirmacion.listener";

const db = initDatabase();

const notificacionService = new SimulatedNotificacionService(); // { silent: true } para no imprimir en consola
const emailListener = new EnviarEmailConfirmacionListener(
  db,
  notificacionService,
);
emailListener.setup();

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

    // eslint-disable-next-line consistent-return
    entradas.forEach((entrada) => {
      if (entrada.edadVisitante < 0 || entrada.edadVisitante > 110) {
        return c.json(
          buildApiResponse(
            null,
            false,
            `La edad '${entrada.edadVisitante}' no es válida.`,
          ),
          { status: 400 },
        );
      }
    });

    // Validamos que, de usar una tarjeta para pagar, el pago sea autorizado por mercado pago
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

    // Validamos que la fecha ingresada se encuentre disponible segun las reglas de negocio
    // (Con maximo 2 dias de antelacion, no feriados, no lunes, cupo maximo diario)

    if (!validarFechaVisita(fecha)) {
      return c.json(
        buildApiResponse(
          null,
          false,
          "La fecha de visita no cumple con las condiciones de reserva",
        ),
        { status: 400 },
      );
    }

    // Validacion de cupos
    const cantidadSolicitada = body.entradas.length;
    const fetcherEntradasVendidas = (f: string) =>
      obtenerCantidadEntradasVendidasPorFecha(db, f);

    const tieneCupo = await validarDisponibilidadCupo(
      fecha,
      cantidadSolicitada,
      fetcherEntradasVendidas,
    );

    if (!tieneCupo) {
      return c.json(
        buildApiResponse(
          null,
          false,
          "No hay cupo disponible para la fecha seleccionada.",
        ),
        { status: 400 },
      );
    }

    // Validamos que la cantidad de entradas solicitadas no supere el cupo maximo por compra
    const arrayValidadorEntradas: Entrada[] = [];
    let totalPedido = 0;
    entradas.forEach((entrada) => {
      const entradadValidadora: Entrada = {
        id: 0,
        tipoEntradaId: entrada.tipoEntradaId,
        edadVisitante: entrada.edadVisitante,
        precio: 0,
        utilizada: false,
        pedidoId: 0,
      };
      arrayValidadorEntradas.push(entradadValidadora);
    });

    totalPedido += calcularPrecioTotal(arrayValidadorEntradas);

    if (!validarCantidadEntradas(arrayValidadorEntradas)) {
      return c.json(
        buildApiResponse(
          null,
          false,
          "Se excede la cantidad maxima de entradas por pedido",
        ),
        { status: 400 },
      );
    }

    const pedido: Pedido = await guardarPedidoDeVisita(
      db,
      1,
      idFormaDePago,
      fecha,
      totalPedido,
    );

    pedidoADevolver = pedido;

    await Promise.all(
      entradas.map(async (entrada) => {
        const nuevaEntrada = await guardarEntradasReferidasAPedido(
          db,
          pedido.idPedido,
          entrada.tipoEntradaId,
          entrada.edadVisitante,
        );
        pedidoADevolver.entradas.push(nuevaEntrada);
      }),
    );

    // Disparador de evento para notificaciones
    eventDispatcher.dispatch("pedido:generado", pedidoADevolver);

    return c.json(
      buildApiResponse(pedidoADevolver, true, "Objetos creados con exito"),
      { status: 201 },
    );
  });

export default app;
