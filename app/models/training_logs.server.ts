import type { User } from "./user.server";
import { supabase } from "./user.server";

export type TrainingLog = {
  id: number;
  created_at: Date | null;
  created_by: string;
  routine_id: number;
  completed: boolean;
};


export async function getTrainingLogListItems({ userId }: { userId: User["id"] }) {
const { data } = await supabase
  .from("training_log")
  .select("id, created_by, created_at, routine_id, completed")
  .eq("created_by", userId);

return data;
}

export async function createTrainingLog({
  routine_id,
  userId,
}: Pick<TrainingLog, "routine_id" > & { userId: User["id"] }) {
const { data, error } = await supabase
  .from("training_log")
  .insert({ routine_id: routine_id, completed: false, created_by: userId })
  .select("*")
  .single();

if (!error) {
  return data;
}

return null;
}

export async function deleteTrainingLog({
id,
userId,
}: Pick<TrainingLog, "id"> & { userId: User["id"] }) {
const { error } = await supabase
  .from("training_log")
  .delete()
  .match({ id, created_by: userId });

if (!error) {
  return {};
}

return null;
}

export async function getTrainingLog({
id,
userId,
}: Pick<TrainingLog, "id"> & { userId: User["id"] }) {
const { data, error } = await supabase
  .from("training_log")
  .select("*")
  .eq("created_by", userId)
  .eq("id", id)
  .single();

if (!error) {
  return {
    createdBy: data.created_by,
    id: data.id,
    createdAt: data.created_at,
    completed: data.completed,
    routine_id: data.routine_id,
  };
}

return null;
}
