// ============================================
// Database Seed Script
// Seed the database with sample data for development/testing
// Run with: npx tsx scripts/seed-database.ts
// ============================================

import { createServiceRoleClient } from '../src/lib/supabase'

/**
 * Seed the database with sample data
 * Note: This requires existing users in auth.users
 * In production, users sign up through the app
 */
async function seedDatabase() {
  console.log('🌱 Starting database seed...')

  // Use service role client for admin operations (bypasses RLS)
  const supabase = createServiceRoleClient()

  try {
    // Check if we have any users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError || !users || users.length === 0) {
      console.log('⚠️  No users found. Please create users first through the app.')
      console.log('   Users are automatically created when they sign up.')
      return
    }

    console.log(`✅ Found ${users.length} user(s)`)

    // Seed profiles (update existing ones)
    console.log('\n📝 Updating profiles...')
    for (const user of users.slice(0, 5)) { // Limit to first 5 users
      const username = user.user_metadata?.username || `user_${user.id.substring(0, 8)}`
      const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || username

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username,
          display_name: displayName,
          bio: `I love typing books! This is a sample bio for ${displayName}.`,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
        }, { onConflict: 'id' })

      if (profileError) {
        console.error(`❌ Error updating profile for ${username}:`, profileError.message)
      } else {
        console.log(`✅ Updated profile for ${username}`)
      }
    }

    // Seed leaderboard entries
    console.log('\n🏆 Seeding leaderboard...')
    for (let i = 0; i < Math.min(users.length, 5); i++) {
      const user = users[i]
      const booksCompleted = Math.floor(Math.random() * 20) + 1
      const averageWpm = Math.floor(Math.random() * 50) + 60 // 60-110 WPM
      const totalCharsTyped = booksCompleted * (Math.floor(Math.random() * 50000) + 10000)
      const totalTimeSeconds = Math.floor(totalCharsTyped / (averageWpm * 5)) * 60

      const { error: leaderboardError } = await supabase
        .from('leaderboard')
        .upsert({
          user_id: user.id,
          books_completed: booksCompleted,
          average_wpm: averageWpm,
          total_chars_typed: totalCharsTyped,
          total_time_seconds: totalTimeSeconds
        }, { onConflict: 'user_id' })

      if (leaderboardError) {
        console.error(`❌ Error updating leaderboard for user ${user.id}:`, leaderboardError.message)
      } else {
        console.log(`✅ Updated leaderboard for user ${i + 1}`)
      }
    }

    // Seed friend relationships
    console.log('\n👥 Seeding friends...')
    if (users.length >= 2) {
      // Create some friend relationships
      const friendPairs = [
        [users[0].id, users[1].id],
        [users[0].id, users[2]?.id],
        [users[1].id, users[2]?.id]
      ].filter(pair => pair[0] && pair[1])

      for (const [userId1, userId2] of friendPairs) {
        if (!userId1 || !userId2) continue

        // Check if friendship already exists
        const { data: existing } = await supabase
          .from('friends')
          .select('id')
          .or(`and(user_id.eq.${userId1},friend_id.eq.${userId2}),and(user_id.eq.${userId2},friend_id.eq.${userId1})`)
          .single()

        if (!existing) {
          const { error: friendError } = await supabase
            .from('friends')
            .insert({
              user_id: userId1,
              friend_id: userId2,
              status: 'accepted',
              requested_by: userId1
            })

          if (friendError) {
            console.error(`❌ Error creating friendship:`, friendError.message)
          } else {
            console.log(`✅ Created friendship between users`)
          }
        }
      }
    }

    // Seed some achievements
    console.log('\n🏅 Seeding achievements...')
    for (const user of users.slice(0, 3)) {
      const achievements = ['first_book', 'bookworm'] as const

      for (const achievementType of achievements) {
        const { error: achievementError } = await supabase
          .from('achievements')
          .upsert({
            user_id: user.id,
            achievement_type: achievementType
          }, { onConflict: 'user_id,achievement_type' })

        if (achievementError) {
          console.error(`❌ Error creating achievement:`, achievementError.message)
        } else {
          console.log(`✅ Created achievement ${achievementType} for user`)
        }
      }
    }

    console.log('\n✅ Database seed completed!')
    console.log('\n💡 Note: This is sample data for development.')
    console.log('   In production, data is created through the app as users interact.')

  } catch (error) {
    console.error('❌ Seed error:', error)
    process.exit(1)
  }
}

// Run seed
seedDatabase()

