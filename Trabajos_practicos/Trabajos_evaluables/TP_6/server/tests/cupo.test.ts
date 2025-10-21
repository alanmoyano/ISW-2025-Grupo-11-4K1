import { test, expect, describe } from "vitest";
import { validarDisponibilidadCupo } from "../src/entradasValidation";

describe("validarDisponibilidadCupo", () => {
  const fechaPrueba = "2025-11-20";

  test("debe devolver true si hay cupo suficiente", async () => {
    const fetcherMock = async (fecha: string) => 90;
    
    const tieneCupo = await validarDisponibilidadCupo(fechaPrueba, 5, fetcherMock);
    
    expect(tieneCupo).toBe(true);
  });

  test("debe devolver false si la cantidad solicitada excede el cupo", async () => {
    const fetcherMock = async (fecha: string) => 98;
    
    const tieneCupo = await validarDisponibilidadCupo(fechaPrueba, 3, fetcherMock);
    
    expect(tieneCupo).toBe(false);
  });

  test("debe devolver true si se solicita el cupo exacto restante", async () => {
    const fetcherMock = async (fecha: string) => 80;
    
    const tieneCupo = await validarDisponibilidadCupo(fechaPrueba, 20, fetcherMock);
    
    expect(tieneCupo).toBe(true);
  });

  test("debe devolver false si se solicitan 0 entradas", async () => {
    const fetcherMock = async (fecha: string) => 50;
    
    const tieneCupo = await validarDisponibilidadCupo(fechaPrueba, 0, fetcherMock);
    
    expect(tieneCupo).toBe(false);
  });
});