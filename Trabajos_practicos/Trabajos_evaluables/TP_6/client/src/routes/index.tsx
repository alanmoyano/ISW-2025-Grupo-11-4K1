import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error
import React from "react";

// eslint-disable-next-line
import Nav from "@/components/nav/Nav";

export default function MainPage() {
  return (
    <>
      <Nav />
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
