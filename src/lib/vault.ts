import { supabase } from "@/integrations/supabase/client";

export type SongRow = {
  id: string;
  title: string;
  artist: string;
  audio_path: string;
  cover_path: string | null;
  sort_order: number;
  created_at: string;
};

export type Song = SongRow & {
  audioUrl: string;
  coverUrl: string | null;
};

const SIGN_TTL = 60 * 60 * 6;

export async function signedUrl(bucket: string, path: string | null) {
  if (!path) return null;
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, SIGN_TTL);
  return data?.signedUrl ?? null;
}

export async function fetchSongs(): Promise<Song[]> {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as SongRow[];
  return Promise.all(
    rows.map(async (row) => ({
      ...row,
      audioUrl: (await signedUrl("audio", row.audio_path)) ?? "",
      coverUrl: await signedUrl("covers", row.cover_path),
    })),
  );
}

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
