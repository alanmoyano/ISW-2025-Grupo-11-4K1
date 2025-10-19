import { screen, render } from "@testing-library/react";
import { test, expect } from "vitest";

function MyComponent() {
    return (
        <div data-testid="my-component">My Component</div>
    )
}

// test de manipulación del DOM (sin react)
test("set button text", () => {
  document.body.innerHTML = `<button>My button</button>`;
  const button = document.querySelector("button");
  expect(button?.innerText).toEqual("My button");
});

// test usando RTL
test("Can use Testing Library", () => {
  render(<MyComponent />);
  const myComponent = screen.getByTestId("my-component");
  expect(myComponent).toBeInTheDocument();
});
