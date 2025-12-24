'use client'

import { motion } from 'framer-motion'
import { Heart, Sparkles } from 'lucide-react'

interface ReportSummaryProps {
  movies: any[]
  concerts: any[]
  travels: any[]
}

export function ReportSummary({ movies, concerts, travels }: ReportSummaryProps) {
  const totalItems = movies.length + concerts.length + travels.length

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8 }}
      className="min-h-screen flex items-center justify-center px-4 py-20"
    >
      <div className="container mx-auto max-w-4xl text-center space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Sparkles className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        </motion.div>
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold"
        >
          年度总结
        </motion.h2>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="space-y-4 text-lg text-muted-foreground"
        >
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
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="pt-8"
        >
          <div className="flex items-center justify-center gap-2 text-pink-500">
            <Heart className="h-6 w-6 fill-pink-500" />
            <p className="text-xl font-semibold">愿你们的爱情如这些回忆般美好</p>
            <Heart className="h-6 w-6 fill-pink-500" />
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}

