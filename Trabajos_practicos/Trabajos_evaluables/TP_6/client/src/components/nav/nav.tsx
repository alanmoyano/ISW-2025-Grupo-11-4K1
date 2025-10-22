import { useContext } from "react";
import { ThemesContext } from "../ThemesContext";
import { Link } from "@tanstack/react-router";

interface NavProps {
    isMobile: boolean;
}
export function Nav({ isMobile }: NavProps) {
const {theme} = useContext(ThemesContext);
    return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50" style={{ backgroundColor: theme.colors.verdePigmento }}>
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