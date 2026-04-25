// Esquemas tipados de las tablas de la base de datos.
// Centralizados aquí para usarlos en componentes y hooks.

import type { Database } from "@/integrations/supabase/types";

// ----- Tablas -----
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type SavedNewsRow = Database["public"]["Tables"]["saved_news"]["Row"];
export type SavedNewsInsert = Database["public"]["Tables"]["saved_news"]["Insert"];

// ----- Modelos de dominio -----
export interface Profile {
  id: string;
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavedNews {
  id: string;
  userId: string;
  newsId: string;
  title: string;
  description: string | null;
  link: string;
  image: string | null;
  source: string | null;
  category: string | null;
  pubDate: string | null;
  createdAt: string;
}

export const toProfile = (row: ProfileRow): Profile => ({
  id: row.id,
  userId: row.user_id,
  displayName: row.display_name,
  avatarUrl: row.avatar_url,
  bio: row.bio,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const toSavedNews = (row: SavedNewsRow): SavedNews => ({
  id: row.id,
  userId: row.user_id,
  newsId: row.news_id,
  title: row.title,
  description: row.description,
  link: row.link,
  image: row.image,
  source: row.source,
  category: row.category,
  pubDate: row.pub_date,
  createdAt: row.created_at,
});
