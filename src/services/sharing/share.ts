import type { ListeningData } from "../../models/listening";
import { appPath } from "../auth";
import {
  decodeShareHash,
  encodeShareValue,
  shareHashPrefix,
} from "./codec";
import {
  compactListeningData,
  expandListeningData,
} from "./snapshot";

export async function createShareUrl(
  data: ListeningData,
): Promise<string> {
  const encoded = await encodeShareValue(compactListeningData(data));
  return `${window.location.origin}${appPath()}${shareHashPrefix()}${encoded}`;
}

export async function openShareData(
  hash: string,
): Promise<ListeningData> {
  return expandListeningData(await decodeShareHash(hash));
}

export async function copyText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Fall through to the legacy copy path.
    }
  }

  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.append(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  if (!copied) {
    throw new Error("Clipboard access was unavailable.");
  }
}

export function clearShareHash(): void {
  window.history.replaceState({}, "", appPath());
}

export function hasShareHash(): boolean {
  return window.location.hash.startsWith(shareHashPrefix());
}
