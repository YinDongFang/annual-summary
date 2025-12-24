'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { Film } from 'lucide-react'

interface MovieSectionProps {
  movies: any[]
}

export function MovieSection({ movies }: MovieSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  }

  const averageRating =
    movies.reduce((sum, m) => sum + (m.rating || 0), 0) / movies.length

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
      className="min-h-screen flex items-center justify-center px-4 py-20"
    >
      <div className="container mx-auto max-w-6xl">
        <motion.div variants={itemVariants} className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Film className="h-8 w-8 text-pink-500" />
            <h2 className="text-4xl md:text-5xl font-bold">观影记录</h2>
          </div>
          <p className="text-muted-foreground text-lg">
            共观看了 <strong className="text-foreground">{movies.length}</strong> 部电影
            {averageRating > 0 && (
              <>
                {' '}
                · 平均评分{' '}
                <strong className="text-foreground">
                  {averageRating.toFixed(1)}/5
                </strong>
              </>
            )}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie, index) => (
            <motion.div key={movie.id} variants={itemVariants}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                {movie.poster_url && (
                  <div className="relative w-full aspect-[2/3]">
                    <Image
                      src={movie.poster_url}
                      alt={movie.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">
                    {movie.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {movie.date && (
                      <div>日期: {new Date(movie.date).toLocaleDateString('zh-CN')}</div>
                    )}
                    {movie.rating && (
                      <div className="flex items-center gap-1">
                        <span>评分:</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={i < movie.rating ? 'text-yellow-500' : 'text-gray-300'}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {movie.summary && (
                    <p className="mt-4 text-sm text-muted-foreground line-clamp-3">
                      {movie.summary}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

