import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import Understand from "@/pages/Understand";
import Assess from "@/pages/Assess";
import { useSession } from "@/state/session";
import { SessionProvider } from "@/state/SessionProvider";

type Page = "understand" | "assess";

/** Reads the shared scenario so persistence is observable without the page UI. */
function ScenarioProbe() {
  const { state } = useSession();
  return (
    <p>
      Probe migration duration: <span data-testid="probe-duration">{state.scenario.migrationDurationMonths}</span>
    </p>
  );
}

/**
 * Keeps one SessionProvider mounted above the routed page while the page
 * underneath unmounts and remounts. This is the session-level stand-in for a
 * full-app route change (BrowserRouter needs a real DOM history).
 */
function Harness({ page }: { page: Page }) {
  return (
    <SessionProvider>
      <MemoryRouter initialEntries={["/understand"]}>
        <ScenarioProbe />
        {page === "understand" ? <Understand /> : <Assess />}
      </MemoryRouter>
    </SessionProvider>
  );
}

function firstLedgerRow() {
  const table = screen.getByRole("region", { name: "Item-by-item table" });
  return within(table).getAllByRole("row")[1];
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe("session continuity across pages", () => {
  it("keeps a changed scenario assumption across page unmount and remount", () => {
    const { rerender } = render(<Harness page="understand" />);

    // Default assumption reaches the probe.
    expect(screen.getByTestId("probe-duration")).toHaveTextContent("24");

    // Change the assumption on the Understand page.
    fireEvent.change(screen.getByLabelText("Migration duration"), { target: { value: "0" } });
    expect(screen.getByTestId("probe-duration")).toHaveTextContent("0");
    expect(firstLedgerRow()).toHaveTextContent("Hybrid");

    // Leave the page (it unmounts) for the worksheet; the provider stays mounted.
    rerender(<Harness page="assess" />);
    expect(screen.getByRole("heading", { name: "Record what you know, and what you do not" })).toBeInTheDocument();
    expect(screen.getByTestId("probe-duration")).toHaveTextContent("0");

    // Return to the lesson: a fresh mount derives from the changed assumption.
    rerender(<Harness page="understand" />);
    expect(screen.getByTestId("probe-duration")).toHaveTextContent("0");
    expect(screen.getByLabelText("Migration duration (months)")).toHaveValue(0);
    expect(firstLedgerRow()).toHaveTextContent("Hybrid");
    expect(firstLedgerRow()).not.toHaveTextContent("Classical");
  });
});
