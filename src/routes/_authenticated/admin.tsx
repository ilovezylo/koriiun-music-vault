import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { LogOut, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchSongs } from "@/lib/vault";
import { useIsAdmin, useSession } from "@/hooks/use-admin";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Upload songs — kami’s vault admin" },
      { name: "description", content: "Private admin area for uploading songs to the kamisfemboys.help music vault." },
      { property: "og:title", content: "Upload songs — kami’s vault admin" },
      { property: "og:description", content: "Private admin area for the kamisfemboys.help music vault." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "");
}

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session } = useSession();
  const isAdmin = useIsAdmin(session);
  const { data: songs = [] } = useQuery({ queryKey: ["songs"], queryFn: fetchSongs });

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("kami");
  const [audio, setAudio] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  };

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audio) {
      toast.error("pick an mp3 first");
      return;
    }
    setBusy(true);
    try {
      const stamp = Date.now();
      const audioPath = `${stamp}-${slug(audio.name)}`;
      const { error: audioError } = await supabase.storage.from("audio").upload(audioPath, audio, {
        contentType: audio.type || "audio/mpeg",
      });
      if (audioError) throw audioError;

      let coverPath: string | null = null;
      if (cover) {
        coverPath = `${stamp}-${slug(cover.name)}`;
        const { error: coverError } = await supabase.storage.from("covers").upload(coverPath, cover, {
          contentType: cover.type || "image/jpeg",
        });
        if (coverError) throw coverError;
      }

      const { error } = await supabase.from("songs").insert({
        title: title.trim() || audio.name.replace(/\.[^.]+$/, ""),
        artist: artist.trim() || "kami",
        audio_path: audioPath,
        cover_path: coverPath,
      });
      if (error) throw error;

      toast.success("song added to the vault ♡");
      setTitle("");
      setAudio(null);
      setCover(null);
      await queryClient.invalidateQueries({ queryKey: ["songs"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "upload failed");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string, audioPath: string, coverPath: string | null) => {
    const { error } = await supabase.from("songs").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await supabase.storage.from("audio").remove([audioPath]);
    if (coverPath) await supabase.storage.from("covers").remove([coverPath]);
    toast.success("deleted");
    await queryClient.invalidateQueries({ queryKey: ["songs"] });
  };

  if (isAdmin === false) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <div className="card-cute max-w-sm p-6 text-center">
          <h1 className="font-display text-2xl font-extrabold">not you, sorry ♡</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            this account isn't the vault admin. only the owner can upload songs.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link to="/">back to the vault</Link>
            </Button>
            <Button size="sm" onClick={signOut}>
              sign out
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-extrabold">
          <span className="text-gradient-candy">vault admin</span>
        </h1>
        <div className="flex gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link to="/">view vault</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="size-4" /> sign out
          </Button>
        </div>
      </div>

      <form onSubmit={upload} className="card-cute mt-6 space-y-4 p-5">
        <h2 className="font-display text-xl font-bold">add a song</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">title</Label>
            <Input id="title" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="song name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="artist">artist</Label>
            <Input id="artist" value={artist} maxLength={80} onChange={(e) => setArtist(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="audio">mp3 file</Label>
            <Input id="audio" type="file" accept="audio/*" onChange={(e) => setAudio(e.target.files?.[0] ?? null)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cover">album cover (optional)</Label>
            <Input id="cover" type="file" accept="image/*" onChange={(e) => setCover(e.target.files?.[0] ?? null)} />
          </div>
        </div>
        <Button type="submit" disabled={busy}>
          <Upload className="size-4" /> {busy ? "uploading…" : "upload to vault"}
        </Button>
      </form>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-xl font-bold">in the vault ({songs.length})</h2>
        <ul className="space-y-3">
          {songs.map((song) => (
            <li key={song.id} className="card-cute flex items-center gap-3 p-3">
              <div className="size-12 shrink-0 overflow-hidden rounded-xl border-2 border-border bg-muted">
                {song.coverUrl ? (
                  <img
                    src={song.coverUrl}
                    alt={`${song.title} cover`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{song.title}</p>
                <p className="truncate text-xs text-muted-foreground">{song.artist}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete ${song.title}`}
                onClick={() => remove(song.id, song.audio_path, song.cover_path)}
              >
                <Trash2 className="text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
