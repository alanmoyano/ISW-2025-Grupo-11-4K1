import type { INotificacionService } from "./notificacion.service";

export default class SimulatedNotificacionService
  implements INotificacionService
{
  private silent: boolean;

  constructor(options: { silent: boolean } = { silent: false }) {
    this.silent = options.silent;
  }

  public async enviar(
    destinatario: string,
    asunto: string,
    cuerpo: string,
  ): Promise<void> {
    if (!this.silent) {
      console.log("===================================");
      console.log("=== ENVÍO DE EMAIL ===");
      console.log(`Para: ${destinatario}`);
      console.log(`Asunto: ${asunto}`);
      console.log("--- Cuerpo ---");
      console.log(cuerpo);
      console.log("===================================");
    }

    return Promise.resolve();
  }
}
