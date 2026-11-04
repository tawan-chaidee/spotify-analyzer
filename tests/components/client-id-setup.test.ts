// @vitest-environment happy-dom
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ClientIdSetup from "../../src/components/ClientIdSetup.svelte";

const VALID_CLIENT_ID = "0123456789abcdef0123456789abcdef";

function renderSetup(onconnect = vi.fn()) {
  render(ClientIdSetup, {
    props: {
      redirectUri: "https://spotify.example/callback",
      remember: true,
      busy: false,
      ownerAvailable: true,
      onrememberchange: vi.fn(),
      onconnect,
      onowneraccess: vi.fn(),
    },
  });
  return onconnect;
}

describe("ClientIdSetup", () => {
  it("rejects a malformed Client ID before authorization", async () => {
    const user = userEvent.setup();
    const onconnect = renderSetup();

    await user.type(
      screen.getByLabelText("Spotify Client ID"),
      "not-a-client-id",
    );
    await user.click(
      screen.getByRole("button", { name: "Connect Spotify" }),
    );

    expect(onconnect).not.toHaveBeenCalled();
    expect(
      screen.getByText(/does not look like a Spotify Client ID/i),
    ).toBeTruthy();
  });

  it("submits a normalized Client ID", async () => {
    const user = userEvent.setup();
    const onconnect = renderSetup();

    await user.type(
      screen.getByLabelText("Spotify Client ID"),
      `  ${VALID_CLIENT_ID}  `,
    );
    await user.click(
      screen.getByRole("button", { name: "Connect Spotify" }),
    );

    expect(onconnect).toHaveBeenCalledWith(VALID_CLIENT_ID);
  });

  it("can prefill a development Client ID", () => {
    render(ClientIdSetup, {
      props: {
        redirectUri: "http://127.0.0.1:5175/callback",
        remember: true,
        busy: false,
        ownerAvailable: true,
        initialClientId: VALID_CLIENT_ID,
        onrememberchange: vi.fn(),
        onconnect: vi.fn(),
        onowneraccess: vi.fn(),
      },
    });

    expect(
      (
        screen.getByLabelText("Spotify Client ID") as HTMLInputElement
      ).value,
    ).toBe(VALID_CLIENT_ID);
  });
});
