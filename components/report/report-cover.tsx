'use client'

import { useEffect, useRef } from 'react'
import { Heart } from 'lucide-react'
import { gsap } from 'gsap'

interface ReportCoverProps {
  shareCode: string
}

export function ReportCover({ shareCode }: ReportCoverProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const heartRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const tl = gsap.timeline()

    // 设置初始状态
    gsap.set([heartRef.current, titleRef.current, subtitleRef.current], {
      opacity: 0,
    })
    gsap.set(heartRef.current, { scale: 0.8 })
    gsap.set([titleRef.current, subtitleRef.current], { y: 30 })

    // 创建动画时间线
    tl.to(heartRef.current, {
      scale: 1,
      opacity: 1,
      duration: 0.8,
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
        '-=0.4'
      )
      .to(
        subtitleRef.current,
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
        },
        '-=0.6'
      )
  }, [])

  return (
    <section
      ref={containerRef}
      className="h-screen flex items-center justify-center px-4"
    >
      <div className="text-center space-y-8">
        <div ref={heartRef}>
          <Heart className="h-24 w-24 text-pink-500 fill-pink-500 mx-auto" />
        </div>
        <h1
          ref={titleRef}
          className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"
        >
          年度报告
        </h1>
        <p ref={subtitleRef} className="text-xl md:text-2xl text-muted-foreground">
          记录我们的美好回忆
        </p>
      </div>
    </section>
  )
}

