import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, artist } = body // type: 'movie' | 'concert'

    let searchQuery = ''
    if (type === 'movie') {
      searchQuery = title
    } else if (type === 'concert') {
      searchQuery = artist
    } else {
      return NextResponse.json(
        { error: 'Invalid type' },
        { status: 400 }
      )
    }

    // 使用 TMDB API 搜索电影海报
    // 注意：需要 TMDB API Key，这里使用公开的 API
    const tmdbApiKey = process.env.TMDB_API_KEY || '1f54bd990f1cdfb230adb312546d765d' // 示例 key，建议使用自己的
    const tmdbUrl = type === 'movie'
      ? `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(searchQuery)}&language=zh-CN`
      : `https://api.themoviedb.org/3/search/person?api_key=${tmdbApiKey}&query=${encodeURIComponent(searchQuery)}&language=zh-CN`

    try {
      const response = await fetch(tmdbUrl)
      const data = await response.json()

      let posterUrl = null

      if (type === 'movie' && data.results && data.results.length > 0) {
        const movie = data.results[0]
        if (movie.poster_path) {
          posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        }
      } else if (type === 'concert' && data.results && data.results.length > 0) {
        // 对于演唱会，可以尝试获取艺术家的照片或使用默认图片
        const person = data.results[0]
        if (person.profile_path) {
          posterUrl = `https://image.tmdb.org/t/p/w500${person.profile_path}`
        }
      }

      // 如果找到海报，下载并上传到 Supabase Storage
      if (posterUrl) {
        const imageResponse = await fetch(posterUrl)
        const imageBuffer = await imageResponse.arrayBuffer()
        const buffer = Buffer.from(imageBuffer)

        const fileName = `${type}-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
        const filePath = `posters/${fileName}`

        const { error: uploadError } = await supabaseAdmin.storage
          .from('images')
          .upload(filePath, buffer, {
            contentType: 'image/jpeg',
            upsert: false,
          })

        if (!uploadError) {
          const { data: urlData } = supabaseAdmin.storage
            .from('images')
            .getPublicUrl(filePath)

          return NextResponse.json({ url: urlData.publicUrl })
        }
      }

      // 如果无法获取海报，返回 null
      return NextResponse.json({ url: null })
    } catch (error) {
      console.error('Error fetching poster:', error)
      return NextResponse.json({ url: null })
    }
  } catch (error) {
    console.error('Error in fetch-poster API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

