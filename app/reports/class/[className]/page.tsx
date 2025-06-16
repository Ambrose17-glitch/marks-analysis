"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePupilData, type Subject } from "@/lib/pupil-data-provider"
import { SchoolHeader } from "@/components/school-header"
import { BulkReportGenerator } from "@/components/bulk-report-generator"
import { generateBulkPDF } from "@/lib/pdf-utils"
import { ArrowLeft, Printer, Download } from "lucide-react"
import { useState } from "react"

export default function ClassReportPage() {
  const router = useRouter()
  const params = useParams()
  const { pupils, calculateResults } = usePupilData()
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const className = params.className as string
  const classPupils = pupils.filter((pupil) => pupil.class === className)

  // Ensure all pupils have calculated results
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

  const handleDownloadBulkPDF = async () => {
    if (classPupils.length === 0) return

    setIsGeneratingPDF(true)
    try {
      const elementIds = classPupils.map((pupil) => `pupil-report-${pupil.id}`)
      await generateBulkPDF(elementIds, `${className.replace(".", "")}_Class_Reports.pdf`)
    } catch (error) {
      console.error("Error generating bulk PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handlePrint = () => {
    window.print()
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

  // Calculate class average per subject and find best/worst
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

  // Find best and worst performing subjects
  const subjectNames = { MTC: "MATHEMATICS", ENG: "ENGLISH", SCIE: "SCIENCE", SST: "SOCIAL STUDIES" }
  const sortedSubjects = Object.entries(subjectAverages).sort(([, a], [, b]) => b - a)
  const bestSubject = sortedSubjects[0]
  const worstSubject = sortedSubjects[sortedSubjects.length - 1]

  return (
    <div className="container py-8 print:py-2">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-3xl font-bold uppercase">CLASS REPORT: {className}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            BACK
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            PRINT
          </Button>
          <Button
            onClick={handleDownloadBulkPDF}
            disabled={isGeneratingPDF || classPupils.length === 0}
            className="bg-red-600 hover:bg-red-700"
          >
            <Download className="mr-2 h-4 w-4" />
            {isGeneratingPDF ? "GENERATING..." : "DOWNLOAD ALL REPORTS"}
          </Button>
        </div>
      </div>

      <Card className="mb-8 print:shadow-none print:border-none">
        <CardHeader className="pb-0">
          <SchoolHeader
            title={`CLASS PERFORMANCE REPORT: ${className}`}
            className="print:border-b-2 print:border-black"
          />
        </CardHeader>
        <CardContent className="pt-6">
          <h3 className="font-bold text-lg mb-4 uppercase">CLASS PERFORMANCE</h3>
          <div className="mb-8">
            <div className="bg-primary/5 p-4 rounded-md mb-4">
              <h4 className="font-medium mb-2 uppercase">CLASS RANKING</h4>
              <p className="text-sm text-muted-foreground mb-2 uppercase">
                PUPILS ARE RANKED BY TOTAL AGGREGATE (LOWER IS BETTER). IN CASE OF A TIE, TOTAL MARKS ARE USED AS A
                TIEBREAKER.
              </p>
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/10">
                    <TableHead className="font-semibold uppercase text-xs">POS</TableHead>
                    <TableHead className="font-semibold uppercase text-xs">NAME</TableHead>
                    <TableHead className="font-semibold uppercase text-xs">MTC</TableHead>
                    <TableHead className="font-semibold uppercase text-xs">ENG</TableHead>
                    <TableHead className="font-semibold uppercase text-xs">SCIE</TableHead>
                    <TableHead className="font-semibold uppercase text-xs">SST</TableHead>
                    <TableHead className="font-semibold uppercase text-xs">TOTAL</TableHead>
                    <TableHead className="font-semibold uppercase text-xs">AGG</TableHead>
                    <TableHead className="font-semibold uppercase text-xs">DIV</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...classPupils]
                    .sort((a, b) => (a.position || 999) - (b.position || 999))
                    .map((pupil) => (
                      <TableRow key={pupil.id} className="text-xs">
                        <TableCell className="font-medium">{pupil.position || "-"}</TableCell>
                        <TableCell className="uppercase font-medium">{pupil.name}</TableCell>
                        <TableCell className="text-center">
                          {pupil.marks.find((m) => m.subject === "MTC")?.marks || "-"}
                          <span className="text-xs text-gray-500 ml-1">
                            ({pupil.marks.find((m) => m.subject === "MTC")?.points || "-"})
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {pupil.marks.find((m) => m.subject === "ENG")?.marks || "-"}
                          <span className="text-xs text-gray-500 ml-1">
                            ({pupil.marks.find((m) => m.subject === "ENG")?.points || "-"})
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {pupil.marks.find((m) => m.subject === "SCIE")?.marks || "-"}
                          <span className="text-xs text-gray-500 ml-1">
                            ({pupil.marks.find((m) => m.subject === "SCIE")?.points || "-"})
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {pupil.marks.find((m) => m.subject === "SST")?.marks || "-"}
                          <span className="text-xs text-gray-500 ml-1">
                            ({pupil.marks.find((m) => m.subject === "SST")?.points || "-"})
                          </span>
                        </TableCell>
                        <TableCell className="font-bold text-center">{pupil.totalMarks || "-"}</TableCell>
                        <TableCell className="font-bold text-center">{pupil.totalAggregate || "-"}</TableCell>
                        <TableCell>
                          <span
                            className={`px-1 py-0.5 rounded text-xs font-medium uppercase ${
                              pupil.division === "Division 1"
                                ? "bg-green-100 text-green-800"
                                : pupil.division === "Division 2"
                                  ? "bg-blue-100 text-blue-800"
                                  : pupil.division === "Division 3"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : pupil.division === "Division 4"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-red-100 text-red-800"
                            }`}
                          >
                            {pupil.division?.replace("Division ", "D") || "-"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Class Summary Tables */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Class Summary */}
            <div>
              <h3 className="font-bold text-lg mb-4 uppercase">CLASS SUMMARY</h3>
              <Table className="border">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="font-semibold uppercase text-xs">METRIC</TableHead>
                    <TableHead className="font-semibold uppercase text-xs text-center">COUNT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium uppercase">TOTAL PUPILS</TableCell>
                    <TableCell className="text-center font-bold">{classPupils.length}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium uppercase">DIVISION 1</TableCell>
                    <TableCell className="text-center font-bold text-green-600">
                      {divisionCounts["Division 1"] || 0}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium uppercase">DIVISION 2</TableCell>
                    <TableCell className="text-center font-bold text-blue-600">
                      {divisionCounts["Division 2"] || 0}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium uppercase">DIVISION 3</TableCell>
                    <TableCell className="text-center font-bold text-yellow-600">
                      {divisionCounts["Division 3"] || 0}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium uppercase">DIVISION 4</TableCell>
                    <TableCell className="text-center font-bold text-orange-600">
                      {divisionCounts["Division 4"] || 0}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium uppercase">UNGRADED</TableCell>
                    <TableCell className="text-center font-bold text-red-600">
                      {divisionCounts["Ungraded (U)"] || 0}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Subject Averages */}
            <div>
              <h3 className="font-bold text-lg mb-4 uppercase">SUBJECT AVERAGES</h3>
              <Table className="border">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="font-semibold uppercase text-xs">SUBJECT</TableHead>
                    <TableHead className="font-semibold uppercase text-xs text-center">AVERAGE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium uppercase">MATHEMATICS</TableCell>
                    <TableCell className="text-center font-bold">{subjectAverages.MTC.toFixed(1)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium uppercase">ENGLISH</TableCell>
                    <TableCell className="text-center font-bold">{subjectAverages.ENG.toFixed(1)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium uppercase">SCIENCE</TableCell>
                    <TableCell className="text-center font-bold">{subjectAverages.SCIE.toFixed(1)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium uppercase">SOCIAL STUDIES</TableCell>
                    <TableCell className="text-center font-bold">{subjectAverages.SST.toFixed(1)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Performance Analysis */}
            <div>
              <h3 className="font-bold text-lg mb-4 uppercase">PERFORMANCE ANALYSIS</h3>
              <Table className="border">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="font-semibold uppercase text-xs">ANALYSIS</TableHead>
                    <TableHead className="font-semibold uppercase text-xs text-center">VALUE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium uppercase text-green-600">BEST SUBJECT</TableCell>
                    <TableCell className="text-center font-bold text-green-600 uppercase">
                      {subjectNames[bestSubject[0] as Subject]}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium uppercase text-green-600">BEST AVERAGE</TableCell>
                    <TableCell className="text-center font-bold text-green-600">{bestSubject[1].toFixed(1)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium uppercase text-red-600">WORST SUBJECT</TableCell>
                    <TableCell className="text-center font-bold text-red-600 uppercase">
                      {subjectNames[worstSubject[0] as Subject]}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium uppercase text-red-600">WORST AVERAGE</TableCell>
                    <TableCell className="text-center font-bold text-red-600">{worstSubject[1].toFixed(1)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium uppercase">CLASS AVERAGE</TableCell>
                    <TableCell className="text-center font-bold">
                      {(
                        Object.values(subjectAverages).reduce((sum, avg) => sum + avg, 0) /
                        Object.values(subjectAverages).length
                      ).toFixed(1)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start border-t pt-6">
          <div className="w-full text-center mt-4 text-sm text-muted-foreground">
            <p className="font-semibold uppercase">
              THIS REPORT WAS GENERATED ON {new Date().toLocaleDateString("en-GB")}
            </p>
          </div>
        </CardFooter>
      </Card>

      {/* Bulk Report Generator Component */}
      <BulkReportGenerator className={className} />
    </div>
  )
}
