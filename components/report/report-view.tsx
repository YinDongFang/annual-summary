'use client'

import { motion } from 'framer-motion'
import { ReportCover } from './report-cover'
import { MovieSection } from './movie-section'
import { ConcertSection } from './concert-section'
import { TravelSection } from './travel-section'
import { ReportSummary } from './report-summary'

interface ReportViewProps {
  movies: any[]
  concerts: any[]
  travels: any[]
  shareCode: string
}

export function ReportView({ movies, concerts, travels, shareCode }: ReportViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ReportCover shareCode={shareCode} />
      {movies.length > 0 && <MovieSection movies={movies} />}
      {concerts.length > 0 && <ConcertSection concerts={concerts} />}
      {travels.length > 0 && <TravelSection travels={travels} />}
      <ReportSummary movies={movies} concerts={concerts} travels={travels} />
    </div>
  )
}

