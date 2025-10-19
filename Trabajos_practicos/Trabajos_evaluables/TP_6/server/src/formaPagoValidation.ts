export function validarLongitudNumeroTarjeta(numeroTarjeta: number): boolean {
  const numeroStr = numeroTarjeta.toString();

  if (numeroStr.length > 19 || numeroStr.length < 16) {
    return false;
  }
  return true;
}

export function validarAlgorimoLuhn(numeroTarjeta: number): boolean {
  const numeroStr = numeroTarjeta.toString();
  const numeroStrLimpio = numeroStr.replace(/\D/g, "");

  let suma = 0;
  let esPar = false;

  for (let i = numeroStrLimpio.length - 1; i >= 0; i--) {
    let digito = parseInt(numeroStrLimpio.charAt(i), 10);

    if (esPar) {
      digito *= 2;
    }
    if (digito > 9) {
      digito -= 9;
    }
    suma += digito;
    esPar = !esPar;
  }

  return suma % 10 === 0;
}
