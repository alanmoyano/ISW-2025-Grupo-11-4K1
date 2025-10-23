// src/hooks/useFormasDePago.ts
import { useState, useEffect } from 'react';

export interface FormaDePago {
  id: number;
  nombre: string;
}

export interface FormasDePagoResponse {
  data: FormaDePago[];
  success: boolean;
}

export function useFormasDePago() {
  const [formasDePago, setFormasDePago] = useState<FormaDePago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFormasDePago = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/formasDePago');
        const data: FormasDePagoResponse = await response.json();
        
        if (data.success) {
          setFormasDePago(data.data);
        } else {
          setError('Error al cargar formas de pago');
        }
      } catch (err) {
        setError('Error de conexión al cargar formas de pago');
      } finally {
        setLoading(false);
      }
    };

    fetchFormasDePago();
  }, []);

  return { formasDePago, loading, error };
}