// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConnectionCard } from "../../src/components/connection-card";

const props = {
  remember: true,
  redirectUri: "http://127.0.0.1:8000/callback",
  onRememberChange: vi.fn(),
  onConnect: vi.fn(),
};

describe("ConnectionCard", () => {
  it("shows loading text", () => {
    render(
      <ConnectionCard
        {...props}
        message="Loading"
        isError={false}
        busy
      />,
    );
    expect(screen.getByText("Connecting…")).toBeTruthy();
  });

  it("shows error text", () => {
    render(
      <ConnectionCard
        {...props}
        message="Spotify failed"
        isError
        busy={false}
      />,
    );
    expect(screen.getByText("Spotify failed")).toBeTruthy();
  });
});
