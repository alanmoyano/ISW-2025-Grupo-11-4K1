import type { INotificacionService } from "./notificacion.service";

export class SimulatedNotificacionService implements INotificacionService {
  
  public async enviar(destinatario: string, asunto: string, cuerpo: string): Promise<void> {
    console.log("===================================");
    console.log("=== ENVÍO DE EMAIL ===");
    console.log(`Para: ${destinatario}`);
    console.log(`Asunto: ${asunto}`);
    console.log("--- Cuerpo ---");
    console.log(cuerpo);
    console.log("===================================");
    
    return Promise.resolve();
  }
}