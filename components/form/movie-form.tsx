'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

export interface Movie {
  id: string
  title: string
  date: string
  rating: number | null
  posterUrl: string | null
}

interface MovieFormProps {
  movies: Movie[]
  onChange: (movies: Movie[]) => void
}

export function MovieForm({ movies, onChange }: MovieFormProps) {
  const [uploading, setUploading] = useState<string | null>(null)

  const addMovie = () => {
    onChange([
      ...movies,
      {
        id: Date.now().toString(),
        title: '',
        date: '',
        rating: null,
        posterUrl: null,
      },
    ])
  }

  const removeMovie = (id: string) => {
    onChange(movies.filter((m) => m.id !== id))
  }

  const updateMovie = (id: string, field: keyof Movie, value: any) => {
    onChange(
      movies.map((m) => (m.id === id ? { ...m, [field]: value } : m))
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
        updateMovie(id, 'posterUrl', url)
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
        <CardTitle>观影记录</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="flex flex-col gap-4 p-4 border rounded-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-4">
                <div>
                  <Label htmlFor={`movie-title-${movie.id}`}>电影名称</Label>
                  <Input
                    id={`movie-title-${movie.id}`}
                    value={movie.title}
                    onChange={(e) =>
                      updateMovie(movie.id, 'title', e.target.value)
                    }
                    placeholder="请输入电影名称"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`movie-date-${movie.id}`}>观看日期</Label>
                    <Input
                      id={`movie-date-${movie.id}`}
                      type="date"
                      value={movie.date}
                      onChange={(e) =>
                        updateMovie(movie.id, 'date', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`movie-rating-${movie.id}`}>评分 (1-5)</Label>
                    <Input
                      id={`movie-rating-${movie.id}`}
                      type="number"
                      min="1"
                      max="5"
                      value={movie.rating || ''}
                      onChange={(e) =>
                        updateMovie(
                          movie.id,
                          'rating',
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      placeholder="1-5"
                    />
                  </div>
                </div>
                <div>
                  <Label>海报</Label>
                  <div className="mt-2">
                    {movie.posterUrl ? (
                      <div className="relative w-32 h-48 rounded-lg overflow-hidden">
                        <Image
                          src={movie.posterUrl}
                          alt={movie.title || 'Poster'}
                          fill
                          className="object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => updateMovie(movie.id, 'posterUrl', null)}
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
                              handleFileUpload(movie.id, file)
                            }
                          }}
                          disabled={uploading === movie.id}
                        />
                        {uploading === movie.id ? (
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
                onClick={() => removeMovie(movie.id)}
                className="ml-4"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        <Button variant="outline" onClick={addMovie} className="w-full">
          添加电影
        </Button>
      </CardContent>
    </Card>
  )
}

