import { describe, expect, it } from "vitest";
import {
  decodeShareHash,
  encodeShareValue,
  shareHashPrefix,
} from "../../src/services/sharing/codec";
import {
  compactListeningData,
  expandListeningData,
} from "../../src/services/sharing/snapshot";
import { createListeningFixture } from "../fixtures/listening";

describe("sharing", () => {
  it("round-trips compact listening data", async () => {
    const snapshot = compactListeningData(createListeningFixture());
    const encoded = await encodeShareValue(snapshot);
    const decoded = await decodeShareHash(
      `${shareHashPrefix()}${encoded}`,
    );
    const expanded = expandListeningData(decoded);

    expect(expanded.tracks.medium_term[0].title).toBe('Alpha, "One"');
    expect(expanded.artists.medium_term[1].name).toBe("Artist B");
  });

  it("supports the legacy duplicated gzip marker", async () => {
    const snapshot = compactListeningData(createListeningFixture());
    const encoded = await encodeShareValue(snapshot);
    const decoded = await decodeShareHash(
      `${shareHashPrefix()}gz.${encoded}`,
    );
    expect(decoded).toHaveProperty("version", 1);
  });

  it("rejects damaged payloads", async () => {
    await expect(
      decodeShareHash(`${shareHashPrefix()}gz.invalid`),
    ).rejects.toThrow();
  });
});
