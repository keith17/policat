const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://ncyeaiszaknolmnkejco.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jeWVhaXN6YWtub2xtbmtlamNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MTc3OTIsImV4cCI6MjA5MjA5Mzc5Mn0.b2tayNA5bEcAnG20q1c7FSkWSipSK1mGztIY8Xnx7b8'
);

async function test() {
  const { data, error } = await supabase.from('events').select('*').eq('slug', 'event-0edb91').single();
  console.log("EVENT RESULT:");
  console.log(data);
  console.log(error);
}
test();
