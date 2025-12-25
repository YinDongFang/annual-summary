'use client'

import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

interface MovieFormProps {
  movieList: string
  onChange: (movieList: string) => void
}

export function MovieForm({ movieList, onChange }: MovieFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>观影记录</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="movie-list">电影列表</Label>
          <Textarea
            id="movie-list"
            value={movieList}
            onChange={(e) => onChange(e.target.value)}
            placeholder="请输入电影名称，每行一部电影&#10;例如：&#10;阿凡达：水之道&#10;流浪地球2&#10;满江红"
            className="min-h-32 mt-2"
          />
          <p className="text-sm text-muted-foreground mt-2">
            每行输入一部电影名称，提交后系统会自动查找电影信息
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

