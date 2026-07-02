import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });

    const token = authHeader.replace('Bearer ', '');
    const userSupabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: userError } = await userSupabase.auth.getUser();
    if (userError || !user) return new Response(JSON.stringify({ error: 'Invalid session' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });

    const { list_id, title } = await req.json();
    if (!list_id || !title) return new Response(JSON.stringify({ error: 'list_id and title are required' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });

    const { data, error } = await userSupabase
      .from('lists')
      .update({ title: title.trim(), updated_at: new Date().toISOString() })
      .eq('id', list_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, list: data }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = { path: '/api/lists/rename' };
