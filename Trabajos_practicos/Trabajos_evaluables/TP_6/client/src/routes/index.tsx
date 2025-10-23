//index.tsx
import { useMediaQuery } from "@mui/material";
import { Nav } from "@/components/nav/Nav";
import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error
import React from "react";

export default function MainPage() {
  const isMobile = useMediaQuery("(max-width:768px)");
  return (
    <>
      <Nav isMobile={false}>
      </Nav>
      <div className="flex flex-col items-center justify-center h-screen">
        <h1>
          Aquí iría el contenido de la página principal, si tan solo tuviera una
        😭
        </h1>
      </div>
    </>
  );
}

export const Route = createFileRoute("/")({
  component: MainPage,
});
