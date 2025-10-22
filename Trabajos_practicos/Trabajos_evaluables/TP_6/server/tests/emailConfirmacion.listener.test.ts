// eslint-disable-next-line import-x/no-unresolved
import { test, expect, spyOn, beforeAll, afterAll, afterEach } from "bun:test";
// eslint-disable-next-line import-x/no-unresolved
import { Database } from "bun:sqlite";
import type { Pedido } from "@shared/types";
import initDatabase from "@server/dbDefinition";
import eventDispatcher from "@server/eventDispatcher";
import SimulatedNotificacionService from "@server/notificaciones/simulated-notificacion.service";
import EnviarEmailConfirmacionListener from "@server/notificaciones/enviar-email-confirmacion.listener";

let db: Database;
let notificacionService: SimulatedNotificacionService;
let emailListener: EnviarEmailConfirmacionListener;

beforeAll(() => {
  db = new Database(":memory:");
  initDatabase(db);

  notificacionService = new SimulatedNotificacionService({ silent: true }); // true para no imprimir en consola
  emailListener = new EnviarEmailConfirmacionListener(db, notificacionService);
  emailListener.setup();
});

afterAll(() => {
  db.close();
});

afterEach(() => {
  eventDispatcher.removeAllListeners();
  spyOn(notificacionService, "enviar").mockRestore();
});

test("El listener debe enviar un email al recibir un 'pedido:generado'", async () => {
  const spyEnviar = spyOn(notificacionService, "enviar");

  const fakePedido: Pedido = {
    idPedido: 123,
    usuarioId: 1,
    idFormaDePago: 1,
    fecha: "2025-12-01",
    total: 7500,
    entradas: [
      {
        id: 1,
        tipoEntradaId: 1,
        edadVisitante: 30,
        precio: 5000,
        utilizada: false,
        pedidoId: 123,
      },
      {
        id: 2,
        tipoEntradaId: 1,
        edadVisitante: 8,
        precio: 2500,
        utilizada: false,
        pedidoId: 123,
      },
    ],
  };

  eventDispatcher.dispatch("pedido:generado", fakePedido);
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

  expect(spyEnviar).toHaveBeenCalledTimes(1);

  expect(spyEnviar).toHaveBeenCalledWith(
    "example@mail.com",
    expect.stringContaining("Confirmación de tu Pedido #123"),
    expect.stringContaining("Monto Total: $7500"),
  );

  const cuerpoEmail = spyEnviar.mock.calls[0]?.[2];

  expect(cuerpoEmail).toContain("Visitante 1: Regular (Edad: 30)");
  expect(cuerpoEmail).toContain("Visitante 2: Regular (Edad: 8)");
});
