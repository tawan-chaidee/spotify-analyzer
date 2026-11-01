// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../../src/components/button";

describe("Button", () => {
  it("handles activation and disabled behavior", async () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <Button onClick={onClick}>Connect</Button>,
    );

    await userEvent.click(screen.getByText("Connect"));
    expect(onClick).toHaveBeenCalledOnce();

    rerender(
      <Button onClick={onClick} disabled>
        Connect
      </Button>,
    );
    await userEvent.click(screen.getByText("Connect"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
