'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Upload } from 'lucide-react'
import Image from 'next/image'

export interface Concert {
  id: string
  artist: string
  date: string
  venue: string
  posterUrl: string | null
}

interface ConcertFormProps {
  concerts: Concert[]
  onChange: (concerts: Concert[]) => void
}

export function ConcertForm({ concerts, onChange }: ConcertFormProps) {
  const [uploading, setUploading] = useState<string | null>(null)

  const addConcert = () => {
    onChange([
      ...concerts,
      {
        id: Date.now().toString(),
        artist: '',
        date: '',
        venue: '',
        posterUrl: null,
      },
    ])
  }

  const removeConcert = (id: string) => {
    onChange(concerts.filter((c) => c.id !== id))
  }

  const updateConcert = (id: string, field: keyof Concert, value: any) => {
    onChange(
      concerts.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    )
  }

  const handleFileUpload = async (id: string, file: File) => {
    setUploading(id)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'posters')

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const { url } = await response.json()
        updateConcert(id, 'posterUrl', url)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setUploading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>演唱会记录</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {concerts.map((concert) => (
          <div
            key={concert.id}
            className="flex flex-col gap-4 p-4 border rounded-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-4">
                <div>
                  <Label htmlFor={`concert-artist-${concert.id}`}>艺术家</Label>
                  <Input
                    id={`concert-artist-${concert.id}`}
                    value={concert.artist}
                    onChange={(e) =>
                      updateConcert(concert.id, 'artist', e.target.value)
                    }
                    placeholder="请输入艺术家名称"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`concert-date-${concert.id}`}>日期</Label>
                    <Input
                      id={`concert-date-${concert.id}`}
                      type="date"
                      value={concert.date}
                      onChange={(e) =>
                        updateConcert(concert.id, 'date', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`concert-venue-${concert.id}`}>场馆</Label>
                    <Input
                      id={`concert-venue-${concert.id}`}
                      value={concert.venue}
                      onChange={(e) =>
                        updateConcert(concert.id, 'venue', e.target.value)
                      }
                      placeholder="请输入场馆名称"
                    />
                  </div>
                </div>
                <div>
                  <Label>海报</Label>
                  <div className="mt-2">
                    {concert.posterUrl ? (
                      <div className="relative w-32 h-48 rounded-lg overflow-hidden">
                        <Image
                          src={concert.posterUrl}
                          alt={concert.artist || 'Poster'}
                          fill
                          className="object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => updateConcert(concert.id, 'posterUrl', null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center w-32 h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleFileUpload(concert.id, file)
                            }
                          }}
                          disabled={uploading === concert.id}
                        />
                        {uploading === concert.id ? (
                          <div className="text-sm">上传中...</div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                            <Upload className="h-6 w-6" />
                            <span>上传海报</span>
                          </div>
                        )}
                      </label>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeConcert(concert.id)}
                className="ml-4"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        <Button variant="outline" onClick={addConcert} className="w-full">
          添加演唱会
        </Button>
      </CardContent>
    </Card>
  )
}

