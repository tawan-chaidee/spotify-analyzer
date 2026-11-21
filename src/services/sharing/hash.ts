import { appPath } from "../auth";

export const SHARE_HASH_PREFIX = "#share=";

export function shareHashPrefix(): string {
  return SHARE_HASH_PREFIX;
}

export function hasShareHash(): boolean {
  return window.location.hash.startsWith(SHARE_HASH_PREFIX);
}

export function clearShareHash(): void {
  window.history.replaceState({}, "", appPath());
}
