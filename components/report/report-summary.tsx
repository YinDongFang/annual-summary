'use client'

import { useEffect, useRef } from 'react'
import { Heart, Sparkles } from 'lucide-react'
import { gsap } from 'gsap'

interface ReportSummaryProps {
  movies: any[]
  concerts: any[]
  travels: any[]
}

export function ReportSummary({ movies, concerts, travels }: ReportSummaryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)
  const totalItems = movies.length + concerts.length + travels.length

  useEffect(() => {
    const tl = gsap.timeline()

    // 设置初始状态
    gsap.set([iconRef.current, titleRef.current, contentRef.current, footerRef.current], {
      opacity: 0,
    })
    gsap.set(iconRef.current, { scale: 0.5, rotation: -180 })
    gsap.set([titleRef.current, contentRef.current, footerRef.current], { y: 30 })

    // 创建动画时间线
    tl.to(iconRef.current, {
      scale: 1,
      rotation: 0,
      opacity: 1,
      duration: 1,
      ease: 'back.out(1.7)',
    })
      .to(
        titleRef.current,
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
        },
        '-=0.5'
      )
      .to(
        contentRef.current,
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
        },
        '-=0.6'
      )
      .to(
        footerRef.current,
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
        },
        '-=0.6'
      )

    // 图标闪烁动画
    gsap.to(iconRef.current, {
      scale: 1.1,
      duration: 1.5,
      ease: 'power1.inOut',
      repeat: -1,
      yoyo: true,
    })
  }, [])

  return (
    <section
      ref={containerRef}
      className="h-screen flex items-center justify-center px-4 py-20"
    >
      <div className="container mx-auto max-w-4xl text-center space-y-8">
        <div ref={iconRef}>
          <Sparkles className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        </div>
        <h2 ref={titleRef} className="text-4xl md:text-5xl font-bold">
          年度总结
        </h2>
        <div ref={contentRef} className="space-y-4 text-lg text-muted-foreground">
          <p>
            这一年，你们共同创造了 <strong className="text-foreground">{totalItems}</strong> 个美好回忆
          </p>
          {movies.length > 0 && (
            <p>
              观看了 <strong className="text-foreground">{movies.length}</strong> 部电影
            </p>
          )}
          {concerts.length > 0 && (
            <p>
              参加了 <strong className="text-foreground">{concerts.length}</strong> 场演唱会
            </p>
          )}
          {travels.length > 0 && (
            <p>
              探索了 <strong className="text-foreground">{travels.length}</strong> 个地方
            </p>
          )}
        </div>
        <div ref={footerRef} className="pt-8">
          <div className="flex items-center justify-center gap-2 text-pink-500">
            <Heart className="h-6 w-6 fill-pink-500" />
            <p className="text-xl font-semibold">愿你们的爱情如这些回忆般美好</p>
            <Heart className="h-6 w-6 fill-pink-500" />
          </div>
        </div>
      </div>
    </section>
  )
}

