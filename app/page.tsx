'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MovieForm, Movie } from '@/components/form/movie-form'
import { ConcertForm, Concert } from '@/components/form/concert-form'
import { TravelForm, Travel } from '@/components/form/travel-form'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Heart, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [concerts, setConcerts] = useState<Concert[]>([])
  const [travels, setTravels] = useState<Travel[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shareCode, setShareCode] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (movies.length === 0 && concerts.length === 0 && travels.length === 0) {
      alert('请至少添加一条记录')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movies: movies.map((m) => ({
            title: m.title,
            date: m.date || null,
            rating: m.rating,
            posterUrl: m.posterUrl,
          })),
          concerts: concerts.map((c) => ({
            artist: c.artist,
            date: c.date || null,
            venue: c.venue || null,
            posterUrl: c.posterUrl,
          })),
          travels: travels.map((t) => ({
            city: t.city,
            country: t.country,
            date: t.date || null,
            photos: t.photos,
            aiImageUrl: t.aiImageUrl,
          })),
        }),
      })

      if (response.ok) {
        const { shareCode: code } = await response.json()
        setShareCode(code)
        setShowDialog(true)
      } else {
        const error = await response.json()
        alert(`提交失败: ${error.error}`)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewReport = () => {
    if (shareCode) {
      router.push(`/report/${shareCode}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-pink-500 fill-pink-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              情侣年度报告生成器
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            记录你们的美好回忆，生成专属年度报告
          </p>
        </div>

        <div className="space-y-6">
          <MovieForm movies={movies} onChange={setMovies} />
          <ConcertForm concerts={concerts} onChange={setConcerts} />
          <TravelForm travels={travels} onChange={setTravels} />

          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成报告中...
                  </>
                ) : (
                  '生成年度报告'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>报告生成成功！</DialogTitle>
            <DialogDescription>
              您的分享码是：<strong className="text-foreground">{shareCode}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 mt-4">
            <Button onClick={handleViewReport} className="flex-1">
              查看报告
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/report/${shareCode}`
                )
                alert('链接已复制到剪贴板')
              }}
              className="flex-1"
            >
              复制链接
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
