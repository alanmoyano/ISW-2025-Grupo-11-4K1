// @ts-expect-error
import React, { useContext } from "react";
import { Link } from "@tanstack/react-router";
import { ThemesContext } from "../ThemeContext";
// Importar la imagen del logo
import LogoPrincipal from "../../assets/logos/LogoPrincipal.png";

export default function Nav() {
  const { theme } = useContext(ThemesContext);

  // Clase para el texto en color blanco
  const textWhiteClass = "text-white";

  return (
    <nav
      className="fixed top-0 left-0 w-full shadow-md z-50"
      // Se eliminó 'bg-white' de className y se usa style para el color
      style={{ backgroundColor: theme.colors.verdePigmento }}
    >
      <div className="flex justify-between items-center p-4">
        {/* Reemplazar "Home" con la imagen del logo */}
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <img
            src={LogoPrincipal}
            alt="Logo Principal de la Empresa"
            className="h-12"
          />
        </Link>
        {/* Aplicar la clase 'text-white' al enlace de Boletería */}
        <Link
          to="/boleteria"
          className={`text-lg font-semibold hover:underline ${textWhiteClass}`}
        >
          Boletería
        </Link>
      </div>
    </nav>
  );
}
