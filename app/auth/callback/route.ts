import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code       = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type       = searchParams.get('type') as EmailOtpType | null
  const next       = searchParams.get('next') ?? '/'

  const supabase = await createClient()
  let sessionError = true

  // PKCE flow (Google OAuth, 일반 로그인)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) sessionError = false
  }

  // Magic link / OTP flow (데모 로그인)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) sessionError = false
  }

  if (!sessionError) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('terms_agreed')
        .eq('id', user.id)
        .single()
      if (!profile?.terms_agreed) {
        return NextResponse.redirect(`${origin}/agree?next=${encodeURIComponent(next)}`)
      }
    }
    return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/`)
}
