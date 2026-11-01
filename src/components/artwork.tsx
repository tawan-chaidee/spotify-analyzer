import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { safeArtworkUrl } from "../utils/url";

interface ArtworkProps {
  src: string;
  title: string;
  className?: string;
  size?: number;
}

export function Artwork({
  src,
  title,
  className,
  size = 48,
}: ArtworkProps) {
  const [failed, setFailed] = useState(false);
  const source = safeArtworkUrl(src);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!source || failed) {
    return (
      <span
        aria-hidden="true"
        className={cn("shrink-0 rounded-lg bg-secondary", className)}
      />
    );
  }

  return (
    <img
      src={source}
      alt=""
      title={title}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn(
        "shrink-0 rounded-lg bg-secondary object-cover",
        className,
      )}
    />
  );
}
