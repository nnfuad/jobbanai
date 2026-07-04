import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from("pitches")
    .select(`
      id,
      description,
      image_url,
      tags,
      likes,
      comments,
      created_at,
      author:users(name),
      pitch_likes(user_id, vote_type)
    `);
  console.log("Error:", error);
  console.log("Data:", data);
}
test();
