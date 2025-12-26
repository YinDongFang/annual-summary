import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateShareCode } from '@/lib/share-code'
import { openai } from '@/lib/openai'
import ColorThief from 'colorthief'

// 提取图片主题色
async function extractDominantColor(imageUrl: string): Promise<string | undefined> {
  try {
    // 下载图片
    const response = await fetch(imageUrl)
    if (!response.ok) {
      return undefined
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // 使用 colorthief 提取颜色
    // 在 Node.js 中，colorthief 可以处理 Buffer
    const colorThief = new ColorThief()
    // @ts-expect-error - colorthief 在 Node.js 中支持 Buffer，但类型定义不完整
    const color = colorThief.getColor(buffer)
    
    if (Array.isArray(color) && color.length >= 3) {
      const [r, g, b] = color
      return `rgb(${r},${g},${b})`
    }
    
    return undefined
  } catch (error) {
    console.error('Error extracting color:', error)
    return undefined
  }
}

// 从 TMDB API 获取电影信息
async function fetchMovieInfo(title: string) {
  try {
    const tmdbBearerToken = process.env.TMDB_BEARER_TOKEN
    if (!tmdbBearerToken) {
      return null
    }

    const currentYear = new Date().getFullYear()
    const tmdbApiUrl = `${
      process.env.TMDB_API_URL
    }/3/search/movie?query=${encodeURIComponent(
      title
    )}&include_adult=false&language=zh-CN&primary_release_year=${currentYear}&page=1`

    const response = await fetch(tmdbApiUrl, {
      headers: {
        Authorization: `Bearer ${tmdbBearerToken}`,
        accept: 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (
      data.results &&
      Array.isArray(data.results) &&
      data.results.length > 0
    ) {
      const movieData = data.results[0]
      const movieId = movieData.id
      const imagePath = movieData.backdrop_path || movieData.poster_path
      if (!imagePath) {
        return null
      }

      const posterUrl = `${process.env.TMDB_IMAGE_URL}/t/p/w600_and_h600_face${imagePath}`

      // 获取电影详细信息
      let runtime: number | undefined
      let genres: string[] | undefined
      let backdropUrl: string | undefined
      let dominantColor: string | undefined
      let logoUrl: string | undefined

      try {
        // 获取电影详细信息
        const detailResponse = await fetch(
          `${process.env.TMDB_API_URL}/3/movie/${movieId}?language=zh-CN`,
          {
            headers: {
              Authorization: `Bearer ${tmdbBearerToken}`,
              accept: 'application/json',
            },
          }
        )

        if (detailResponse.ok) {
          const detailData = await detailResponse.json()
          runtime = detailData.runtime || undefined
          genres = detailData.genres?.map((g: { name: string }) => g.name) || undefined
          if (detailData.backdrop_path) {
            backdropUrl = `${process.env.TMDB_IMAGE_URL}/t/p/w1280${detailData.backdrop_path}`
            // 提取主题色
            dominantColor = await extractDominantColor(backdropUrl)
          }
        }

        // 获取电影图片（logo）
        const imagesResponse = await fetch(
          `${process.env.TMDB_API_URL}/3/movie/${movieId}/images?language=zh-CN`,
          {
            headers: {
              Authorization: `Bearer ${tmdbBearerToken}`,
              accept: 'application/json',
            },
          }
        )

        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json()
          if (imagesData.logos && imagesData.logos.length > 0) {
            const logoPath = imagesData.logos[0].file_path
            logoUrl = `${process.env.TMDB_IMAGE_URL}/t/p/w500${logoPath}`
          }
        }
      } catch (error) {
        console.error('Error fetching movie details:', error)
        // 继续处理，即使获取详细信息失败
      }

      return {
        title: movieData.title,
        releaseDate: movieData.release_date,
        posterUrl: posterUrl,
        movieId: movieId,
        logoUrl: logoUrl,
        runtime: runtime,
        genres: genres,
        backdropUrl: backdropUrl,
        dominantColor: dominantColor,
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching movie info:', error)
    return null
  }
}

// 从 TMDB API 获取演唱会海报
async function fetchConcertPoster(artist: string) {
  try {
    const tmdbBearerToken = process.env.TMDB_BEARER_TOKEN
    if (!tmdbBearerToken) {
      return null
    }

    const tmdbUrl = `${process.env.TMDB_API_URL}/3/search/person?query=${encodeURIComponent(artist)}&language=zh-CN`

    const response = await fetch(tmdbUrl, {
      headers: {
        Authorization: `Bearer ${tmdbBearerToken}`,
        accept: 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    if (data.results && data.results.length > 0) {
      const person = data.results[0]
      if (person.profile_path) {
        return `${process.env.TMDB_IMAGE_URL}/t/p/w500${person.profile_path}`
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching concert poster:', error)
    return null
  }
}

// 生成城市图片
async function generateCityImage(city: string, country: string) {
  try {
    const prompt = `A beautiful, romantic illustration of ${city}, ${country}. The style should be warm, artistic, and suitable for a couple's travel memory. Include iconic landmarks or scenery of the city. The image should evoke feelings of love and adventure.`

    const response = await openai.images.generate({
      model: 'openai/dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    })

    const imageUrl = response.data?.[0]?.url
    if (!imageUrl) {
      return null
    }

    // 下载图片并上传到 Supabase Storage
    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    const buffer = Buffer.from(imageBuffer)

    const fileName = `city-${city}-${Date.now()}-${Math.random().toString(36).substring(7)}.png`
    const filePath = `city-images/${fileName}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('images')
      .upload(filePath, buffer, {
        contentType: 'image/png',
        upsert: false,
      })

    if (uploadError) {
      console.error('Error uploading city image:', uploadError)
      return imageUrl // 如果上传失败，返回原始 URL
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('images')
      .getPublicUrl(filePath)

    return urlData.publicUrl
  } catch (error) {
    console.error('Error generating city image:', error)
    return null
  }
}

// 生成标签
async function generateTags(type: 'movie' | 'concert' | 'travel', data: any) {
  try {
    let prompt = ''

    if (type === 'movie') {
      prompt = `为以下电影生成3-5个个性化标签，用中文，用逗号分隔，只返回标签，不要其他文字：
电影名称：${data.title}
${data.date ? `观看日期：${data.date}` : ''}
${data.rating ? `评分：${data.rating}/5` : ''}

标签应该体现观影感受、电影类型、情感色彩等。`
    } else if (type === 'concert') {
      prompt = `为以下演唱会生成3-5个个性化标签，用中文，用逗号分隔，只返回标签，不要其他文字：
艺术家：${data.artist}
${data.date ? `日期：${data.date}` : ''}
${data.venue ? `场馆：${data.venue}` : ''}

标签应该体现音乐风格、现场氛围、情感体验等。`
    } else if (type === 'travel') {
      prompt = `为以下旅行生成3-5个个性化标签，用中文，用逗号分隔，只返回标签，不要其他文字：
城市：${data.city}
国家：${data.country}
${data.date ? `日期：${data.date}` : ''}

标签应该体现旅行特色、城市风情、旅行体验等。`
    }

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    })

    const tagsText = completion.choices[0]?.message?.content || ''
    const tags = tagsText
      .split(/[,，]/)
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    return tags
  } catch (error) {
    console.error('Error generating tags:', error)
    return []
  }
}

// 生成总结
async function generateSummary(type: 'movie' | 'concert' | 'travel', items: any[]) {
  try {
    let prompt = ''

    if (type === 'movie') {
      const moviesList = items.map((m: any) => `- ${m.title}${m.date ? ` (${m.date})` : ''}${m.rating ? ` - 评分：${m.rating}/5` : ''}`).join('\n')
      prompt = `为以下观影记录生成一段温馨、个性化的年度总结（100-150字），用中文，用第二人称"你们"：
${moviesList}

总结应该体现观影的回忆、情感体验、共同喜好等，语言要温暖有感情。`
    } else if (type === 'concert') {
      const concertsList = items.map((c: any) => `- ${c.artist}${c.date ? ` (${c.date})` : ''}${c.venue ? ` @ ${c.venue}` : ''}`).join('\n')
      prompt = `为以下演唱会记录生成一段温馨、个性化的年度总结（100-150字），用中文，用第二人称"你们"：
${concertsList}

总结应该体现音乐的美好、现场的氛围、共同的回忆等，语言要温暖有感情。`
    } else if (type === 'travel') {
      const travelsList = items.map((t: any) => `- ${t.city}, ${t.country}${t.date ? ` (${t.date})` : ''}`).join('\n')
      prompt = `为以下旅行记录生成一段温馨、个性化的年度总结（100-150字），用中文，用第二人称"你们"：
${travelsList}

总结应该体现旅行的美好、探索的乐趣、共同的回忆等，语言要温暖有感情。`
    }

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 300,
    })

    const summary = completion.choices[0]?.message?.content || ''
    return summary
  } catch (error) {
    console.error('Error generating summary:', error)
    return ''
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { movieList, concerts, travels } = body

    // 解析电影列表
    const successfulMovies: any[] = []
    const failedMovies: string[] = []

    if (movieList && typeof movieList === 'string') {
      // 按行分割，过滤空行和空白字符
      const titles = movieList
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)

      // 为每个电影标题查找信息
      for (const title of titles) {
        const movieInfo = await fetchMovieInfo(title)
        if (movieInfo) {
          successfulMovies.push({
            title: movieInfo.title,
            originalTitle: title,
            releaseDate: movieInfo.releaseDate,
            posterUrl: movieInfo.posterUrl,
            logoUrl: movieInfo.logoUrl || undefined,
            runtime: movieInfo.runtime || undefined,
            genres: movieInfo.genres || undefined,
            backdropUrl: movieInfo.backdropUrl || undefined,
            dominantColor: movieInfo.dominantColor || undefined,
          })
        } else {
          failedMovies.push(title)
        }
      }
    }

    // 生成唯一分享码
    const shareCode = generateShareCode()

    // 创建报告记录
    const { data: report, error: reportError } = await supabaseAdmin
      .from('reports')
      .insert({ share_code: shareCode })
      .select()
      .single()

    if (reportError) {
      console.error('Error creating report:', reportError)
      return NextResponse.json(
        { error: 'Failed to create report' },
        { status: 500 }
      )
    }

    const reportId = report.id

    // 批量插入数据
    const errors: string[] = []

    // 处理观影记录 - 生成标签
    if (successfulMovies.length > 0) {
      const moviesData = await Promise.all(
        successfulMovies.map(async (movie: any) => {
          const tags = await generateTags('movie', {
            title: movie.title,
            date: null,
            rating: null,
          })

          return {
            report_id: reportId,
            title: movie.title,
            date: null,
            release_date: movie.releaseDate || null,
            poster_url: movie.posterUrl || null,
            logo_url: movie.logoUrl || null,
            runtime: movie.runtime || null,
            genres: movie.genres || null,
            backdrop_url: movie.backdropUrl || null,
            dominant_color: movie.dominantColor || null,
            rating: null,
            tags: tags.length > 0 ? tags : null,
          }
        })
      )

      const { error: moviesError } = await supabaseAdmin
        .from('movies')
        .insert(moviesData)

      if (moviesError) {
        console.error('Error inserting movies:', moviesError)
        errors.push('Failed to save movies')
      }
    }

    // 处理演唱会记录 - 获取海报（如果没有）并生成标签
    if (concerts && concerts.length > 0) {
      const concertsData = await Promise.all(
        concerts.map(async (concert: any) => {
          // 如果没有海报，尝试从 TMDB 获取
          let posterUrl = concert.posterUrl
          if (!posterUrl && concert.artist) {
            posterUrl = await fetchConcertPoster(concert.artist)
          }

          const tags = await generateTags('concert', {
            artist: concert.artist,
            date: concert.date || null,
            venue: concert.venue || null,
          })

          return {
            report_id: reportId,
            artist: concert.artist,
            date: concert.date || null,
            venue: concert.venue || null,
            poster_url: posterUrl || null,
            tags: tags.length > 0 ? tags : null,
          }
        })
      )

      const { error: concertsError } = await supabaseAdmin
        .from('concerts')
        .insert(concertsData)

      if (concertsError) {
        console.error('Error inserting concerts:', concertsError)
        errors.push('Failed to save concerts')
      }
    }

    // 处理旅游记录 - 生成城市图片（如果没有）并生成标签
    if (travels && travels.length > 0) {
      const travelsData = await Promise.all(
        travels.map(async (travel: any) => {
          // 如果没有 AI 图片，生成一个
          let aiImageUrl = travel.aiImageUrl
          if (!aiImageUrl && travel.city && travel.country) {
            aiImageUrl = await generateCityImage(travel.city, travel.country)
          }

          const tags = await generateTags('travel', {
            city: travel.city,
            country: travel.country,
            date: travel.date || null,
          })

          return {
            report_id: reportId,
            city: travel.city,
            country: travel.country,
            date: travel.date || null,
            photos: travel.photos || [],
            ai_image_url: aiImageUrl || null,
            tags: tags.length > 0 ? tags : null,
          }
        })
      )

      const { error: travelsError } = await supabaseAdmin
        .from('travels')
        .insert(travelsData)

      if (travelsError) {
        console.error('Error inserting travels:', travelsError)
        errors.push('Failed to save travels')
      }
    }

    // 生成各类型的总结并更新到数据库
    if (successfulMovies.length > 0) {
      const movieSummary = await generateSummary(
        'movie',
        successfulMovies.map((m: any) => ({
          title: m.title,
          date: null,
          rating: null,
        }))
      )

      if (movieSummary) {
        // 更新所有电影记录的总结
        await supabaseAdmin
          .from('movies')
          .update({ summary: movieSummary })
          .eq('report_id', reportId)
      }
    }

    if (concerts && concerts.length > 0) {
      const concertSummary = await generateSummary(
        'concert',
        concerts.map((c: any) => ({
          artist: c.artist,
          date: c.date || null,
          venue: c.venue || null,
        }))
      )

      if (concertSummary) {
        // 更新所有演唱会记录的总结
        await supabaseAdmin
          .from('concerts')
          .update({ summary: concertSummary })
          .eq('report_id', reportId)
      }
    }

    if (travels && travels.length > 0) {
      const travelSummary = await generateSummary(
        'travel',
        travels.map((t: any) => ({
          city: t.city,
          country: t.country,
          date: t.date || null,
        }))
      )

      if (travelSummary) {
        // 更新所有旅行记录的总结
        await supabaseAdmin
          .from('travels')
          .update({ summary: travelSummary })
          .eq('report_id', reportId)
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.join(', ') },
        { status: 500 }
      )
    }

    return NextResponse.json({
      shareCode,
      movies: {
        successful: successfulMovies,
        failed: failedMovies,
      },
    })
  } catch (error) {
    console.error('Error in submit API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

