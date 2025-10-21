import type Database from "bun:sqlite";
import type { Pedido } from "@shared/types";
import { eventDispatcher } from "../eventDispatcher";
import { obtenerUsuarioPorId, guardarEmailEnviado } from "../dbAccess";
import type { INotificacionService } from "./notificacion.service";

export class EnviarEmailConfirmacionListener {
  constructor(
    private readonly db: Database,
    private readonly notificacionService: INotificacionService,
  ) {}

  public setup() {
    eventDispatcher.on(
      "pedido:generado",
      this.handlePedidoGenerado.bind(this),
    );
  }

  private async handlePedidoGenerado(pedido: Pedido) {
    console.log("Listener: Evento 'pedido:generado' recibido.", pedido.idPedido);
    try {
      const usuario = await obtenerUsuarioPorId(this.db, pedido.usuarioId);
      if (!usuario || !usuario.email) {
        console.error(`Email no encontrado para usuarioId: ${pedido.usuarioId}`);
        return;
      }

      const cuerpoEmail = this.construirCuerpoEmail(pedido);
      const asunto = `Confirmación de tu Pedido #${pedido.idPedido}`;

      await this.notificacionService.enviar(usuario.email, asunto, cuerpoEmail);

      await guardarEmailEnviado(
        this.db,
        pedido.idPedido,
        usuario.email,
        asunto,
        cuerpoEmail
      );
      
    } catch (error) {
      console.error("Error en EnviarEmailConfirmacionListener:", error);
    }
  }

  private construirCuerpoEmail(pedido: Pedido): string {

    const formaPagoNombres = {
      1: "Efectivo",
      2: "Tarjeta",
    };
    
    const tipoEntradaNombres = {
      1: "Regular",
      2: "VIP",
      3: "Menor",
    };
    
    const detallesEntradas = pedido.entradas
      .map((e, index) => {
        const nombreTipoEntrada =
          tipoEntradaNombres[e.tipoEntradaId as keyof typeof tipoEntradaNombres] ||
          `TipoID ${e.tipoEntradaId}`; 
          
        return `        - Visitante ${index + 1}: ${nombreTipoEntrada} (Edad: ${e.edadVisitante}) - $${e.precio}`;
      })
      .join("\n");

    const nombreFormaDePago =
      formaPagoNombres[pedido.idFormaDePago as keyof typeof formaPagoNombres] ||
      `ID ${pedido.idFormaDePago}`;

    return `
      ¡Gracias por tu compra!
      
      Resumen de tu Pedido:
      ------------------------
      Código de Operación: ${pedido.idPedido}
      Fecha de Visita: ${pedido.fecha}
      Forma de Pago: ${nombreFormaDePago}
      
      Entradas:
${detallesEntradas}
      
      Monto Total: $${pedido.total}
    `;
  }
}