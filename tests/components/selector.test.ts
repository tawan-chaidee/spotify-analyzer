// @vitest-environment happy-dom
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Selector from "../../src/components/Selector.svelte";

describe("Selector", () => {
  it("returns the selected value", async () => {
    const user = userEvent.setup();
    const onchange = vi.fn();
    render(Selector, {
      props: {
        label: "Content type",
        value: "tracks",
        options: [
          { value: "tracks", label: "Tracks" },
          { value: "artists", label: "Artists" },
        ],
        onchange,
      },
    });

    await user.click(screen.getByText("Artists"));
    expect(onchange).toHaveBeenCalledWith("artists");
  });
});
