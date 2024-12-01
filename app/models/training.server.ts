import type { User } from "./user.server";
import { supabase } from "./user.server";

export type Training = {
    id: number;
    created_at: Date | null;
    created_by: string;
    name: string;
    description: string;
    type: string;
  };


export async function getTrainingListItems({ userId }: { userId: User["id"] }) {
  const { data } = await supabase
    .from("training")
    .select("id, title")
    .eq("created_by", userId);

  return data;
}

export async function createTraining({
  name,
  description,
  type,
  userId,
}: Pick<Training, "name" | "description" | "type"> & { userId: User["id"] }) {
  const { data, error } = await supabase
    .from("training")
    .insert({ name, description, type, created_by: userId })
    .select("*")
    .single();

  if (!error) {
    return data;
  }

  return null;
}

export async function deleteTraining({
  id,
  userId,
}: Pick<Training, "id"> & { userId: User["id"] }) {
  const { error } = await supabase
    .from("training")
    .delete()
    .match({ id, created_by: userId });

  if (!error) {
    return {};
  }

  return null;
}

export async function getTraining({
  id,
  userId,
}: Pick<Training, "id"> & { userId: User["id"] }) {
  const { data, error } = await supabase
    .from("training")
    .select("*")
    .eq("created_by", userId)
    .eq("id", id)
    .single();

  if (!error) {
    return {
      userId: data.created_by,
      id: data.id,
      title: data.title,
      body: data.body,
    };
  }

  return null;
}
