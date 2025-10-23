// src/hooks/useTipoEntradas.ts
import { useState, useEffect } from "react";

export interface TipoEntrada {
  id: number;
  nombre: string;
  precio: number;
}

export interface TipoEntradasResponse {
  data: TipoEntrada[];
  success: boolean;
}

export function useTipoEntradas() {
  const [tipoEntradas, setTipoEntradas] = useState<TipoEntrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTipoEntradas = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/tipoEntradas");
        const data: TipoEntradasResponse = await response.json();

        if (data.success) {
          setTipoEntradas(data.data);
        } else {
          setError("Error al cargar tipos de entrada");
        }
      } catch (err) {
        setError("Error de conexión al cargar tipos de entrada");
      } finally {
        setLoading(false);
      }
    };

    fetchTipoEntradas();
  }, []);

  return { tipoEntradas, loading, error };
}
