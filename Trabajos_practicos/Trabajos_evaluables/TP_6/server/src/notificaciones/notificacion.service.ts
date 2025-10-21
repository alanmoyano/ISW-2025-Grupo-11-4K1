export interface INotificacionService {
  enviar(destinatario: string, asunto: string, cuerpo: string): Promise<void>;
}