import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body // type: 'movie' | 'concert' | 'travel'

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
    } else {
      return NextResponse.json(
        { error: 'Invalid type' },
        { status: 400 }
      )
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

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Error generating tags:', error)
    return NextResponse.json(
      { error: 'Failed to generate tags' },
      { status: 500 }
    )
  }
}

