"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePupilData, type Subject } from "@/lib/pupil-data-provider"
import { ArrowLeft, Printer } from "lucide-react"
import { PupilPerformanceTable } from "@/components/pupil-performance-table"

export default function ClassReportPage() {
  const router = useRouter()
  const params = useParams()
  const { pupils, calculateResults } = usePupilData()

  const className = params.className as string
  const classPupils = pupils.filter((pupil) => pupil.class === className)

  // Ensure all pupils have calculated results - if any don't, recalculate for the whole class
  const needsCalculation = classPupils.some(
    (pupil) =>
      pupil.totalMarks === undefined ||
      pupil.totalAggregate === undefined ||
      pupil.division === undefined ||
      pupil.position === undefined,
  )

  if (needsCalculation && classPupils.length > 0) {
    calculateResults(className)
  }

  // Count grades per subject
  const gradeCountsBySubject: Record<Subject, Record<string, number>> = {
    MTC: {},
    ENG: {},
    SCIE: {},
    SST: {},
  }

  classPupils.forEach((pupil) => {
    pupil.marks.forEach((mark) => {
      if (!gradeCountsBySubject[mark.subject][mark.grade]) {
        gradeCountsBySubject[mark.subject][mark.grade] = 0
      }
      gradeCountsBySubject[mark.subject][mark.grade]++
    })
  })

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

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="container py-8 print:py-2">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-3xl font-bold">Class Report: {className}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <Card className="mb-8 print:shadow-none print:border-none">
        <CardHeader className="text-center border-b">
          <CardTitle className="text-2xl">Bright Generation Learning Centre</CardTitle>
          <CardDescription className="text-lg">Kalisizo</CardDescription>
          <div className="text-xl font-bold mt-2">CLASS PERFORMANCE REPORT: {className}</div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Class Summary</h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Total Pupils</TableCell>
                    <TableCell>{classPupils.length}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Division 1</TableCell>
                    <TableCell>{divisionCounts["Division 1"] || 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Division 2</TableCell>
                    <TableCell>{divisionCounts["Division 2"] || 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Division 3</TableCell>
                    <TableCell>{divisionCounts["Division 3"] || 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Division 4</TableCell>
                    <TableCell>{divisionCounts["Division 4"] || 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Ungraded</TableCell>
                    <TableCell>{divisionCounts["Ungraded (U)"] || 0}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Subject Averages</h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Mathematics</TableCell>
                    <TableCell>{subjectAverages.MTC.toFixed(1)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">English</TableCell>
                    <TableCell>{subjectAverages.ENG.toFixed(1)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Science</TableCell>
                    <TableCell>{subjectAverages.SCIE.toFixed(1)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Social Studies</TableCell>
                    <TableCell>{subjectAverages.SST.toFixed(1)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <h3 className="font-bold text-lg mb-4">Class Performance</h3>
          <div className="mb-8">
            <div className="bg-primary/5 p-4 rounded-md mb-4">
              <h4 className="font-medium mb-2">Class Ranking</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Pupils are ranked by total aggregate (lower is better). In case of a tie, total marks are used as a
                tiebreaker.
              </p>
              <PupilPerformanceTable pupils={classPupils} showActions={false} />
            </div>
          </div>

          <h3 className="font-bold text-lg mb-4">Subject Performance Breakdown</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium mb-2">Mathematics (MTC)</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grade</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {["D1", "D2", "C3", "C4", "C5", "C6", "P7", "P8", "F9"].map((grade) => (
                    <TableRow key={`MTC-${grade}`}>
                      <TableCell>{grade}</TableCell>
                      <TableCell>{gradeCountsBySubject.MTC[grade] || 0}</TableCell>
                      <TableCell>
                        {classPupils.length > 0
                          ? `${(((gradeCountsBySubject.MTC[grade] || 0) / classPupils.length) * 100).toFixed(1)}%`
                          : "0%"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div>
              <h4 className="font-medium mb-2">English (ENG)</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grade</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {["D1", "D2", "C3", "C4", "C5", "C6", "P7", "P8", "F9"].map((grade) => (
                    <TableRow key={`ENG-${grade}`}>
                      <TableCell>{grade}</TableCell>
                      <TableCell>{gradeCountsBySubject.ENG[grade] || 0}</TableCell>
                      <TableCell>
                        {classPupils.length > 0
                          ? `${(((gradeCountsBySubject.ENG[grade] || 0) / classPupils.length) * 100).toFixed(1)}%`
                          : "0%"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div>
              <h4 className="font-medium mb-2">Science (SCIE)</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grade</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {["D1", "D2", "C3", "C4", "C5", "C6", "P7", "P8", "F9"].map((grade) => (
                    <TableRow key={`SCIE-${grade}`}>
                      <TableCell>{grade}</TableCell>
                      <TableCell>{gradeCountsBySubject.SCIE[grade] || 0}</TableCell>
                      <TableCell>
                        {classPupils.length > 0
                          ? `${(((gradeCountsBySubject.SCIE[grade] || 0) / classPupils.length) * 100).toFixed(1)}%`
                          : "0%"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div>
              <h4 className="font-medium mb-2">Social Studies (SST)</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grade</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {["D1", "D2", "C3", "C4", "C5", "C6", "P7", "P8", "F9"].map((grade) => (
                    <TableRow key={`SST-${grade}`}>
                      <TableCell>{grade}</TableCell>
                      <TableCell>{gradeCountsBySubject.SST[grade] || 0}</TableCell>
                      <TableCell>
                        {classPupils.length > 0
                          ? `${(((gradeCountsBySubject.SST[grade] || 0) / classPupils.length) * 100).toFixed(1)}%`
                          : "0%"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start border-t pt-6">
          <div className="w-full text-center mt-4 text-sm text-muted-foreground">
            <p>This report was generated on {new Date().toLocaleDateString()}</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
