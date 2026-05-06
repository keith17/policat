const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: admin } = await supabase.from('profiles').select('email, is_admin').eq('email', 'koesig@gmail.com');
  console.log('Admin profile:', admin);
  
  const { data: mkts } = await supabase.from('markets').select('id, title, is_featured, status');
  console.log('Markets:', mkts);
}
run();
