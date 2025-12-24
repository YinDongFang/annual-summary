'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { MapPin } from 'lucide-react'

interface TravelSectionProps {
  travels: any[]
}

export function TravelSection({ travels }: TravelSectionProps) {
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
      className="min-h-screen flex items-center justify-center px-4 py-20"
    >
      <div className="container mx-auto max-w-6xl">
        <motion.div variants={itemVariants} className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MapPin className="h-8 w-8 text-blue-500" />
            <h2 className="text-4xl md:text-5xl font-bold">旅行记录</h2>
          </div>
          <p className="text-muted-foreground text-lg">
            共去了 <strong className="text-foreground">{travels.length}</strong> 个地方
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {travels.map((travel) => (
            <motion.div key={travel.id} variants={itemVariants}>
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
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

