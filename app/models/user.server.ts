import { createClient } from "@supabase/supabase-js";
import invariant from "tiny-invariant";

export type User = { id: string; email: string, username: string, created_at: string, instructor: boolean, club : string | null };

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
    .select("email, id, username, instructor, created_at, instructor, club")
    .eq("id", id)
    .single();
    console.log(data);
  if (error) {
    console.log(error);
    console.log("error");
  };
  if (data) return { id: data.id, email: data.email, username: data.username, instructor: data.instructor, created_at: data.created_at };
}

export async function getProfileByEmail(email?: string) {
  console.log(email);
  const { data, error } = await supabase
    .from("profiles")
    .select("email, id, username, instructor, created_at, instructor, club")
    .eq("email", email)
    .single();
    console.log(data);
  if (error) {
    console.log(error);
    console.log("error");
  };
  if (data) return data;
}

export async function getProfileByUsername(username?: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("email, id, username, instructor, created_at, updated_at")
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
  console.log("starting verify "+data.user?.email);


  const profile = await getProfileByEmail(data.user?.email);
  console.log("got user");
  console.log(profile);
  if (error) {
    console.log(error);
    console.log("error");
  };
  return profile;
}
