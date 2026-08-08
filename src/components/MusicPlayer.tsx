import { useEffect, useRef, useState } from "react";
import { Music4, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { formatTime, type Song } from "@/lib/vault";

type Props = {
  songs: Song[];
  index: number;
  onIndexChange: (index: number) => void;
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
};

export function MusicPlayer({ songs, index, onIndexChange, playing, onPlayingChange }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [loop, setLoop] = useState(false);
  const [shuffle, setShuffle] = useState(false);

  const song = songs[index];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !song) return;
    audio.load();
    if (playing) void audio.play().catch(() => onPlayingChange(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song?.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) void audio.play().catch(() => onPlayingChange(false));
    else audio.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      audio.muted = muted;
    }
  }, [volume, muted]);

  const skip = (direction: 1 | -1) => {
    if (songs.length === 0) return;
    if (shuffle && songs.length > 1) {
      let next = index;
      while (next === index) next = Math.floor(Math.random() * songs.length);
      onIndexChange(next);
    } else {
      onIndexChange((index + direction + songs.length) % songs.length);
    }
    onPlayingChange(true);
  };

  if (!song) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-sidebar/95 backdrop-blur">
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3 sm:w-64">
          <div className="size-12 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
            {song.coverUrl ? (
              <img
                src={song.coverUrl}
                alt={`${song.title} album cover`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center">
                <Music4 className="size-5 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight">{song.title}</p>
            <p className="truncate text-xs text-muted-foreground">{song.artist}</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Shuffle" onClick={() => setShuffle((v) => !v)}>
              <Shuffle className={shuffle ? "text-primary" : "text-muted-foreground"} />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Previous song" onClick={() => skip(-1)}>
              <SkipBack />
            </Button>
            <Button
              size="icon"
              aria-label={playing ? "Pause" : "Play"}
              className="size-10 rounded-full"
              onClick={() => onPlayingChange(!playing)}
            >
              {playing ? <Pause /> : <Play />}
            </Button>
            <Button variant="ghost" size="icon" aria-label="Next song" onClick={() => skip(1)}>
              <SkipForward />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Repeat" onClick={() => setLoop((v) => !v)}>
              <Repeat className={loop ? "text-primary" : "text-muted-foreground"} />
            </Button>
          </div>

          <div className="flex w-full items-center gap-3">
            <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
              {formatTime(progress)}
            </span>
            <Slider
              value={[progress]}
              max={duration || 1}
              step={0.5}
              aria-label="Seek"
              onValueChange={([value]) => {
                const audio = audioRef.current;
                if (audio && typeof value === "number") {
                  audio.currentTime = value;
                  setProgress(value);
                }
              }}
              className="flex-1"
            />
            <span className="w-10 shrink-0 text-[11px] tabular-nums text-muted-foreground">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="hidden items-center gap-2 sm:flex sm:w-40">
          <Button variant="ghost" size="icon" aria-label="Mute" onClick={() => setMuted((v) => !v)}>
            {muted || volume === 0 ? <VolumeX /> : <Volume2 />}
          </Button>
          <Slider
            value={[muted ? 0 : volume * 100]}
            max={100}
            step={1}
            aria-label="Volume"
            className="w-24"
            onValueChange={([value]) => {
              if (typeof value !== "number") return;
              setMuted(false);
              setVolume(value / 100);
            }}
          />
        </div>
      </div>

      <audio
        ref={audioRef}
        src={song.audioUrl}
        loop={loop}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => {
          if (!loop) skip(1);
        }}
      />
    </div>
  );
}
