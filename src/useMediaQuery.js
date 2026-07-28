import { useEffect, useState } from "react";

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof matchMedia !== "undefined" && matchMedia(query).matches,
  );

  useEffect(() => {
    if (typeof matchMedia === "undefined") return undefined;
    const media = matchMedia(query);
    const sync = () => setMatches(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [query]);

  return matches;
}
