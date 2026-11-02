// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ClientIdSetup } from "../../src/components/client-id-setup";

const VALID_CLIENT_ID = "0123456789abcdef0123456789abcdef";

function renderSetup(onConnect = vi.fn()) {
  render(
    <ClientIdSetup
      redirectUri="https://spotify.example/callback"
      remember
      busy={false}
      ownerAvailable
      onRememberChange={vi.fn()}
      onConnect={onConnect}
      onOwnerAccess={vi.fn()}
    />,
  );
  return onConnect;
}

describe("ClientIdSetup", () => {
  it("rejects a malformed Client ID before authorization", async () => {
    const user = userEvent.setup();
    const onConnect = renderSetup();

    await user.type(
      screen.getByLabelText("Spotify Client ID"),
      "not-a-client-id",
    );
    await user.click(
      screen.getByRole("button", { name: "Connect Spotify" }),
    );

    expect(onConnect).not.toHaveBeenCalled();
    expect(
      screen.getByText(/does not look like a Spotify Client ID/i),
    ).toBeTruthy();
  });

  it("submits a normalized Client ID", async () => {
    const user = userEvent.setup();
    const onConnect = renderSetup();

    await user.type(
      screen.getByLabelText("Spotify Client ID"),
      `  ${VALID_CLIENT_ID}  `,
    );
    await user.click(
      screen.getByRole("button", { name: "Connect Spotify" }),
    );

    expect(onConnect).toHaveBeenCalledWith(VALID_CLIENT_ID);
  });

  it("can prefill a development Client ID", () => {
    render(
      <ClientIdSetup
        redirectUri="http://127.0.0.1:5175/callback"
        remember
        busy={false}
        ownerAvailable
        initialClientId={VALID_CLIENT_ID}
        onRememberChange={vi.fn()}
        onConnect={vi.fn()}
        onOwnerAccess={vi.fn()}
      />,
    );

    expect(
      screen.getByLabelText<HTMLInputElement>("Spotify Client ID").value,
    ).toBe(VALID_CLIENT_ID);
  });
});
