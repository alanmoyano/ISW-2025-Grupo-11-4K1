import { createContext } from "react";

export const ValoresContexto = {
  theme: {
    colors: {
      texto: "#000",
      azul: "#163660",
      azulOscuro: "#0e213b",
      gris: "#D9D9D9",
      grisOscuro: "#5c5c5c",
      grisClaro: "#f6f6f6",
      verdePakistani: "#134611",
      verdeIndia: "#3E8914",
      verdePigmento: "#3DA35D",
      verdeClaro: "#96E072",
      nyanza: "#E8FCCF",
      rojo: "#FF0000",
      rojoOscuro: "#8B0000",
    },
  },
};

export const ThemesContext = createContext({
  ...ValoresContexto,
});
