// @vitest-environment happy-dom
import { render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import ConnectionCard from "../../src/components/ConnectionCard.svelte";

const props = {
  selectedApp: {
    source: "own" as const,
    clientId: "0123456789abcdef0123456789abcdef",
  },
  ownerAvailable: true,
  remember: true,
  redirectUri: "http://127.0.0.1:8000/callback",
  onrememberchange: vi.fn(),
  onconnect: vi.fn(),
  onclientidsubmit: vi.fn(),
  onowneraccess: vi.fn(),
  onchangeapp: vi.fn(),
};

describe("ConnectionCard", () => {
  it("shows loading text", () => {
    render(ConnectionCard, {
      props: {
        ...props,
        message: "Loading",
        isError: false,
        busy: true,
      },
    });
    expect(screen.getByText("Connecting…")).toBeTruthy();
  });

  it("shows error text", () => {
    render(ConnectionCard, {
      props: {
        ...props,
        message: "Spotify failed",
        isError: true,
        busy: false,
      },
    });
    expect(screen.getByText("Spotify failed")).toBeTruthy();
  });

  it("shows the visitor Client ID setup by default", () => {
    render(ConnectionCard, {
      props: {
        ...props,
        selectedApp: null,
        message: "",
        isError: false,
        busy: false,
      },
    });
    expect(
      screen.getByRole("heading", { name: "Use Your Spotify App" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Owner Access" }),
    ).toBeTruthy();
  });

  it("hides Owner Access when no owner Client ID is configured", () => {
    render(ConnectionCard, {
      props: {
        ...props,
        selectedApp: null,
        ownerAvailable: false,
        message: "",
        isError: false,
        busy: false,
      },
    });
    expect(
      screen.queryByRole("button", { name: "Owner Access" }),
    ).toBeNull();
  });
});
