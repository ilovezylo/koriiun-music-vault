import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Music4, Play, Pause, Lock } from "lucide-react";
import { MusicPlayer } from "@/components/MusicPlayer";
import { Button } from "@/components/ui/button";
import { fetchSongs, type Song } from "@/lib/vault";
import bow from "@/assets/deco-bow.png";
import stars from "@/assets/deco-stars.png";
import cat from "@/assets/deco-cat.png";
import tape from "@/assets/deco-tape.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "koriiun — music vault" },
      {
        name: "description",
        content:
          "koriiun's music vault: every song in one cute little place, free to listen to. Because Spotify keeps deleting me.",
      },
      { property: "og:title", content: "koriiun — music vault" },
      {
        property: "og:description",
        content: "Listen to every koriiun song in one cute little vault.",
      },
      { property: "og:type", content: "music.playlist" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Vault,
});

function Vault() {
  const { data: songs = [], isLoading } = useQuery({ queryKey: ["songs"], queryFn: fetchSongs });
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current: Song | undefined = songs[index];

  return (
    <main className="relative min-h-screen overflow-hidden pb-44">
      <img src={bow} alt="" width={512} height={512} loading="lazy" className="pointer-events-none absolute -left-6 top-24 w-24 animate-float opacity-90 sm:w-32" />
      <img src={stars} alt="" width={512} height={512} loading="lazy" className="pointer-events-none absolute right-4 top-10 w-20 animate-float opacity-90 sm:w-28" />
      <img src={tape} alt="" width={512} height={512} loading="lazy" className="pointer-events-none absolute -right-4 top-[45%] w-24 animate-float opacity-80 sm:w-32" />
      <img src={cat} alt="" width={512} height={512} loading="lazy" className="pointer-events-none absolute bottom-40 left-2 w-24 animate-float opacity-90 sm:w-32" />

      <div className="relative mx-auto max-w-4xl px-5 pt-14">
        <header className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-4 py-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Music4 className="size-3.5" /> koriiun.com
          </span>
          <h1 className="mt-4 font-display text-5xl font-extrabold leading-none sm:text-7xl">
            <span className="text-gradient-candy">the music vault</span>
          </h1>
          <div className="mx-auto mt-5 max-w-md space-y-2">
            <p className="card-cute px-4 py-2 text-sm font-semibold">because spotify keeps deleting me ♡</p>
            <p className="card-cute px-4 py-2 text-sm font-semibold">
              also because the doxxing, some of you are weird
            </p>
          </div>
        </header>

        <section className="mt-10">
          <h2 className="mb-3 font-display text-2xl font-bold">songs</h2>

          {isLoading && <p className="text-sm text-muted-foreground">loading the vault…</p>}

          {!isLoading && songs.length === 0 && (
            <div className="card-cute p-8 text-center">
              <img src={cat} alt="" width={512} height={512} loading="lazy" className="mx-auto w-24" />
              <p className="mt-2 font-display text-lg font-bold">the vault is empty right now</p>
              <p className="text-sm text-muted-foreground">songs will show up here as soon as they get uploaded ♡</p>
            </div>
          )}

          <ul className="grid gap-3 sm:grid-cols-2">
            {songs.map((song, i) => {
              const isCurrent = i === index;
              return (
                <li key={song.id}>
                  <button
                    onClick={() => {
                      if (isCurrent) setPlaying(!playing);
                      else {
                        setIndex(i);
                        setPlaying(true);
                      }
                    }}
                    className={`card-cute group flex w-full items-center gap-3 p-3 text-left transition-transform hover:-translate-y-0.5 ${
                      isCurrent ? "ring-2 ring-ring" : ""
                    }`}
                  >
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border-2 border-border bg-muted">
                      {song.coverUrl ? (
                        <img src={song.coverUrl} alt={`${song.title} album cover`} loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <img src={tape} alt="" width={512} height={512} loading="lazy" className="h-full w-full object-contain p-1" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-lg font-bold leading-tight">{song.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{song.artist}</p>
                    </div>
                    <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
                      {isCurrent && playing ? <Pause className="size-4" /> : <Play className="size-4" />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <footer className="mt-12 flex flex-col items-center gap-2 pb-6 text-center">
          <p className="text-xs text-muted-foreground">made with ♡ — koriiun.com</p>
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">
              <Lock className="size-3.5" /> admin
            </Link>
          </Button>
        </footer>
      </div>

      {current && (
        <MusicPlayer
          songs={songs}
          index={index}
          onIndexChange={setIndex}
          playing={playing}
          onPlayingChange={setPlaying}
        />
      )}
    </main>
  );
}
