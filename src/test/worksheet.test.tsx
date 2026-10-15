import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import Assess from "@/pages/Assess";
import { SessionProvider, useSession } from "@/state/session";

/** Shows what the session actually recorded, so action creation is observable. */
function ActionsProbe() {
  const { state } = useSession();
  return (
    <section aria-label="Session actions probe">
      <p>Actions recorded: {state.actions.length}</p>
      {state.actions.map((action) => (
        <p key={action.localId}>{action.text}</p>
      ))}
    </section>
  );
}

function renderWorksheet() {
  return render(
    <SessionProvider>
      <MemoryRouter initialEntries={["/assess"]}>
        <ActionsProbe />
        <Assess />
      </MemoryRouter>
    </SessionProvider>,
  );
}

function probe() {
  return within(screen.getByRole("region", { name: "Session actions probe" }));
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe("Assess worksheet", () => {
  it("treats an all-unknown record as evidence to collect, never as a score", () => {
    renderWorksheet();

    fireEvent.click(screen.getByRole("button", { name: "New confidentiality flow" }));

    // The record exists with everything blank; the suggestion names the next evidence.
    expect(screen.getByText(/Untitled confidentiality flow/)).toBeInTheDocument();
    expect(screen.getByText(/Collect negotiation evidence/)).toBeInTheDocument();
  });

  it("never renders a risk score, readiness score, or percent-ready figure", () => {
    const { container } = renderWorksheet();
    fireEvent.click(screen.getByRole("button", { name: "New confidentiality flow" }));

    const text = `${container.textContent ?? ""} ${document.body.textContent ?? ""}`;
    expect(text).not.toMatch(/risk score/i);
    expect(text).not.toMatch(/% ready/i);
    expect(text).not.toMatch(/readiness score/i);
  });

  it("offers the private-PKI path with requirement form fields", () => {
    renderWorksheet();

    fireEvent.click(screen.getByRole("radio", { name: /Review a private CA or PKI use case/ }));
    expect(screen.getByRole("button", { name: "New PKI review" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "New PKI review" }));
    fireEvent.click(screen.getByRole("button", { name: "Add requirement" }));

    expect(screen.getByLabelText(/Authority or internal policy/)).toBeInTheDocument();
    expect(screen.getByLabelText("Applicability")).toBeInTheDocument();
  });

  it("creates a session action from a suggestion's Add as action", () => {
    renderWorksheet();

    fireEvent.click(screen.getByRole("button", { name: "New confidentiality flow" }));

    const suggestion = screen.getByText(/Collect negotiation evidence/).closest("li");
    if (!suggestion) throw new Error("Suggestion list item not found");
    fireEvent.click(within(suggestion as HTMLElement).getByRole("button", { name: "Add as action" }));

    // The button flips to its added state and the action is in the session.
    expect(suggestion).toHaveTextContent("Added to actions");
    expect(probe().getByText("Actions recorded: 1")).toBeInTheDocument();
    expect(probe().getByText(/Collect negotiation evidence/)).toBeInTheDocument();
  });
});
