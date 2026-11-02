// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConnectionCard } from "../../src/components/connection-card";

const props = {
  selectedApp: {
    source: "own" as const,
    clientId: "0123456789abcdef0123456789abcdef",
  },
  ownerAvailable: true,
  remember: true,
  redirectUri: "http://127.0.0.1:8000/callback",
  onRememberChange: vi.fn(),
  onConnect: vi.fn(),
  onClientIdSubmit: vi.fn(),
  onOwnerAccess: vi.fn(),
  onChangeApp: vi.fn(),
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

  it("shows the visitor Client ID setup by default", () => {
    render(
      <ConnectionCard
        {...props}
        selectedApp={null}
        message=""
        isError={false}
        busy={false}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Use Your Spotify App" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Owner Access" }),
    ).toBeTruthy();
  });

  it("hides Owner Access when no owner Client ID is configured", () => {
    render(
      <ConnectionCard
        {...props}
        selectedApp={null}
        ownerAvailable={false}
        message=""
        isError={false}
        busy={false}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "Owner Access" }),
    ).toBeNull();
  });
});
