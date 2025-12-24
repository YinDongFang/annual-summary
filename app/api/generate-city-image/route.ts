import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { city, country } = body

    if (!city || !country) {
      return NextResponse.json(
        { error: 'City and country are required' },
        { status: 400 }
      )
    }

    // 使用 DALL-E 生成城市个性化图片
    const prompt = `A beautiful, romantic illustration of ${city}, ${country}. The style should be warm, artistic, and suitable for a couple's travel memory. Include iconic landmarks or scenery of the city. The image should evoke feelings of love and adventure.`

    try {
      const response = await openai.images.generate({
        model: 'openai/dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      })

      const imageUrl = response.data[0]?.url

      if (!imageUrl) {
        return NextResponse.json(
          { error: 'Failed to generate image' },
          { status: 500 }
        )
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
        // 如果上传失败，返回原始 URL
        return NextResponse.json({ url: imageUrl })
      }

      const { data: urlData } = supabaseAdmin.storage
        .from('images')
        .getPublicUrl(filePath)

      return NextResponse.json({ url: urlData.publicUrl })
    } catch (error) {
      console.error('Error generating city image:', error)
      return NextResponse.json(
        { error: 'Failed to generate city image' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in generate-city-image API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

