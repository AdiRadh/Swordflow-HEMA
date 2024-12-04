import type { User } from "./user.server";
import { supabase } from "./user.server";

export type VideoComment = {
  id: number;
  created_at: Date | null;
  created_by: string;
  comment: string;
  videoId: number;
  type: string;
};

export async function getVideoCommentListItems({ userId, videoId }: { userId: User["id"], videoId: number }) {
  const { data } = await supabase
    .from("video_comments")
    .select("id, title")
    .eq("created_by", userId)
    .eq("video_id", videoId);

  return data;
}

export async function createVideoComment({
  comment,
  type,
  videoId,
  userId,
}: Pick<VideoComment, "comment" | "type" | "videoId"> & { userId: User["id"] }) {
  const { data, error } = await supabase
    .from("video_comments")
    .insert({ comment, type, created_by: userId })
    .select("*")
    .single();

  if (!error) {
    return data;
  }

  return null;
}

export async function deleteVideoComment({
  id,
  userId,
}: Pick<VideoComment, "id"> & { userId: User["id"] }) {
  const { error } = await supabase
    .from("video_comments")
    .delete()
    .match({ id, created_by: userId });

  if (!error) {
    return {};
  }

  return null;
}

export async function getVideoComment({
  id,
  userId,
}: Pick<VideoComment, "id"> & { userId: User["id"] }) {
  const { data, error } = await supabase
    .from("video_comments")
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
