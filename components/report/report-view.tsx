'use client'

import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { ReportCover } from './report-cover'
import { MovieSection, MovieSectionRef } from './movie-section'
import { ConcertSection } from './concert-section'
import { TravelSection } from './travel-section'
import { ReportSummary } from './report-summary'
import { gsap } from 'gsap'
import { ChevronUp } from 'lucide-react'

interface Movie {
  id: string
  title: string
  date?: string
  release_date?: string
  poster_url?: string
  rating?: number
  summary?: string
}

interface Concert {
  id: string
  artist: string
  date?: string
  venue?: string
  poster_url?: string
  summary?: string
}

interface Travel {
  id: string
  city: string
  country: string
  date?: string
  photos?: string[]
  ai_image_url?: string
  summary?: string
}

interface ReportViewProps {
  movies: Movie[]
  concerts: Concert[]
  travels: Travel[]
  shareCode: string
}

// 上滑提示组件
function SwipeUpHint() {
  const hintRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hintRef.current) return

    // 持续浮动动画
    gsap.to(hintRef.current, {
      y: -10,
      duration: 1.5,
      ease: 'power1.inOut',
      repeat: -1,
      yoyo: true,
    })
  }, [])

  return (
    <div
      ref={hintRef}
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 text-white/70"
    >
      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
        <ChevronUp className="w-5 h-5" />
      </div>
      <span className="text-sm font-medium">上滑继续</span>
    </div>
  )
}

export function ReportView({ movies, concerts, travels, shareCode }: ReportViewProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const pagesRef = useRef<HTMLDivElement[]>([])
  const touchStartY = useRef<number>(0)
  const touchEndY = useRef<number>(0)
  const isAnimating = useRef<boolean>(false)
  
  // 子页面状态管理
  const movieSectionRef = useRef<MovieSectionRef>(null)
  const [movieSubPage, setMovieSubPage] = useState<'summary' | 'gallery'>('summary')
  const [isGalleryAtBottom, setIsGalleryAtBottom] = useState(false)

  // 构建页面列表
  const pages = useMemo(() => [
    { component: <ReportCover shareCode={shareCode} />, key: 'cover', hasSubPages: false },
    ...(movies.length > 0 ? [{ 
      component: <MovieSection 
        ref={movieSectionRef}
        movies={movies} 
        onSubPageChange={setMovieSubPage}
        onGalleryScrollChange={setIsGalleryAtBottom}
      />, 
      key: 'movies',
      hasSubPages: true 
    }] : []),
    ...(concerts.length > 0 ? [{ component: <ConcertSection concerts={concerts} />, key: 'concerts', hasSubPages: false }] : []),
    ...(travels.length > 0 ? [{ component: <TravelSection travels={travels} />, key: 'travels', hasSubPages: false }] : []),
    { component: <ReportSummary movies={movies} concerts={concerts} travels={travels} />, key: 'summary', hasSubPages: false },
  ], [movies, concerts, travels, shareCode, movieSectionRef])

  // 切换页面动画
  const goToPage = useCallback((pageIndex: number) => {
    if (isAnimating.current || pageIndex < 0 || pageIndex >= pages.length) return

    isAnimating.current = true
    const currentPageEl = pagesRef.current[currentPage]
    const nextPageEl = pagesRef.current[pageIndex]

    if (!currentPageEl || !nextPageEl) {
      isAnimating.current = false
      return
    }

    // 淡出当前页面
    gsap.to(currentPageEl, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut',
      onComplete: () => {
        // 更新当前页面
        setCurrentPage(pageIndex)
        
        // 重置子页面状态
        if (pageIndex === pages.findIndex(p => p.key === 'movies')) {
          setMovieSubPage('summary')
        }
        
        // 淡入新页面
        gsap.fromTo(
          nextPageEl,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.6,
            ease: 'power2.inOut',
            onComplete: () => {
              isAnimating.current = false
            },
          }
        )
      },
    })
  }, [currentPage, pages])

  // 处理向上滑动/滚动
  const handleSwipeUp = useCallback(() => {
    if (isAnimating.current) return

    const currentPageData = pages[currentPage]
    
    // 检查当前页面是否有子页面
    if (currentPageData?.hasSubPages && currentPageData.key === 'movies') {
      // 电影页面：先切换子页面
      if (movieSubPage === 'summary') {
        // 从总结切换到照片墙
        movieSectionRef.current?.switchToGallery()
      } else if (movieSubPage === 'gallery') {
        // 在照片墙中，检查是否滚动到底部
        if (isGalleryAtBottom) {
          // 滚动到底部，切换到下一个主页面
          goToPage(currentPage + 1)
        } else {
          // 未到底部，不切换页面（让照片墙继续滚动）
          return
        }
      }
    } else {
      // 没有子页面，直接切换到下一个主页面
      goToPage(currentPage + 1)
    }
  }, [currentPage, pages, movieSubPage, isGalleryAtBottom, goToPage])

  // 处理向下滑动/滚动
  const handleSwipeDown = useCallback(() => {
    if (isAnimating.current) return

    const currentPageData = pages[currentPage]
    
    // 检查当前页面是否有子页面
    if (currentPageData?.hasSubPages && currentPageData.key === 'movies') {
      // 电影页面：检查子页面状态
      if (movieSubPage === 'gallery') {
        // 在照片墙中，不能向下切换（照片墙只能向上滚动）
        return
      } else {
        // 在总结页面，切换到上一个主页面
        goToPage(currentPage - 1)
      }
    } else {
      // 没有子页面，直接切换到上一个主页面
      goToPage(currentPage - 1)
    }
  }, [currentPage, pages, movieSubPage, goToPage])

  // 处理触摸事件
  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    touchEndY.current = e.touches[0].clientY
  }, [])


  // 初始化页面显示
  useEffect(() => {
    if (pagesRef.current[0]) {
      gsap.set(pagesRef.current[0], { opacity: 1 })
      // 隐藏其他页面
      pagesRef.current.slice(1).forEach((page) => {
        if (page) gsap.set(page, { opacity: 0 })
      })
    }
  }, [])

  // 绑定事件监听器
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchEndWrapper = () => {
      if (isAnimating.current) return

      const diff = touchStartY.current - touchEndY.current
      const minSwipeDistance = 50

      if (Math.abs(diff) > minSwipeDistance) {
        if (diff > 0) {
          handleSwipeUp()
        } else {
          handleSwipeDown()
        }
      }
    }

    const handleWheelWrapper = (e: WheelEvent) => {
      if (isAnimating.current) {
        e.preventDefault()
        return
      }

      const currentPageData = pages[currentPage]
      if (currentPageData?.hasSubPages && currentPageData.key === 'movies' && movieSubPage === 'gallery') {
        if (!isGalleryAtBottom) {
          return
        }
      }

      if (e.deltaY > 0) {
        e.preventDefault()
        handleSwipeUp()
      } else if (e.deltaY < 0) {
        e.preventDefault()
        handleSwipeDown()
      }
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })
    container.addEventListener('touchend', handleTouchEndWrapper, { passive: true })
    container.addEventListener('wheel', handleWheelWrapper, { passive: false })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEndWrapper)
      container.removeEventListener('wheel', handleWheelWrapper)
    }
  }, [currentPage, pages, goToPage, handleSwipeUp, handleSwipeDown, movieSubPage, isGalleryAtBottom, handleTouchStart, handleTouchMove])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
    >
      {pages.map((page, index) => (
        <div
          key={page.key}
          ref={(el) => {
            if (el) pagesRef.current[index] = el
          }}
          className="absolute inset-0 w-full h-screen"
          style={{ opacity: index === 0 ? 1 : 0 }}
        >
          {page.component}
        </div>
      ))}
      {/* 上滑提示 - 首页不显示 */}
      {currentPage > 0 && <SwipeUpHint />}
    </div>
  )
}

