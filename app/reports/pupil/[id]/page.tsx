"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePupilData } from "@/lib/pupil-data-provider"
import { SchoolHeader } from "@/components/school-header"
import { GradingScale } from "@/components/grading-scale"
import { generatePDF } from "@/lib/pdf-utils"
import { ArrowLeft, Printer, Download } from "lucide-react"
import { useState } from "react"

export default function PupilReportPage() {
  const router = useRouter()
  const params = useParams()
  const { pupils, schoolSettings } = usePupilData()
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const pupilId = params.id as string
  const pupil = pupils.find((p) => p.id === pupilId)

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    if (!pupil) return

    setIsGeneratingPDF(true)
    try {
      await generatePDF("pupil-report-content", `${pupil.name.replace(/\s+/g, "_")}_Report_Card.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  if (!pupil) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">PUPIL REPORT</h1>
        <div className="text-center py-12 text-muted-foreground">
          PUPIL NOT FOUND. THE REQUESTED PUPIL MAY HAVE BEEN DELETED.
        </div>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          GO BACK
        </Button>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const getPersonalizedComment = (division: string | undefined, name: string) => {
    const firstName = name.split(" ")[0].toUpperCase()

    switch (division) {
      case "Division 1":
        return `EXCELLENT PERFORMANCE ${firstName}! KEEP UP THE OUTSTANDING WORK. YOU HAVE DEMONSTRATED EXCEPTIONAL UNDERSTANDING AND COMMITMENT TO YOUR STUDIES.`
      case "Division 2":
        return `VERY GOOD PERFORMANCE ${firstName}. WITH CONTINUED EFFORT AND FOCUS, YOU CAN ACHIEVE EVEN BETTER RESULTS. KEEP WORKING HARD.`
      case "Division 3":
        return `GOOD PERFORMANCE OVERALL ${firstName}. YOU NEED TO WORK HARDER IN YOUR WEAKER SUBJECTS TO IMPROVE YOUR OVERALL STANDING.`
      case "Division 4":
        return `FAIR PERFORMANCE ${firstName}. YOU NEED TO IMPROVE YOUR STUDY HABITS AND SEEK HELP FROM TEACHERS IN DIFFICULT SUBJECTS.`
      case "Ungraded (U)":
        return `${firstName}, SERIOUS ATTENTION IS NEEDED. PLEASE MEET WITH YOUR TEACHERS FOR ADDITIONAL GUIDANCE AND SUPPORT TO IMPROVE YOUR ACADEMIC PERFORMANCE.`
      default:
        return `${firstName}, RESULTS ARE BEING PROCESSED. PLEASE CHECK BACK LATER FOR COMPLETE ASSESSMENT.`
    }
  }

  return (
    <div className="container py-4 print:py-0 print:text-black print:max-w-none">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h1 className="text-2xl font-bold uppercase">PUPIL REPORT CARD</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            BACK
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            PRINT
          </Button>
          <Button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="bg-red-600 hover:bg-red-700">
            <Download className="mr-2 h-4 w-4" />
            {isGeneratingPDF ? "GENERATING..." : "DOWNLOAD PDF"}
          </Button>
        </div>
      </div>

      {/* A4 Paper Container - Centered and Compressed */}
      <div className="print:w-[210mm] print:min-h-[297mm] print:max-w-[210mm] print:mx-auto bg-white print:p-[10mm] print:box-border mx-auto max-w-4xl">
        <Card id="pupil-report-content" className="print:shadow-none print:border-none bg-white relative">
          <CardHeader className="pb-2 print:pb-1">
            <SchoolHeader title="PUPIL REPORT CARD" className="print:border-b-2 print:border-black" />
          </CardHeader>

          <CardContent className="pt-2 relative z-10 print:pt-1 print:text-sm">
            {/* Academic Information */}
            <div className="grid grid-cols-2 gap-3 mb-3 p-2 bg-gray-50 print:bg-white print:border print:border-gray-400">
              <div className="space-y-1">
                <div>
                  <span className="font-semibold text-gray-700 text-sm uppercase">ACADEMIC YEAR:</span>
                  <span className="ml-2 font-bold text-sm uppercase">{schoolSettings.academicYear}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700 text-sm uppercase">TERM:</span>
                  <span className="ml-2 font-bold text-sm uppercase">{schoolSettings.currentTerm}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div>
                  <span className="font-semibold text-gray-700 text-sm uppercase">NEXT TERM BEGINS:</span>
                  <span className="ml-2 font-bold text-sm uppercase">{formatDate(schoolSettings.nextTermBegins)}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700 text-sm uppercase">REPORT DATE:</span>
                  <span className="ml-2 font-bold text-sm uppercase">{new Date().toLocaleDateString("en-GB")}</span>
                </div>
              </div>
            </div>

            {/* Pupil Information */}
            <div className="grid grid-cols-2 gap-3 mb-3 p-2 border-2 border-gray-300">
              <div className="space-y-1">
                <div>
                  <span className="font-semibold text-gray-700 text-sm uppercase">PUPIL NAME:</span>
                  <span className="ml-2 font-bold text-base uppercase">{pupil.name}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700 text-sm uppercase">CLASS:</span>
                  <span className="ml-2 font-bold text-base uppercase">{pupil.class}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div>
                  <span className="font-semibold text-gray-700 text-sm uppercase">SEX:</span>
                  <span className="ml-2 font-bold text-sm uppercase">{pupil.sex}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700 text-sm uppercase">SCHOOL FEES BALANCE:</span>
                  <span className="ml-2 font-bold text-sm">UGX ________________</span>
                </div>
              </div>
            </div>

            {/* Subjects Table */}
            <div className="mb-3">
              <h3 className="text-base font-bold mb-2 text-center uppercase">ACADEMIC PERFORMANCE</h3>
              <Table className="border-2 border-gray-800 text-sm">
                <TableHeader>
                  <TableRow className="bg-gray-200 print:bg-gray-100">
                    <TableHead className="text-center font-bold border border-gray-400 py-1 px-2 uppercase">
                      SUBJECT
                    </TableHead>
                    <TableHead className="text-center font-bold border border-gray-400 py-1 px-2 uppercase">
                      MARKS
                    </TableHead>
                    <TableHead className="text-center font-bold border border-gray-400 py-1 px-2 uppercase">
                      GRADE
                    </TableHead>
                    <TableHead className="text-center font-bold border border-gray-400 py-1 px-2 uppercase">
                      TEACHER
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pupil.marks.map((mark) => (
                    <TableRow key={mark.subject} className="border border-gray-400">
                      <TableCell className="font-medium text-center border border-gray-400 py-1 px-2 uppercase">
                        {mark.subject === "MTC" && "MATHEMATICS"}
                        {mark.subject === "ENG" && "ENGLISH"}
                        {mark.subject === "SCIE" && "SCIENCE"}
                        {mark.subject === "SST" && "SOCIAL STUDIES"}
                      </TableCell>
                      <TableCell className="text-center font-bold border border-gray-400 py-1 px-2">
                        {mark.marks}
                      </TableCell>
                      <TableCell className="text-center font-bold border border-gray-400 py-1 px-2 uppercase">
                        {mark.grade}
                      </TableCell>
                      <TableCell className="text-center border border-gray-400 py-1 px-2 uppercase">
                        {mark.teacherName || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-2 gap-4 mb-3 p-2 bg-gray-50 print:bg-white print:border-2 print:border-gray-400">
              <div className="space-y-2">
                <div className="text-center">
                  <span className="font-semibold text-gray-700 block text-sm uppercase">TOTAL MARKS:</span>
                  <span className="text-lg font-bold text-blue-600">{pupil.totalMarks || "NOT CALCULATED"}</span>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-gray-700 block text-sm uppercase">TOTAL AGGREGATE:</span>
                  <span className="text-lg font-bold text-green-600">{pupil.totalAggregate || "NOT CALCULATED"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-center">
                  <span className="font-semibold text-gray-700 block text-sm uppercase">DIVISION:</span>
                  <span className="text-lg font-bold text-purple-600 uppercase">
                    {pupil.division || "NOT CALCULATED"}
                  </span>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-gray-700 block text-sm uppercase">POSITION IN CLASS:</span>
                  <span className="text-lg font-bold text-orange-600">{pupil.position || "NOT CALCULATED"}</span>
                </div>
              </div>
            </div>

            {/* Teacher's Comments */}
            <div className="mb-3 p-2 border-2 border-gray-400">
              <h3 className="font-bold mb-2 text-center text-sm uppercase">TEACHER'S COMMENTS</h3>
              <div className="min-h-[50px] p-2 bg-gray-50 print:bg-white border border-gray-300 rounded">
                <p className="text-xs leading-relaxed uppercase">
                  {getPersonalizedComment(pupil.division, pupil.name)}
                </p>
              </div>
            </div>

            {/* Grading Scale */}
            <GradingScale />
          </CardContent>

          <CardFooter className="flex-col items-start border-t-2 border-gray-800 pt-3 print:pt-2">
            <div className="w-full grid grid-cols-3 gap-4 mb-3">
              <div className="text-center">
                <p className="font-semibold text-gray-700 mb-1 text-xs uppercase">CLASS TEACHER</p>
                <div className="border-b-2 border-dashed border-gray-400 h-6 mb-1"></div>
                <p className="text-xs text-gray-600 uppercase">SIGNATURE & DATE</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-700 mb-1 text-xs uppercase">HEAD TEACHER</p>
                <div className="border-b-2 border-dashed border-gray-400 h-6 mb-1"></div>
                <p className="text-xs text-gray-600 uppercase">SIGNATURE & DATE</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-700 mb-1 text-xs uppercase">PARENT/GUARDIAN</p>
                <div className="border-b-2 border-dashed border-gray-400 h-6 mb-1"></div>
                <p className="text-xs text-gray-600 uppercase">SIGNATURE & DATE</p>
              </div>
            </div>

            <div className="w-full text-center text-xs text-gray-600 border-t border-gray-300 pt-2">
              <p className="font-semibold uppercase">
                THIS REPORT WAS GENERATED ON{" "}
                {new Date().toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="mt-1 italic uppercase">
                "EDUCATION IS THE MOST POWERFUL WEAPON WHICH YOU CAN USE TO CHANGE THE WORLD" - NELSON MANDELA
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
