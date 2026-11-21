// @vitest-environment happy-dom
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DropdownSelect from "../../src/ui/components/DropdownSelect.svelte";

function mockViewport(isMobile: boolean) {
  vi.spyOn(window, "matchMedia").mockReturnValue({
    matches: isMobile,
    media: "(max-width: 639px)",
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
}

const props = {
  label: "Playlist access",
  value: "all",
  options: [
    { value: "all", label: "All" },
    { value: "owned", label: "Owned" },
  ],
  onchange: vi.fn(),
};

describe("DropdownSelect", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("uses a bottom sheet by default on mobile", async () => {
    mockViewport(true);
    const user = userEvent.setup();
    render(DropdownSelect, { props });

    await user.click(
      screen.getByRole("button", { name: "Playlist access: All" }),
    );

    expect(
      screen.getByRole("dialog", { name: "Playlist access" }),
    ).toBeTruthy();
  });

  it("can use a popover on mobile instead of a bottom sheet", async () => {
    mockViewport(true);
    const user = userEvent.setup();
    render(DropdownSelect, {
      props: {
        ...props,
        mobilePresentation: "popover",
      },
    });

    await user.click(
      screen.getByRole("button", { name: "Playlist access: All" }),
    );

    expect(
      screen.queryByRole("dialog", { name: "Playlist access" }),
    ).toBeNull();
    expect(
      screen.getByRole("option", { name: "Owned" }),
    ).toBeTruthy();
  });
});
