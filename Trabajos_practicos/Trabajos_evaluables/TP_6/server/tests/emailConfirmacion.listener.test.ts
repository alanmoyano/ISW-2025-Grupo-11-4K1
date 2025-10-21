import { test, expect, spyOn, beforeAll, afterAll, afterEach } from "bun:test";
import { initDatabase } from "../src/dbDefinition";
// 1. Volvemos a usar la librería nativa de Bun
import { Database } from "bun:sqlite";
import type { Pedido } from "@shared/types";
import { eventDispatcher } from "../src/eventDispatcher";
import { SimulatedNotificacionService } from "../src/notificaciones/simulated-notificacion.service";
import { EnviarEmailConfirmacionListener } from "../src/notificaciones/enviar-email-confirmacion.listener";

let db: Database;
let notificacionService: SimulatedNotificacionService;
let emailListener: EnviarEmailConfirmacionListener;

// beforeAll: Se ejecuta una vez antes de todas las pruebas
beforeAll(() => {
  // 2. Usamos el constructor de 'bun:sqlite'
  db = new Database(":memory:");
  initDatabase(db); // Esto ahora inserta el usuario 1

  notificacionService = new SimulatedNotificacionService();
  emailListener = new EnviarEmailConfirmacionListener(db, notificacionService);
  emailListener.setup();
});

afterAll(() => {
  db.close();
});

afterEach(() => {
  eventDispatcher.removeAllListeners();
  // 3. Restauramos el mock usando la API de bun:test
  spyOn(notificacionService, "enviar").mockRestore();
});

test("El listener debe enviar un email al recibir un 'pedido:generado'", async () => {
  // 4. Usamos spyOn de 'bun:test'
  const spyEnviar = spyOn(notificacionService, "enviar");

  const fakePedido: Pedido = {
    idPedido: 123,
    usuarioId: 1, // Asegúrate que tu initDatabase inserte este ID
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
  await new Promise((resolve) => setTimeout(resolve, 0));

  expect(spyEnviar).toHaveBeenCalledTimes(1);

  // Asegúrate que el email coincida con el que insertas en initDatabase
  expect(spyEnviar).toHaveBeenCalledWith(
    "example@mail.com", // O 'example@mail.com' si lo cambiaste
    expect.stringContaining("Confirmación de tu Pedido #123"),
    expect.stringContaining("Monto Total: $7500")
  );

  // 5. Verifica los 'TipoID' según tu lógica de construcción de email
  // (Esta parte puede fallar si cambiaste 'TipoID: 1' por 'Regular')
  expect(spyEnviar.mock.calls[0][2]).toContain("Visitante 1: Regular (Edad: 30)");
  expect(spyEnviar.mock.calls[0][2]).toContain("Visitante 2: Regular (Edad: 8)");
});