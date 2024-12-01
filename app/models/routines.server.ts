import type { User } from "./user.server";
import { supabase } from "./user.server";

export type Routine = {
  id: number;
  created_at: Date | null;
  created_by: string;
  training_id: number;
  time: string;
};

export async function getRoutineListItems({ userId }: { userId: User["id"] }) {
  const { data } = await supabase
    .from("routine")
    .select("id, training_id, time")
    .eq("created_by", userId);

  return data;
}

export async function createRoutine({
  training_id,
  time,
  userId,
}: Pick<Routine, "time" | "training_id"> & { userId: User["id"] }) {
  const { data, error } = await supabase
    .from("routine")
    .insert({ training_id, time, created_by: userId })
    .select("*")
    .single();

  if (!error) {
    return data;
  }

  return null;
}

export async function deleteRoutine({
  id,
  userId,
}: Pick<Routine, "id"> & { userId: User["id"] }) {
  const { error } = await supabase
    .from("routine")
    .delete()
    .match({ id, created_by: userId });

  if (!error) {
    return {};
  }

  return null;
}

export async function getRoutine({
  id,
  userId,
}: Pick<Routine, "id"> & { userId: User["id"] }) {
  const { data, error } = await supabase
    .from("routine")
    .select("*")
    .eq("created_by", userId)
    .eq("id", id)
    .single();

  if (!error) {
    return {
      userId: data.created_by,
      id: data.id,
      training_id: data.training_id,
      time: data.time,
    };
  }

  return null;
}
