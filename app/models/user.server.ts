import { createClient } from "@supabase/supabase-js";
import invariant from "tiny-invariant";

export type User = { id: string; email: string, username: string};

// Abstract this away
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

invariant(
  supabaseUrl,
  "SUPABASE_URL must be set in your environment variables."
);
invariant(
  supabaseAnonKey,
  "SUPABASE_ANON_KEY must be set in your environment variables."
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function createUser(email: string, password: string, username: string) {
  const { data } = await supabase.auth.signUp({
    email,
    password,
  });

  const id = data.user?.id || "";
  const setUsername = await setProfileUsername(id, username);
  
  // get the user profile after created
  const profile = await getProfileByEmail(data.user?.email);

  return profile;
}

export async function setProfileUsername(id: string, username: string) {
  const { data, error } = await supabase
    .from("profiles")
    .update({username: username})
    .eq("id", id)
    .single();

  if (error) return null;
  if (data) return { success : true };
}

export async function getProfileById(id: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("email, id")
    .eq("id", id)
    .single();

  if (error) return null;
  if (data) return { id: data.id, email: data.email };
}

export async function getProfileByEmail(email?: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("email, id")
    .eq("email", email)
    .single();

  if (error) return null;
  if (data) return data;
}

export async function getProfileByUsername(username?: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("username, id")
    .eq("username", username)
    .single();

  if (error) return null;
  if (data) return data;
}

export async function verifyLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return undefined;
  const profile = await getProfileByEmail(data.user?.email);

  return profile;
}
