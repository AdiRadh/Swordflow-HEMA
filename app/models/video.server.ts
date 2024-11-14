import type { User } from "./user.server";
import { supabase } from "./user.server";
import fetch from 'node-fetch';

export type Video = {
  id: string;
  title: string;
  description: string;
  profile_id: string;
  cloudflare_id: string;
  url: string;
  created_at: Date | null;
};

const CLOUDFLARE_ACCOUNT_ID = '6b2ca3a1aa39cca40019745e10b755ce';
const CLOUDFLARE_API_TOKEN = 'JI_3lcUEqNtbU359I__4OujetYt9DA-MRggPZ59h';

async function getCloudflareAuthToken() {
  // Assuming you have a way to get the auth token, otherwise use the static token
  return CLOUDFLARE_API_TOKEN;
}

async function uploadVideoToCloudflare(videoFile: File) {
  const token = await getCloudflareAuthToken();
  const formData = new FormData();
  formData.append('file', videoFile);
  console.log("upload started");
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  console.log("upload complete");
  const result = await response.json();
  return result;
}

async function deleteVideoFromCloudflare(videoId: string) {
  const token = await getCloudflareAuthToken();

  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const result = await response.json();
  return result;
}

export async function getVideoListItems({ userId }: { userId: User["id"] }) {
  const { data } = await supabase
    .from("videos")
    .select("id, title")
    .eq("profile_id", userId);

  return data;
}

export async function createVideo({
  title,
  description,
  userId,
  videoFile,
}: Pick<Video, "description" | "title"> & { userId: User["id"]; videoFile: File }) {
  const cloudflareResponse = await uploadVideoToCloudflare(videoFile) as { success: boolean; result: { uid: string } };

  if (!cloudflareResponse.success) {
    console.log("upload failed");

    throw new Error("Failed to upload video to Cloudflare");
  }
  console.log("db started");

  const { data, error } = await supabase
    .from("videos")
    .insert({ title, description, profile_id: userId, cloudflare_id: cloudflareResponse.result.uid })
    .select("*")
    .single();

    console.log("db complete");

  if (!error) {
    return data;
  }

  return null;
}

export async function deleteVideo({
  id,
  userId,
}: Pick<Video, "id"> & { userId: User["id"] }) {
  const video = await getVideo({ id, userId });

  if (!video) {
    throw new Error("Video not found");
  }

  const cloudflareResponse = await deleteVideoFromCloudflare(video.cloudflare_id) as { success: boolean };

  if (!cloudflareResponse.success) {
    throw new Error("Failed to delete video from Cloudflare");
  }

  const { error } = await supabase
    .from("videos")
    .delete()
    .match({ id, profile_id: userId });

  if (!error) {
    return {};
  }

  return null;
}

export async function getVideo({
  id,
  userId,
}: Pick<Video, "id"> & { userId: User["id"] }) {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("profile_id", userId)
    .eq("id", id)
    .single();

  if (!error) {
    return {
      userId: data.profile_id,
      id: data.id,
      title: data.title,
      description: data.description,
      cloudflare_id: data.cloudflare_id,
    };
  }

  return null;
}
