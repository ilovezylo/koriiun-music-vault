import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Music4, Play, Pause, Lock, Home, Heart, Library, Search } from "lucide-react";
import { MusicPlayer } from "@/components/MusicPlayer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchSongs, type Song } from "@/lib/vault";
import deco1 from "@/assets/deco1.png.asset.json";
import deco2 from "@/assets/deco2.png.asset.json";
import deco3 from "@/assets/deco3.png.asset.json";
import deco3 from "@/assets/deco3.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "kamisfemboys.help — music vault" },
      {
        name: "description",
        content:
          "The music vault at kamisfemboys.help: every song in one place, free to stream. Because Spotify keeps deleting me.",
      },
      { property: "og:title", content: "kamisfemboys.help — music vault" },
      {
        property: "og:description",
        content: "Stream every song in the vault — no account needed.",
      },
      { property: "og:type", content: "music.playlist" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Vault,
});

const navItems = [
  { icon: Home, label: "Home" },
  { icon: Heart, label: "Favorites" },
  { icon: Library, label: "Your Library" },
];

function Vault() {
  const { data: songs = [], isLoading } = useQuery({ queryKey: ["songs"], queryFn: fetchSongs });
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return songs;
    return songs.filter((s) => `${s.title} ${s.artist}`.toLowerCase().includes(q));
  }, [songs, query]);

  const current: Song | undefined = songs[index];

  const toggle = (song: Song) => {
    const realIndex = songs.findIndex((s) => s.id === song.id);
    if (realIndex === index) setPlaying(!playing);
    else {
      setIndex(realIndex);
      setPlaying(true);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden pb-28">
      <img
        src={deco1.url}
        alt=""
        loading="lazy"
        className="pointer-events-none absolute right-6 top-6 z-10 w-16 animate-float opacity-80 sm:w-24"
      />
      <img
        src={deco2.url}
        alt=""
        loading="lazy"
        className="pointer-events-none absolute bottom-40 left-8 z-10 w-14 animate-float opacity-70 sm:w-20"
      />
      <img
        src={deco3.url}
        alt=""
        loading="lazy"
        className="pointer-events-none absolute bottom-40 right-8 z-10 w-16 animate-float opacity-70 sm:w-24"
      />
      <div className="flex min-h-screen">
        <aside className="hidden w-60 shrink-0 flex-col gap-1 border-r border-sidebar-border bg-sidebar p-4 md:flex">
          <div className="mb-6 flex items-center gap-2 px-2">
            <Music4 className="size-5 text-primary" />
            <span className="font-display text-lg font-extrabold tracking-tight">
              <span className="text-primary">KAMI'S</span> VAULT
            </span>
          </div>
          {navItems.map(({ icon: Icon, label }, i) => (
            <button
              key={label}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                i === 0
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
              }`}
            >
              <Icon className="size-4" /> {label}
            </button>
          ))}
          <div className="mt-auto">
            <Button asChild variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
              <Link to="/auth">
                <Lock className="size-3.5" /> admin
              </Link>
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-8 sm:px-10">
          <div className="mx-auto max-w-4xl">
            <section
              className="rounded-2xl border border-border p-7 sm:p-10"
              style={{ backgroundImage: "var(--gradient-dreamy)", backgroundColor: "var(--color-card)" }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                all femboys allowed
              </p>
              <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
                because spotify keeps deleting me
              </h1>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                also because the doxxing, some of you are weird. every song lives here — press play, no account
                needed.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    if (songs.length) {
                      setIndex(0);
                      setPlaying(true);
                    }
                  }}
                  disabled={!songs.length}
                >
                  <Play className="size-4" /> play all
                </Button>
                <Button asChild variant="secondary">
                  <Link to="/auth">
                    <Lock className="size-4" /> admin upload
                  </Link>
                </Button>
              </div>
            </section>

            <div className="relative mt-6">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search songs…"
                aria-label="Search songs"
                className="h-12 rounded-xl pl-10"
              />
            </div>

            <section className="mt-8">
              <h2 className="mb-4 font-display text-2xl font-bold">Recently Added</h2>

              {isLoading && <p className="text-sm text-muted-foreground">Loading the vault…</p>}

              {!isLoading && filtered.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                  {songs.length === 0
                    ? "the vault is empty — upload your first mp3 from /admin"
                    : "no songs match that search"}
                </div>
              )}

              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((song) => {
                  const isCurrent = current?.id === song.id;
                  return (
                    <li key={song.id}>
                      <button
                        onClick={() => toggle(song)}
                        className={`group w-full rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-secondary ${
                          isCurrent ? "ring-1 ring-primary" : ""
                        }`}
                      >
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                          {song.coverUrl ? (
                            <img
                              src={song.coverUrl}
                              alt={`${song.title} album cover`}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center">
                              <Music4 className="size-8 text-muted-foreground" />
                            </div>
                          )}
                          <span className="absolute bottom-2 right-2 grid size-10 translate-y-1 place-items-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg transition-all group-hover:translate-y-0 group-hover:opacity-100">
                            {isCurrent && playing ? <Pause className="size-4" /> : <Play className="size-4" />}
                          </span>
                        </div>
                        <p className="mt-3 truncate font-semibold leading-tight">{song.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{song.artist}</p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            <footer className="mt-14 pb-6 text-xs text-muted-foreground">kamisfemboys.help</footer>
          </div>
        </main>
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
    </div>
  );
}
