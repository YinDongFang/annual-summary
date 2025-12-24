import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data, items } = body // type: 'movie' | 'concert' | 'travel'

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
      temperature: 0.8,
      max_tokens: 300,
    })

    const summary = completion.choices[0]?.message?.content || ''

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error generating summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}

