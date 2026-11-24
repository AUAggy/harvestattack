/**
 * Browser adapters. These functions run only in event
 * handlers or effects, never during render. Clipboard success is reported only
 * after the write resolves; failures are returned, not swallowed.
 */

export interface CopyResult {
  ok: boolean;
  error?: string;
}

export async function copyText(text: string): Promise<CopyResult> {
  try {
    if (!("clipboard" in navigator) || !navigator.clipboard) {
      return { ok: false, error: "Clipboard is not available in this browser." };
    }
    await navigator.clipboard.writeText(text);
    return { ok: true };
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    const message =
      name === "NotAllowedError"
        ? "Clipboard permission was denied. Select the text below and copy it manually."
        : "The clipboard write failed. Select the text below and copy it manually.";
    return { ok: false, error: message };
  }
}

export interface DownloadResult {
  ok: boolean;
  error?: string;
}

export function downloadText(filename: string, text: string): DownloadResult {
  try {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    // Reclaim the object URL after the click has been processed.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { ok: true };
  } catch {
    return { ok: false, error: "The download failed. Copy the text instead." };
  }
}

/** True when the visitor asked for reduced motion. Safe at render time via matchMedia guard. */
export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}
