// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Selector } from "../../src/components/selector";

describe("Selector", () => {
  it("returns the selected value", async () => {
    const onChange = vi.fn();
    render(
      <Selector
        label="Content type"
        value="tracks"
        options={[
          { value: "tracks", label: "Tracks" },
          { value: "artists", label: "Artists" },
        ]}
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByText("Artists"));
    expect(onChange).toHaveBeenCalledWith("artists");
  });
});
