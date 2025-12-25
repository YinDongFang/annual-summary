'use client'

import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { Music } from 'lucide-react'
import { gsap } from 'gsap'

interface ConcertSectionProps {
  concerts: any[]
}

export function ConcertSection({ concerts }: ConcertSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const tl = gsap.timeline()

    // 设置初始状态
    gsap.set(headerRef.current, { opacity: 0, y: 30 })
    gsap.set(cardsRef.current, { opacity: 0, x: -50, rotationY: -15 })

    // 动画序列
    tl.to(headerRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    }).to(cardsRef.current, {
      opacity: 1,
      x: 0,
      rotationY: 0,
      duration: 0.7,
      stagger: 0.15,
      ease: 'power3.out',
    })
  }, [concerts])

  return (
    <section
      ref={containerRef}
      className="h-screen flex items-center justify-center px-4 py-20 overflow-y-auto bg-white/50 dark:bg-gray-800/50"
    >
      <div className="container mx-auto max-w-6xl">
        <div ref={headerRef} className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="h-8 w-8 text-purple-500" />
            <h2 className="text-4xl md:text-5xl font-bold">演唱会记录</h2>
          </div>
          <p className="text-muted-foreground text-lg">
            共参加了 <strong className="text-foreground">{concerts.length}</strong> 场演唱会
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {concerts.map((concert, index) => (
            <div
              key={concert.id}
              ref={(el) => {
                if (el) cardsRef.current[index] = el
              }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                {concert.poster_url && (
                  <div className="relative w-full aspect-video">
                    <Image
                      src={concert.poster_url}
                      alt={concert.artist}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{concert.artist}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {concert.date && (
                      <div>日期: {new Date(concert.date).toLocaleDateString('zh-CN')}</div>
                    )}
                    {concert.venue && <div>场馆: {concert.venue}</div>}
                  </div>
                  {concert.summary && (
                    <p className="mt-4 text-sm text-muted-foreground line-clamp-3">
                      {concert.summary}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

