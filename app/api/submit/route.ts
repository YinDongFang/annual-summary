import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateShareCode } from '@/lib/share-code'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { movies, concerts, travels } = body

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

    // 插入观影记录
    if (movies && movies.length > 0) {
      const moviesData = movies.map((movie: any) => ({
        report_id: reportId,
        title: movie.title,
        date: movie.date || null,
        poster_url: movie.posterUrl || null,
        rating: movie.rating || null,
      }))

      const { error: moviesError } = await supabaseAdmin
        .from('movies')
        .insert(moviesData)

      if (moviesError) {
        console.error('Error inserting movies:', moviesError)
        errors.push('Failed to save movies')
      }
    }

    // 插入演唱会记录
    if (concerts && concerts.length > 0) {
      const concertsData = concerts.map((concert: any) => ({
        report_id: reportId,
        artist: concert.artist,
        date: concert.date || null,
        venue: concert.venue || null,
        poster_url: concert.posterUrl || null,
      }))

      const { error: concertsError } = await supabaseAdmin
        .from('concerts')
        .insert(concertsData)

      if (concertsError) {
        console.error('Error inserting concerts:', concertsError)
        errors.push('Failed to save concerts')
      }
    }

    // 插入旅游记录
    if (travels && travels.length > 0) {
      const travelsData = travels.map((travel: any) => ({
        report_id: reportId,
        city: travel.city,
        country: travel.country,
        date: travel.date || null,
        photos: travel.photos || [],
        ai_image_url: travel.aiImageUrl || null,
      }))

      const { error: travelsError } = await supabaseAdmin
        .from('travels')
        .insert(travelsData)

      if (travelsError) {
        console.error('Error inserting travels:', travelsError)
        errors.push('Failed to save travels')
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.join(', ') },
        { status: 500 }
      )
    }

    return NextResponse.json({ shareCode })
  } catch (error) {
    console.error('Error in submit API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

