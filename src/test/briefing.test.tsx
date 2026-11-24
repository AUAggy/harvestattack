import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useEffect, useState, type ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import Share from "@/pages/Share";
import { emptyFlow, useSession } from "@/state/session";
import { SessionProvider } from "@/state/SessionProvider";

const FLOW_LABEL = "Backup sync to cold storage";
const FLOW_OWNER = "Platform Team";

/** Dispatches a seeded flow into the session, then renders the page. */
function SeedThenRender({ children }: { children: ReactNode }) {
  const { dispatch } = useSession();
  const seeded = useSeeded(dispatch);
  return seeded ? <>{children}</> : null;
}

function useSeeded(dispatch: ReturnType<typeof useSession>["dispatch"]): boolean {
  const [seeded, setSeeded] = useState(false);
  useEffect(() => {
    const flow = emptyFlow();
    flow.label = FLOW_LABEL;
    flow.owner = FLOW_OWNER;
    flow.scope = "Backup agent to archive via gateway";
    dispatch({ type: "add-flow", asset: flow });
    setSeeded(true);
  }, [dispatch]);
  return seeded;
}

function renderShare() {
  return render(
    <SessionProvider>
      <MemoryRouter initialEntries={["/share"]}>
        <SeedThenRender>
          <Share />
        </SeedThenRender>
      </MemoryRouter>
    </SessionProvider>,
  );
}

function previewText(container: HTMLElement): string {
  const pre = container.querySelector("pre");
  if (!pre) throw new Error("Preview pre element not found");
  return pre.textContent ?? "";
}

function generatePreview() {
  fireEvent.click(screen.getByRole("button", { name: "Generate preview" }));
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  delete (navigator as unknown as { clipboard?: unknown }).clipboard;
});

describe("Share briefing", () => {
  it("builds a preview containing the flow label and the did-not-observe scope statement", () => {
    const { container } = renderShare();

    expect(screen.getByText(FLOW_LABEL)).toBeInTheDocument(); // selection rail entry

    generatePreview();
    const text = previewText(container);
    expect(text).toContain(FLOW_LABEL);
    expect(text).toContain("did not observe");
  });

  it("replaces every owner with [redacted] when Redact owners is selected", () => {
    const { container } = renderShare();

    generatePreview();
    expect(previewText(container)).toContain(FLOW_OWNER);

    fireEvent.click(screen.getByRole("checkbox", { name: /Redact owners/ }));
    // Selection changed: the old preview is stale until it is regenerated.
    expect(screen.getByText(/Settings changed\. Regenerate the preview\./)).toBeInTheDocument();

    generatePreview();
    const text = previewText(container);
    expect(text).not.toContain(FLOW_OWNER);
    expect(text).toContain("[redacted]");
  });

  it("reports a visible failure and no success message when the clipboard write is denied", async () => {
    const { container } = renderShare();
    generatePreview();
    expect(previewText(container)).toContain(FLOW_LABEL);

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockRejectedValue(new DOMException("denied", "NotAllowedError")),
      },
    });

    const copyButton = screen.getByRole("button", { name: "Copy to clipboard" });
    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(await screen.findByText(/Clipboard permission was denied|The clipboard write failed/)).toBeInTheDocument();
    expect(screen.queryByText(/Copied the .* brief/)).not.toBeInTheDocument();
  });
});
