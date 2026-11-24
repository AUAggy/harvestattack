import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { deriveScenario, formatMonth } from "@/domain/model";
import Understand from "@/pages/Understand";
import { DEFAULT_SCENARIO } from "@/state/session";
import { SessionProvider } from "@/state/SessionProvider";

function renderLesson() {
  return render(
    <SessionProvider>
      <MemoryRouter initialEntries={["/understand"]}>
        <Understand />
      </MemoryRouter>
    </SessionProvider>,
  );
}

function ledgerTable() {
  return screen.getByRole("region", { name: "Item-by-item table" });
}

function firstDataRow() {
  const rows = within(ledgerTable()).getAllByRole("row");
  // Row 0 is the header row; the first cohort is transmitted at month 0 (Jan 2026).
  return rows[1];
}

function resultSentence(container: HTMLElement): string {
  // The first polite live region on the page is the stable result sentence.
  const p = container.querySelector("p[aria-live='polite']");
  if (!p) throw new Error("Result sentence paragraph not found");
  return p.textContent ?? "";
}

/** Patch the setup.ts matchMedia mock so reduced motion reports as enabled. */
function mockReducedMotion() {
  const original = window.matchMedia.bind(window);
  window.matchMedia = ((query: string) => ({
    ...original(query),
    matches: query.includes("prefers-reduced-motion"),
  })) as typeof window.matchMedia;
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("Understand lesson", () => {
  it("renders the teaching-example label and its scope sentence", () => {
    renderLesson();
    expect(screen.getByText("This is a teaching example.")).toBeInTheDocument();
    expect(
      screen.getByText(/Someone recording everything on this path is assumed, never observed\./),
    ).toBeInTheDocument();
  });

  it("states an overlap count that matches deriveScenario for the default assumptions", () => {
    const { container } = renderLesson();
    const expected = deriveScenario(DEFAULT_SCENARIO, 0).overlapCount;
    const noun = expected === 1 ? "1 example item sent before the migration must" : `${expected} example items sent before the migration must`;
    expect(resultSentence(container)).toContain(noun);
  });

  it("shows Hybrid protection for the earliest cohorts after an instant cutover", () => {
    renderLesson();
    // Default: migration duration 24, so month 0 traffic is classical.
    expect(firstDataRow()).toHaveTextContent("Classical");

    const slider = screen.getByLabelText("Migration duration");
    fireEvent.change(slider, { target: { value: "0" } });

    // Cutover month becomes 0, so every cohort at or after month 0 is hybrid.
    expect(screen.getByLabelText("Migration duration (months)")).toHaveValue(0);
    expect(firstDataRow()).toHaveTextContent("Hybrid");
    expect(firstDataRow()).not.toHaveTextContent("Classical");
  });

  it("renders the same cohort states with prefers-reduced-motion enabled", () => {
    const baseline = renderLesson();
    const baselineText = ledgerTable().textContent;
    const baselineFirstRow = firstDataRow().textContent;
    cleanup();

    mockReducedMotion();
    try {
      renderLesson();
      expect(window.matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(true);
      // Static check: the ledger derives identically; no animation is asserted.
      expect(ledgerTable().textContent).toBe(baselineText);
      expect(firstDataRow().textContent).toBe(baselineFirstRow);
      expect(firstDataRow()).toHaveTextContent("Classical");
    } finally {
      window.matchMedia = ((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
      })) as unknown as typeof window.matchMedia;
    }
  });

  it("plays with fake timers, stops on Pause, and leaves no interval behind", () => {
    vi.useFakeTimers();
    const { unmount } = renderLesson();
    const viewMonthInput = screen.getByLabelText("View month number");
    expect(viewMonthInput).toHaveValue(0);

    fireEvent.click(screen.getByRole("button", { name: "Play" }));

    act(() => {
      vi.advanceTimersByTime(2000); // Two 900 ms ticks: view month 0 -> 6 -> 12.
    });
    expect(viewMonthInput).toHaveValue(12);
    expect(formatMonth(12)).toBe("Jan 2027");

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000); // Wait well past the 900 ms interval.
    });
    expect(viewMonthInput).toHaveValue(12);
    expect(vi.getTimerCount()).toBe(0);

    unmount();
    // The interval was already cleared on Pause: nothing may restart it.
    expect(vi.getTimerCount()).toBe(0);
    expect(() => vi.advanceTimersByTime(10_000)).not.toThrow();
  });
});
