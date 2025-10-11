import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This handler will be called by Supabase after a successful login/signup
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    // 1. Create a server-side Supabase client that can manage cookies
    const cookieStore = cookies();
    // Assuming your database type is named 'Database' (from src/types/database.ts)
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // 2. Exchange the authorization code for a session
    // This function automatically reads the code and SETS the session cookies
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 3. Redirect to the main library page or home page
  // The session is now stored in the user's cookies.
  return NextResponse.redirect(requestUrl.origin + '/library');
}