const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ncyeaiszaknolmnkejco.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jeWVhaXN6YWtub2xtbmtlamNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MTc3OTIsImV4cCI6MjA5MjA5Mzc5Mn0.b2tayNA5bEcAnG20q1c7FSkWSipSK1mGztIY8Xnx7b8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: events, error: eErr } = await supabase.from('events').select('id, title, created_at').order('created_at', { ascending: true });
  console.log('Events:', events?.length, eErr);
  
  if (events) {
    const titleMap = {};
    for (const ev of events) {
      if (!titleMap[ev.title]) titleMap[ev.title] = [];
      titleMap[ev.title].push(ev);
    }
    
    for (const [title, evs] of Object.entries(titleMap)) {
      if (evs.length > 1) {
        console.log(`Duplicate Event: "${title}" - count: ${evs.length}`);
        // keep the first one, delete the rest
        const toDelete = evs.slice(1).map(e => e.id);
        console.log('To delete IDs:', toDelete);
        
        for (const id of toDelete) {
          const { error: delErr } = await supabase.from('events').delete().eq('id', id);
          console.log(`Delete event ${id} result:`, delErr ? delErr.message : 'Success');
        }
      }
    }
  }

  const { data: markets, error: mErr } = await supabase.from('markets').select('id, title, created_at').order('created_at', { ascending: true });
  console.log('Markets:', markets?.length, mErr);
  
  if (markets) {
    const titleMap = {};
    for (const m of markets) {
      if (!titleMap[m.title]) titleMap[m.title] = [];
      titleMap[m.title].push(m);
    }
    
    for (const [title, ms] of Object.entries(titleMap)) {
      if (ms.length > 1) {
        console.log(`Duplicate Market: "${title}" - count: ${ms.length}`);
        const toDelete = ms.slice(1).map(m => m.id);
        
        for (const id of toDelete) {
          const { error: delErr } = await supabase.from('markets').delete().eq('id', id);
          console.log(`Delete market ${id} result:`, delErr ? delErr.message : 'Success');
        }
      }
    }
  }
}

check();
