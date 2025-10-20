import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom", // para renderizar los componentes en un simulated dom (y probar el JSX)
    setupFiles: "./src/setupTests.ts",
    globals: true,
  },
});
