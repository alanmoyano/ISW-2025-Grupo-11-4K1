import type { Pedido } from "@shared/types";

// Tipos de eventos y sus payloads
type EventMap = {
  "pedido:generado": (pedido: Pedido) => void;
};
type EventName = keyof EventMap;

class EventDispatcher {
  private listeners: { [K in EventName]?: Array<EventMap[K]> } = {};

  on<E extends EventName>(eventName: E, listener: EventMap[E]) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName]!.push(listener);
  }

  // Metodo para disparar un evento
  dispatch<E extends EventName>(eventName: E, ...args: Parameters<EventMap[E]>) {
    const eventListeners = this.listeners[eventName];
    if (!eventListeners) {
      return;
    }

    eventListeners.forEach((listener) => {
      try {
        // @ts-ignore
        listener(...args);
      } catch (error) {
        console.error(`Error al ejecutar listener para ${eventName}:`, error);
      }
    });
  }
}

// Exportacion Singleton 
export const eventDispatcher = new EventDispatcher();