import { createRawSnippet } from "svelte";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function textSnippet(value: string) {
  return createRawSnippet(() => ({
    render: () => `<span>${escapeHtml(value)}</span>`,
  }));
}
