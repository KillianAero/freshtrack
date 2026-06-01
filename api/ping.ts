import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

export default async function handler() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
  );

  const { error } = await supabase.from('food_items').select('id').limit(1);

  return new Response(
    JSON.stringify({ ok: !error, time: new Date().toISOString() }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}
