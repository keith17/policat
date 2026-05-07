const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://ncyeaiszaknolmnkejco.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jeWVhaXN6YWtub2xtbmtlamNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MTc3OTIsImV4cCI6MjA5MjA5Mzc5Mn0.b2tayNA5bEcAnG20q1c7FSkWSipSK1mGztIY8Xnx7b8';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Fetching...");
supabase.from('events').select('id').limit(1).then(r => {
  console.log("Success:", r);
  process.exit(0);
}).catch(e => {
  console.error("Error:", e);
  process.exit(1);
});
