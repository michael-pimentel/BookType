// ============================================
// Supabase Connection Verification Script
// Tests that environment variables and database connection work
// Run with: npx tsx scripts/test-supabase-connection.ts
// ============================================

import { createServerClient, createServiceRoleClient } from '../src/lib/supabase'

// Note: Environment variables are loaded automatically by Next.js
// If running as standalone script, ensure .env.local exists

async function testConnection() {
  console.log('🔍 Testing Supabase Connection...\n')

  // Check environment variables
  console.log('📋 Checking environment variables...')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing')
    process.exit(1)
  }
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl.substring(0, 30) + '...')

  if (!supabaseAnonKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing')
    process.exit(1)
  }
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey.substring(0, 20) + '...')

  if (!supabaseServiceRoleKey) {
    console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY is missing (optional for admin operations)')
  } else {
    console.log('✅ SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey.substring(0, 20) + '...')
  }

  console.log('\n🔌 Testing database connection...\n')

  try {
    // Test server client (anon key)
    console.log('1️⃣ Testing server client (anon key)...')
    const serverClient = createServerClient()

    // Test: List profiles (should work if RLS allows it)
    const { data: profiles, error: profilesError } = await serverClient
      .from('profiles')
      .select('id, username')
      .limit(5)

    if (profilesError) {
      console.error('❌ Error querying profiles:', profilesError.message)
      console.error('   This might be expected if RLS is blocking access')
    } else {
      console.log(`✅ Server client working - Found ${profiles?.length || 0} profiles`)
      if (profiles && profiles.length > 0) {
        console.log(`   Sample: ${profiles[0].username}`)
      }
    }

    // Test: Check leaderboard
    console.log('\n2️⃣ Testing leaderboard query...')
    const { data: leaderboard, error: leaderboardError } = await serverClient
      .from('leaderboard')
      .select('user_id, books_completed, average_wpm')
      .limit(5)

    if (leaderboardError) {
      console.error('❌ Error querying leaderboard:', leaderboardError.message)
    } else {
      console.log(`✅ Leaderboard query working - Found ${leaderboard?.length || 0} entries`)
    }

    // Test: Check books table
    console.log('\n3️⃣ Testing books query...')
    const { data: books, error: booksError } = await serverClient
      .from('books')
      .select('id, title, author')
      .limit(5)

    if (booksError) {
      console.error('❌ Error querying books:', booksError.message)
    } else {
      console.log(`✅ Books query working - Found ${books?.length || 0} books`)
      if (books && books.length > 0) {
        console.log(`   Sample: "${books[0].title}" by ${books[0].author}`)
      }
    }

    // Test service role client if available
    if (supabaseServiceRoleKey) {
      console.log('\n4️⃣ Testing service role client (admin access)...')
      try {
        const serviceClient = createServiceRoleClient()

        // Test: Count users (admin operation)
        const { data: { users }, error: usersError } = await serviceClient.auth.admin.listUsers()

        if (usersError) {
          console.error('❌ Error with service role client:', usersError.message)
        } else {
          console.log(`✅ Service role client working - Found ${users?.length || 0} users`)
        }
      } catch (error) {
        console.error('❌ Service role client error:', error instanceof Error ? error.message : 'Unknown error')
      }
    }

    // Verify tables exist
    console.log('\n5️⃣ Verifying tables exist...')
    const tables = ['profiles', 'friends', 'leaderboard', 'books', 'progress', 'achievements', 'typing_sessions']
    
    for (const table of tables) {
      const { error: tableError } = await serverClient
        .from(table)
        .select('*')
        .limit(1)

      if (tableError) {
        // Check if it's just an RLS error or if table doesn't exist
        if (tableError.message.includes('does not exist') || tableError.message.includes('relation')) {
          console.error(`❌ Table "${table}" does not exist - Run migration!`)
        } else {
          console.log(`⚠️  Table "${table}" exists but query failed (likely RLS): ${tableError.message}`)
        }
      } else {
        console.log(`✅ Table "${table}" exists and accessible`)
      }
    }

    console.log('\n✅ Connection test completed!')
    console.log('\n💡 Next steps:')
    console.log('   - If tables are missing, run: supabase/migrations/001_initial_schema.sql')
    console.log('   - If you see RLS errors, verify policies are set up correctly')
    console.log('   - Run seed script: npx tsx scripts/seed-database.ts')

  } catch (error) {
    console.error('\n❌ Connection test failed:', error)
    if (error instanceof Error) {
      console.error('   Error:', error.message)
    }
    process.exit(1)
  }
}

// Run test
testConnection()

