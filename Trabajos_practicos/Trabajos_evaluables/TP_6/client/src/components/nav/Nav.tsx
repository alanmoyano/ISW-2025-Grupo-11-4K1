// @ts-expect-error
import React, { useContext } from "react";
import { Link } from "@tanstack/react-router";
import { ThemesContext } from "../themesContext";

export default function Nav() {
  const { theme } = useContext(ThemesContext);
  return (
    <nav
      className="fixed top-0 left-0 w-full bg-white shadow-md z-50"
      style={{ backgroundColor: theme.colors.verdePigmento }}
    >
      <div className="flex justify-between items-center p-4">
        <Link to="/" className="text-lg font-semibold hover:underline">
          Home
        </Link>
        <Link to="/boleteria" className="text-lg font-semibold hover:underline">
          Boletería
        </Link>
      </div>
    </nav>
  );
}
