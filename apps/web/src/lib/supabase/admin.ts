import { createClient } from '@supabase/supabase-js'

/**
 * Service role key kullanan Supabase admin client.
 * Sadece server action'larda admin işlemleri (createUser, deleteUser vb.) için kullanılır.
 * Asla client'a sızdırılmamalıdır.
 * NOT: Auth session/cookie yönetimi gerekmez, bu yüzden @supabase/supabase-js'in
 * doğrudan createClient'ı kullanılır.
 */
export async function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}