'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { Music } from 'lucide-react'

interface ConcertSectionProps {
  concerts: any[]
}

export function ConcertSection({ concerts }: ConcertSectionProps) {
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

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
      className="min-h-screen flex items-center justify-center px-4 py-20 bg-white/50 dark:bg-gray-800/50"
    >
      <div className="container mx-auto max-w-6xl">
        <motion.div variants={itemVariants} className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="h-8 w-8 text-purple-500" />
            <h2 className="text-4xl md:text-5xl font-bold">演唱会记录</h2>
          </div>
          <p className="text-muted-foreground text-lg">
            共参加了 <strong className="text-foreground">{concerts.length}</strong> 场演唱会
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {concerts.map((concert) => (
            <motion.div key={concert.id} variants={itemVariants}>
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
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

