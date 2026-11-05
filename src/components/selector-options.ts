import { CONTENT } from "../services/content";

export const contentTypeOptions = [
  { value: "tracks", label: CONTENT.controls.tracks },
  { value: "artists", label: CONTENT.controls.artists },
  { value: "albums", label: CONTENT.controls.albums },
] as const;

export const timeRangeOptions = [
  { value: "short_term", label: CONTENT.range.short_term.short },
  { value: "medium_term", label: CONTENT.range.medium_term.short },
  { value: "long_term", label: CONTENT.range.long_term.short },
] as const;
