import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async (req, context) => {
  try {
    // Just check we can talk to Supabase — count rows in lists table
    const { count, error } = await supabase
      .from('lists')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true,
      message: 'Connected to Supabase successfully',
      listCount: count
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: '/api/test'
};