"use client";

import { useEffect, useRef, useState } from "react";

const playlist = [
  { title: "Blinding Lights", src: "/music/blinding_lights.mp3" },
  { title: "Contact", src: "/music/contact_daft_punk.mp3" },
  { title: "All The Stars", src: "/music/all_the_stars.mp3" },
];

export function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [isMinimized, setIsMinimized] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("music-player:minimized", {
        detail: { isMinimized },
      }),
    );
  }, [isMinimized]);

  const playCurrentTrack = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
      setIsPlaying(true);
      setAudioError("");
    } catch {
      setIsPlaying(false);
      setAudioError("Tap play to start music");
    }
  };

  const pauseCurrentTrack = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  };

  const goToNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
  };

  const goToPreviousTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.load();
    if (isPlaying) {
      void playCurrentTrack();
    }
  }, [currentTrackIndex, isPlaying]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isMinimized ? (
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="rounded-full border border-white/20 bg-black/75 px-4 py-2 text-xs text-zinc-100 shadow-xl backdrop-blur-md transition-colors hover:bg-black/90"
          aria-label="Open music player"
        >
          {isPlaying ? "Pause Music" : "Play Music"}
        </button>
      ) : (
        <div className="w-[calc(100vw-2rem)] max-w-xs rounded-xl border border-white/15 bg-black/70 p-3 shadow-2xl backdrop-blur-md">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-xs text-zinc-300" title={playlist[currentTrackIndex]?.title}>
              Now playing: {playlist[currentTrackIndex]?.title}
            </p>
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="rounded px-2 py-1 text-xs text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Minimize music player"
            >
              Close
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={goToPreviousTrack}
              className="rounded bg-white/10 px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:bg-white/20"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => (isPlaying ? pauseCurrentTrack() : void playCurrentTrack())}
              className="rounded bg-cyan-500/25 px-3 py-1.5 text-xs text-cyan-100 transition-colors hover:bg-cyan-500/40"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={goToNextTrack}
              className="rounded bg-white/10 px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:bg-white/20"
            >
              Next
            </button>
          </div>
          {audioError && <p className="mt-2 text-xs text-amber-300">{audioError}</p>}
        </div>
      )}
      <audio
        ref={audioRef}
        preload="metadata"
        onEnded={goToNextTrack}
        onPause={() => setIsPlaying(false)}
        onPlay={() => {
          setIsPlaying(true);
          setAudioError("");
        }}
      >
        <source src={playlist[currentTrackIndex]?.src} type="audio/mpeg" />
      </audio>
    </div>
  );
}
