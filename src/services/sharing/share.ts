import type { ListeningData } from "../../models/listening";
import { appPath } from "../auth";
import {
  decodeShareHash,
  encodeShareValue,
} from "./codec";
import { SHARE_HASH_PREFIX } from "./hash";
import {
  compactListeningData,
  expandListeningData,
} from "./snapshot";

export async function createShareUrl(
  data: ListeningData,
): Promise<string> {
  const encoded = await encodeShareValue(compactListeningData(data));
  return `${window.location.origin}${appPath()}${SHARE_HASH_PREFIX}${encoded}`;
}

export async function openShareData(
  hash: string,
): Promise<ListeningData> {
  return expandListeningData(await decodeShareHash(hash));
}

export { clearShareHash, hasShareHash } from "./hash";
