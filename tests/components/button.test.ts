// @vitest-environment happy-dom
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Button from "../../src/components/Button.svelte";
import { textSnippet } from "./text-snippet";

describe("Button", () => {
  it("handles activation and disabled behavior", async () => {
    const user = userEvent.setup();
    const onclick = vi.fn();
    const rendered = render(Button, {
      props: {
        children: textSnippet("Connect"),
        onclick,
      },
    });

    await user.click(screen.getByRole("button", { name: "Connect" }));
    expect(onclick).toHaveBeenCalledOnce();

    await rendered.rerender({
      children: textSnippet("Connect"),
      onclick,
      disabled: true,
    });
    await user.click(screen.getByRole("button", { name: "Connect" }));
    expect(onclick).toHaveBeenCalledOnce();
  });

  it("renders links as anchors", () => {
    render(Button, {
      props: {
        children: textSnippet("Create app"),
        href: "https://example.com/create",
        external: true,
      },
    });

    const link = screen.getByRole("link", { name: /Create app/ });
    expect(link.getAttribute("href")).toBe(
      "https://example.com/create",
    );
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });
});
