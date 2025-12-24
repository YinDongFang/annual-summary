import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

// 服务端客户端（使用 service role key，有完整权限）
export const supabaseAdmin = createClient(supabaseUrl, supabasePublishableKey)

