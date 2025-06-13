"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePupilData } from "@/lib/pupil-data-provider"
import { FileText, BarChart3, Users } from "lucide-react"

export default function ReportsPage() {
  const { pupils, calculateResults } = usePupilData()
  const [selectedClass, setSelectedClass] = useState<string>("")

  const handleGenerateReports = () => {
    if (selectedClass) {
      calculateResults(selectedClass)
    }
  }

  const classPupils = selectedClass ? pupils.filter((pupil) => pupil.class === selectedClass) : []

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
      <h1 className="text-3xl font-bold mb-6">Reports</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
          <CardDescription>Select a class to generate performance reports.</CardDescription>
          <div className="flex items-center gap-4">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
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
            <Button onClick={handleGenerateReports} disabled={!selectedClass}>
              Generate Reports
            </Button>
          </div>
        </CardHeader>
      </Card>

      {selectedClass && classPupils.length > 0 && (
        <>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Total Marks</TableHead>
                    <TableHead>Aggregate</TableHead>
                    <TableHead>Division</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...classPupils]
                    .sort((a, b) => (a.position || 999) - (b.position || 999))
                    .map((pupil) => (
                      <TableRow key={pupil.id}>
                        <TableCell>{pupil.position || "-"}</TableCell>
                        <TableCell className="font-medium">{pupil.name}</TableCell>
                        <TableCell>{pupil.totalMarks || "-"}</TableCell>
                        <TableCell>{pupil.totalAggregate || "-"}</TableCell>
                        <TableCell>{pupil.division || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/reports/pupil/${pupil.id}`}>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-1" />
                              Report Card
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {selectedClass && classPupils.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No pupils found in {selectedClass}. Please add pupils to this class first.
        </div>
      )}
    </div>
  )
}
