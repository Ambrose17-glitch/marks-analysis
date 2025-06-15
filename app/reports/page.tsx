"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePupilData } from "@/lib/pupil-data-provider"
import { FileText, BarChart3, Users, RefreshCw } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useToast } from "@/components/ui/use-toast"
import { PupilPerformanceTable } from "@/components/pupil-performance-table"
import { ClassPerformanceSummary } from "@/components/class-performance-summary"

export default function ReportsPage() {
  const { pupils, calculateResults, loading, refreshPupils } = usePupilData()
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const classPupils = selectedClass ? pupils.filter((pupil) => pupil.class === selectedClass) : []

  const handleGenerateReports = async () => {
    if (selectedClass) {
      setIsGenerating(true)
      await calculateResults(selectedClass)
      setIsGenerating(false)
      toast({
        title: "Reports Generated",
        description: `Performance reports for ${selectedClass} have been generated successfully.`,
      })
    }
  }

  // Auto-calculate results when class is selected
  useEffect(() => {
    if (selectedClass && classPupils.length > 0) {
      const needsCalculation = classPupils.some(
        (pupil) =>
          pupil.totalMarks === undefined ||
          pupil.totalAggregate === undefined ||
          pupil.division === undefined ||
          pupil.position === undefined,
      )

      if (needsCalculation) {
        calculateResults(selectedClass)
      }
    }
  }, [selectedClass, classPupils])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshPupils()
    setIsRefreshing(false)
    toast({
      title: "Data refreshed",
      description: "The pupil data has been refreshed from the database.",
    })
  }

  // Count pupils by division
  const divisionCounts = classPupils.reduce(
    (counts, pupil) => {
      if (pupil.division) {
        counts[pupil.division] = (counts[pupil.division] || 0) + 1
      }
      return counts
    },
    {} as Record<string, number>,
  )

  // Calculate class average per subject
  const subjectAverages =
    classPupils.length > 0
      ? {
          MTC:
            classPupils.reduce((sum, pupil) => {
              const mark = pupil.marks.find((m) => m.subject === "MTC")
              return sum + (mark?.marks || 0)
            }, 0) / classPupils.length,
          ENG:
            classPupils.reduce((sum, pupil) => {
              const mark = pupil.marks.find((m) => m.subject === "ENG")
              return sum + (mark?.marks || 0)
            }, 0) / classPupils.length,
          SCIE:
            classPupils.reduce((sum, pupil) => {
              const mark = pupil.marks.find((m) => m.subject === "SCIE")
              return sum + (mark?.marks || 0)
            }, 0) / classPupils.length,
          SST:
            classPupils.reduce((sum, pupil) => {
              const mark = pupil.marks.find((m) => m.subject === "SST")
              return sum + (mark?.marks || 0)
            }, 0) / classPupils.length,
        }
      : { MTC: 0, ENG: 0, SCIE: 0, SST: 0 }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reports</h1>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
          <CardDescription>Select a class to generate performance reports.</CardDescription>
          <div className="flex items-center gap-4">
            <Select value={selectedClass} onValueChange={setSelectedClass} disabled={isGenerating}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="P.4">P.4</SelectItem>
                <SelectItem value="P.5">P.5</SelectItem>
                <SelectItem value="P.6">P.6</SelectItem>
                <SelectItem value="P.7">P.7</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleGenerateReports} disabled={!selectedClass || isGenerating}>
              {isGenerating ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Generating...
                </>
              ) : (
                "Generate Reports"
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <LoadingSpinner className="py-8" />
      ) : selectedClass && classPupils.length > 0 ? (
        <>
          <ClassPerformanceSummary pupils={classPupils} className={selectedClass} />

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>Class Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Pupils:</span>
                    <span className="font-medium">{classPupils.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Division 1:</span>
                    <span className="font-medium">{divisionCounts["Division 1"] || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Division 2:</span>
                    <span className="font-medium">{divisionCounts["Division 2"] || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Division 3:</span>
                    <span className="font-medium">{divisionCounts["Division 3"] || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Division 4:</span>
                    <span className="font-medium">{divisionCounts["Division 4"] || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ungraded:</span>
                    <span className="font-medium">{divisionCounts["Ungraded (U)"] || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Subject Averages</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mathematics:</span>
                    <span className="font-medium">{subjectAverages.MTC.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">English:</span>
                    <span className="font-medium">{subjectAverages.ENG.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Science:</span>
                    <span className="font-medium">{subjectAverages.SCIE.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Social Studies:</span>
                    <span className="font-medium">{subjectAverages.SST.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span>Report Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href={`/reports/class/${selectedClass}`}>
                  <Button variant="outline" className="w-full">
                    View Class Report
                  </Button>
                </Link>
                <Link href={`/reports/individual/${selectedClass}`}>
                  <Button variant="outline" className="w-full">
                    View Individual Reports
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Class Performance</CardTitle>
              <CardDescription>Pupils ranked by performance in {selectedClass}</CardDescription>
            </CardHeader>
            <CardContent>
              <PupilPerformanceTable pupils={classPupils} />
            </CardContent>
          </Card>
        </>
      ) : selectedClass && classPupils.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No pupils found in {selectedClass}. Please add pupils to this class first.
        </div>
      ) : null}
    </div>
  )
}
