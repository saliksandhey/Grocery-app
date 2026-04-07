import { createClient } from '@supabase/supabase-js'

// We are hardcoding the public anon key here because Vercel Environment Variables were completely failing to inject during the build process.
// Note: This is safe because the Supabase 'anon' key is explicitly designed to be publicly exposed to the browser.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bxmoeiuxrbdngemfhfhg.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_xu5dfpUWdU7w10giw1WyJA_XV3N7WnX'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
})
