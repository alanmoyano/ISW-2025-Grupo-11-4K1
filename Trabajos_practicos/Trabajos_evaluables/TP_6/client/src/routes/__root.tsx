// @ts-expect-error
import React from "react";

import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Nav from "../components/nav/Navbar";

// eslint-disable-next-line
export const Route = createRootRoute({
  component: () => (
    <>
      <Nav />

      <div className="pt-16">
        {" "}
        {/* si tu Nav tiene altura fija, agregá padding */}
        <Outlet />
      </div>

      <TanStackRouterDevtools />
    </>
  ),
});
