import { useCallback, useRef } from "react";

export const useAudio = (src: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
    }
    audioRef.current.play();
  }, [src]);

  return { play };
};
