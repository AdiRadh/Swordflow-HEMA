import type { User } from "./user.server";
import { supabase } from "./user.server";
import fetch from 'node-fetch';

export type Image = {
  id: string;
  name: string;
  description: string;
  created_by: string;
  cloudflare_id: string;
  type: string;
  created_at: Date | null;
};

const CLOUDFLARE_ACCOUNT_ID = '6b2ca3a1aa39cca40019745e10b755ce';
const CLOUDFLARE_API_TOKEN = 'JI_3lcUEqNtbU359I__4OujetYt9DA-MRggPZ59h';

async function getCloudflareAuthToken() {
  // Assuming you have a way to get the auth token, otherwise use the static token
  return CLOUDFLARE_API_TOKEN;
}
async function uploadImageToCloudflare(imageFile: File) {
  const token = await getCloudflareAuthToken();
  const formData = new FormData();
  formData.append('file', imageFile);
  console.log("upload started");
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`, {
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

async function deleteImageFromCloudflare(imageId: string) {
  const token = await getCloudflareAuthToken();

  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const result = await response.json();
  return result;
}

export async function getImageListItems({ userId }: { userId: User["id"] }) {
  const { data } = await supabase
    .from("images")
    .select("id, name")
    .eq("profile_id", userId);

  return data;
}

export async function createImage({
  name,
  description,
  type,
  userId,
  imageFile,
}: Pick<Image, "description" | "name" | "type"> & { userId: User["id"]; imageFile: File }) {
  const cloudflareResponse = await uploadImageToCloudflare(imageFile) as { success: boolean; result: { uid: string } };

  if (!cloudflareResponse.success) {
    console.log("upload failed");

    throw new Error("Failed to upload image to Cloudflare");
  }
  console.log("db started");

  const { data, error } = await supabase
    .from("images")
    .insert({ name, description, type, profile_id: userId, cloudflare_id: cloudflareResponse.result.uid })
    .select("*")
    .single();

    console.log("db complete");

  if (!error) {
    return data;
  }

  return null;
}

export async function deleteImage({
  id,
  userId,
}: Pick<Image, "id"> & { userId: User["id"] }) {
  const image = await getImage({ id, userId });

  if (!image) {
    throw new Error("Image not found");
  }

  const cloudflareResponse = await deleteImageFromCloudflare(image.cloudflare_id) as { success: boolean };

  if (!cloudflareResponse.success) {
    throw new Error("Failed to delete image from Cloudflare");
  }

  const { error } = await supabase
    .from("images")
    .delete()
    .match({ id, profile_id: userId });

  if (!error) {
    return {};
  }

  return null;
}

export async function getImage({
  id,
  userId,
}: Pick<Image, "id"> & { userId: User["id"] }) {
  const { data, error } = await supabase
    .from("images")
    .select("*")
    .eq("profile_id", userId)
    .eq("id", id)
    .single();

  if (!error) {
    return {
      userId: data.profile_id,
      id: data.id,
      name: data.name,
      description: data.description,
      cloudflare_id: data.cloudflare_id,
    };
  }

  return null;
}
