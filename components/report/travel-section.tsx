'use client'

import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import { gsap } from 'gsap'

interface TravelSectionProps {
  travels: any[]
}

export function TravelSection({ travels }: TravelSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const tl = gsap.timeline()

    // 设置初始状态
    gsap.set(headerRef.current, { opacity: 0, y: 30 })
    gsap.set(cardsRef.current, { opacity: 0, scale: 0.8, rotation: -5 })

    // 动画序列
    tl.to(headerRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    }).to(cardsRef.current, {
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 0.7,
      stagger: 0.2,
      ease: 'elastic.out(1, 0.5)',
    })
  }, [travels])

  return (
    <section
      ref={containerRef}
      className="h-screen flex items-center justify-center px-4 py-20 overflow-y-auto"
    >
      <div className="container mx-auto max-w-6xl">
        <div ref={headerRef} className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MapPin className="h-8 w-8 text-blue-500" />
            <h2 className="text-4xl md:text-5xl font-bold">旅行记录</h2>
          </div>
          <p className="text-muted-foreground text-lg">
            共去了 <strong className="text-foreground">{travels.length}</strong> 个地方
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {travels.map((travel, index) => (
            <div
              key={travel.id}
              ref={(el) => {
                if (el) cardsRef.current[index] = el
              }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                {travel.ai_image_url && (
                  <div className="relative w-full aspect-video">
                    <Image
                      src={travel.ai_image_url}
                      alt={`${travel.city}, ${travel.country}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {travel.city}, {travel.country}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {travel.date && (
                      <div className="text-sm text-muted-foreground">
                        日期: {new Date(travel.date).toLocaleDateString('zh-CN')}
                      </div>
                    )}
                    {travel.photos && travel.photos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {travel.photos.slice(0, 6).map((photo: string, index: number) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-lg overflow-hidden"
                          >
                            <Image
                              src={photo}
                              alt={`Photo ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    {travel.summary && (
                      <p className="text-sm text-muted-foreground">
                        {travel.summary}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

