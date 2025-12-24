'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

export interface Travel {
  id: string
  city: string
  country: string
  date: string
  photos: string[]
  aiImageUrl: string | null
}

interface TravelFormProps {
  travels: Travel[]
  onChange: (travels: Travel[]) => void
}

export function TravelForm({ travels, onChange }: TravelFormProps) {
  const [uploading, setUploading] = useState<{ id: string; index?: number } | null>(null)

  const addTravel = () => {
    onChange([
      ...travels,
      {
        id: Date.now().toString(),
        city: '',
        country: '',
        date: '',
        photos: [],
        aiImageUrl: null,
      },
    ])
  }

  const removeTravel = (id: string) => {
    onChange(travels.filter((t) => t.id !== id))
  }

  const updateTravel = (id: string, field: keyof Travel, value: any) => {
    onChange(
      travels.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    )
  }

  const handleFileUpload = async (id: string, file: File, index?: number) => {
    setUploading({ id, index })
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'travels')

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const { url } = await response.json()
        const travel = travels.find((t) => t.id === id)
        if (travel) {
          if (index !== undefined) {
            // 替换现有照片
            const newPhotos = [...travel.photos]
            newPhotos[index] = url
            updateTravel(id, 'photos', newPhotos)
          } else {
            // 添加新照片
            updateTravel(id, 'photos', [...travel.photos, url])
          }
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setUploading(null)
    }
  }

  const removePhoto = (id: string, index: number) => {
    const travel = travels.find((t) => t.id === id)
    if (travel) {
      const newPhotos = travel.photos.filter((_, i) => i !== index)
      updateTravel(id, 'photos', newPhotos)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>旅游记录</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {travels.map((travel) => (
          <div
            key={travel.id}
            className="flex flex-col gap-4 p-4 border rounded-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`travel-city-${travel.id}`}>城市</Label>
                    <Input
                      id={`travel-city-${travel.id}`}
                      value={travel.city}
                      onChange={(e) =>
                        updateTravel(travel.id, 'city', e.target.value)
                      }
                      placeholder="请输入城市名称"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`travel-country-${travel.id}`}>国家</Label>
                    <Input
                      id={`travel-country-${travel.id}`}
                      value={travel.country}
                      onChange={(e) =>
                        updateTravel(travel.id, 'country', e.target.value)
                      }
                      placeholder="请输入国家名称"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`travel-date-${travel.id}`}>日期</Label>
                    <Input
                      id={`travel-date-${travel.id}`}
                      type="date"
                      value={travel.date}
                      onChange={(e) =>
                        updateTravel(travel.id, 'date', e.target.value)
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label>照片</Label>
                  <div className="mt-2 flex flex-wrap gap-4">
                    {travel.photos.map((photo, index) => (
                      <div
                        key={index}
                        className="relative w-32 h-32 rounded-lg overflow-hidden"
                      >
                        <Image
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => removePhoto(travel.id, index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <label className="flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleFileUpload(travel.id, file)
                          }
                        }}
                        disabled={uploading?.id === travel.id}
                      />
                      {uploading?.id === travel.id ? (
                        <div className="text-sm">上传中...</div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                          <Upload className="h-6 w-6" />
                          <span>添加照片</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTravel(travel.id)}
                className="ml-4"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        <Button variant="outline" onClick={addTravel} className="w-full">
          添加旅行
        </Button>
      </CardContent>
    </Card>
  )
}

