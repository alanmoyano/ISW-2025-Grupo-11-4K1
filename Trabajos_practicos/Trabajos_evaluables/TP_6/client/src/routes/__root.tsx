// src/routes/__root.tsx
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Nav } from "@/components/nav/Nav";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
// @ts-expect-error
import React from "react";

export const Route = createRootRoute({
  component: () => (
    <>
      <Nav isMobile={false} />

      <div className="pt-16"> {/* si tu Nav tiene altura fija, agregá padding */}
        <Outlet />
      </div>

      <TanStackRouterDevtools />
    </>
  ),
});
