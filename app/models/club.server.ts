import type { User } from "./user.server";
import { supabase } from "./user.server";

export type Club = {
  id: number;
  created_at: Date | null;
  name: string;
  description: string;
};

export async function getNoteListItems({ userId }: { userId: User["id"] }) {
  const { data } = await supabase
    .from("notes")
    .select("id, title")
    .eq("profile_id", userId);

  return data;
}


export async function deleteClub(id: string) {
  const { error } = await supabase
    .from("notes")
    .delete()
    .match({ id });

  if (!error) {
    return {};
  }

  return null;
}

export async function getClub(id: string) {
  const { data, error } = await supabase
    .from("club")
    .select("id, created_at, name, description, image_url")
    .eq("id", id)
    .single();

  if (error) return null;
  if (data) return { id: data.id, created_at: data.created_at, name: data.name, description: data.description, image_url: data.image_url };
}