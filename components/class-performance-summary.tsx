"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, Award, BarChart3 } from "lucide-react"
import type { Pupil } from "@/lib/pupil-data-provider"

interface ClassPerformanceSummaryProps {
  pupils: Pupil[]
  className: string
}

export function ClassPerformanceSummary({ pupils, className }: ClassPerformanceSummaryProps) {
  // Calculate statistics
  const totalPupils = pupils.length
  const pupilsWithResults = pupils.filter((p) => p.totalAggregate !== undefined)

  const divisionCounts = pupilsWithResults.reduce(
    (counts, pupil) => {
      if (pupil.division) {
        counts[pupil.division] = (counts[pupil.division] || 0) + 1
      }
      return counts
    },
    {} as Record<string, number>,
  )

  const subjectAverages =
    pupilsWithResults.length > 0
      ? {
          MTC:
            pupilsWithResults.reduce((sum, pupil) => {
              const mark = pupil.marks.find((m) => m.subject === "MTC")
              return sum + (mark?.marks || 0)
            }, 0) / pupilsWithResults.length,
          ENG:
            pupilsWithResults.reduce((sum, pupil) => {
              const mark = pupil.marks.find((m) => m.subject === "ENG")
              return sum + (mark?.marks || 0)
            }, 0) / pupilsWithResults.length,
          SCIE:
            pupilsWithResults.reduce((sum, pupil) => {
              const mark = pupil.marks.find((m) => m.subject === "SCIE")
              return sum + (mark?.marks || 0)
            }, 0) / pupilsWithResults.length,
          SST:
            pupilsWithResults.reduce((sum, pupil) => {
              const mark = pupil.marks.find((m) => m.subject === "SST")
              return sum + (mark?.marks || 0)
            }, 0) / pupilsWithResults.length,
        }
      : { MTC: 0, ENG: 0, SCIE: 0, SST: 0 }

  const classAverage =
    pupilsWithResults.length > 0
      ? pupilsWithResults.reduce((sum, pupil) => sum + (pupil.totalMarks || 0), 0) / pupilsWithResults.length
      : 0

  const topPerformer = pupilsWithResults.find((pupil) => pupil.position === 1)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pupils</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPupils}</div>
          <p className="text-xs text-muted-foreground">{pupilsWithResults.length} with calculated results</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Class Average</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{classAverage.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Total marks average</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold truncate">{topPerformer ? topPerformer.name : "No data"}</div>
          <p className="text-xs text-muted-foreground">
            {topPerformer ? `${topPerformer.totalMarks} marks, ${topPerformer.division}` : "Calculate results first"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Division 1</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{divisionCounts["Division 1"] || 0}</div>
          <p className="text-xs text-muted-foreground">
            {totalPupils > 0 ? `${(((divisionCounts["Division 1"] || 0) / totalPupils) * 100).toFixed(1)}%` : "0%"} of
            class
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
