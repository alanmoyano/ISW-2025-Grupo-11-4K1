import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: MainPage,
});

export default function MainPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1>
        Aquí iría el contenido de la página principal, si tan solo tuviera una
        😭
      </h1>
    </div>
  );
}
