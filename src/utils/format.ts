export function formatDuration(milliseconds: number): string {
  if (!Number.isFinite(milliseconds)) return "—";
  const totalSeconds = Math.round(milliseconds / 1000);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
}
