import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log("Checking Database Connection...");
  
  // Test profiles table
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(1);
  if (pError) console.error("❌ profiles table error:", pError.message);
  else console.log("✅ profiles table exists!");

  // Test user_movies table
  const { data: movies, error: mError } = await supabase.from('user_movies').select('*').limit(1);
  if (mError) console.error("❌ user_movies table error:", mError.message);
  else console.log("✅ user_movies table exists!");

  // Test user_activity table
  const { data: activity, error: aError } = await supabase.from('user_activity').select('*').limit(1);
  if (aError) console.error("❌ user_activity table error:", aError.message);
  else console.log("✅ user_activity table exists!");
}

testDatabase();
