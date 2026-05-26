import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createClient } from "@supabase/supabase-js";

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // type can be 'market' or 'event'
    const type = searchParams.get('type');
    const slug = searchParams.get('slug');

    if (!type || !slug) {
      return new Response('Missing parameters', { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let title = "PoliCat 예측 마켓";
    let categoryLabel = "예측";
    let yesProb = 50;
    let noProb = 50;
    
    if (type === 'market') {
      const { data: market } = await supabase.from('markets').select('*').eq('slug', slug).single();
      if (market) {
        title = market.title;
        categoryLabel = market.category === 'economy' ? '경제' : market.category === 'politics' ? '정치' : market.category === 'society' ? '사회' : '스포츠';
        
        const total = market.yes_pool + market.no_pool;
        if (total > 0) {
          yesProb = Math.round((market.yes_pool / total) * 100);
          noProb = 100 - yesProb;
        }
      }
    } else if (type === 'event') {
      const { data: event } = await supabase.from('events').select('title').eq('slug', slug).single();
      if (event) {
        title = event.title;
        categoryLabel = "다중 후보 이벤트";
      }
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#0f172a',
            padding: '60px 80px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                backgroundColor: '#3b82f6', color: 'white', padding: '8px 16px', 
                borderRadius: '8px', fontSize: '24px', fontWeight: 'bold' 
              }}>
                {categoryLabel}
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: 'white', letterSpacing: '-0.02em' }}>
              POLICAT
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '64px',
              fontWeight: '900',
              color: 'white',
              lineHeight: 1.3,
              marginTop: '40px',
              marginBottom: '40px',
              wordWrap: 'break-word',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {title}
          </div>

          {/* Probabilities (Only for markets) */}
          {type === 'market' && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '64px', fontWeight: '900', color: '#10b981' }}>{yesProb}</span>
                  <span style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', marginLeft: '8px' }}>% YES</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '64px', fontWeight: '900', color: '#f43f5e' }}>{noProb}</span>
                  <span style={{ fontSize: '32px', fontWeight: '700', color: '#f43f5e', marginLeft: '8px' }}>% NO</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ display: 'flex', width: '100%', height: '24px', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', backgroundColor: '#10b981', width: `${yesProb}%`, height: '100%' }}></div>
                <div style={{ display: 'flex', backgroundColor: '#f43f5e', width: `${noProb}%`, height: '100%' }}></div>
              </div>
            </div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
