import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseApiKey = process.env.SUPABASE_API_KEY!

// 服务端客户端（使用 service role key，有完整权限）
export const supabaseAdmin = createClient(supabaseUrl, supabaseApiKey)

