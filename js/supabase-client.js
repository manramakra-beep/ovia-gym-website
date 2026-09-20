// ==========================================================================
// OVIA GYM — Supabase client
// Fill in your project URL and anon (public) key below.
// Find these in Supabase Dashboard → Project Settings → API.
// The anon key is safe to expose in frontend code — access is controlled
// by Row Level Security (RLS) policies set on each table, not by hiding
// this key.
// ==========================================================================

const SUPABASE_URL = "https://vwdoinjnkejrnhzxogov.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3ZG9pbmpua2Vqcm5oenhvZ292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4NzkwMzAsImV4cCI6MjEwNTQ1NTAzMH0.ZHFIVcjfSBJmkLCGJJOh0CrDwovOxMkBZ2UHQFkrx20";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
