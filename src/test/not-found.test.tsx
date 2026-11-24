import { cleanup, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import App from "@/App";

afterEach(cleanup);

describe("not-found route", () => {
  it("renders inside the site layout, within a main landmark", () => {
    // BrowserRouter reads the real location, so set it instead of wrapping App in a MemoryRouter.
    window.history.pushState({}, "", "/no-such-page");

    render(<App />);

    const main = screen.getByRole("main");
    expect(within(main).getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    expect(within(main).getByRole("link", { name: "Back to the home page" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
  });
});
