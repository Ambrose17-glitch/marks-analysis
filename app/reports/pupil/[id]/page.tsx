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

  const getRemarkFromGrade = (grade: string) => {
    switch (grade) {
      case "D1":
        return "EXCELLENT"
      case "D2":
        return "VERY GOOD"
      case "C3":
        return "GOOD"
      case "C4":
        return "SATISFACTORY"
      case "C5":
        return "FAIR"
      case "C6":
        return "PASS"
      case "P7":
        return "WEAK PASS"
      case "P8":
        return "POOR"
      case "F9":
        return "FAIL"
      default:
        return "-"
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
            {/* School Header with Photo on the Right */}
            <div className="relative">
              <SchoolHeader title="PUPIL REPORT CARD" className="print:border-b-2 print:border-black" />

              {/* Pupil Photo positioned on the right side - Only if photo exists */}
              {pupil.photo && pupil.photo.trim() !== "" && (
                <div className="absolute top-8 right-4 print:top-6 print:right-2 z-20">
                  <div className="bg-white border-2 border-blue-600 p-1 shadow-lg">
                    <img
                      src={pupil.photo || "/placeholder.svg"}
                      alt={`${pupil.name} photo`}
                      className="w-20 h-20 print:w-16 print:h-16 object-cover"
                      onError={(e) => {
                        console.log("Image failed to load:", pupil.photo)
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-2 relative z-10 print:pt-1 print:text-sm">
            {/* Academic Information */}
            <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 print:bg-gray-100 border-2 border-blue-200 print:border-gray-400 rounded-lg print:rounded-none">
              <div className="space-y-1">
                <div>
                  <span className="font-semibold text-blue-800 print:text-gray-700 text-sm uppercase">
                    ACADEMIC YEAR:
                  </span>
                  <span className="ml-2 font-bold text-blue-900 print:text-black text-sm uppercase">
                    {pupil.academicYear}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-blue-800 print:text-gray-700 text-sm uppercase">TERM:</span>
                  <span className="ml-2 font-bold text-blue-900 print:text-black text-sm uppercase">
                    {pupil.academicTerm}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div>
                  <span className="font-semibold text-blue-800 print:text-gray-700 text-sm uppercase">
                    NEXT TERM BEGINS:
                  </span>
                  <span className="ml-2 font-bold text-blue-900 print:text-black text-sm uppercase">
                    {formatDate(schoolSettings.nextTermBegins)}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-blue-800 print:text-gray-700 text-sm uppercase">
                    REPORT DATE:
                  </span>
                  <span className="ml-2 font-bold text-blue-900 print:text-black text-sm uppercase">
                    {new Date().toLocaleDateString("en-GB")}
                  </span>
                </div>
              </div>
            </div>

            {/* Pupil Information */}
            <div className="grid grid-cols-2 gap-3 mb-3 p-3 border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 print:bg-gray-50 print:border-gray-400 rounded-lg print:rounded-none">
              <div className="space-y-1">
                <div>
                  <span className="font-semibold text-green-800 print:text-gray-700 text-sm uppercase">
                    PUPIL NAME:
                  </span>
                  <span className="ml-2 font-bold text-green-900 print:text-black text-base uppercase">
                    {pupil.name}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-green-800 print:text-gray-700 text-sm uppercase">CLASS:</span>
                  <span className="ml-2 font-bold text-green-900 print:text-black text-base uppercase">
                    {pupil.class}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div>
                  <span className="font-semibold text-green-800 print:text-gray-700 text-sm uppercase">SEX:</span>
                  <span className="ml-2 font-bold text-green-900 print:text-black text-sm uppercase">{pupil.sex}</span>
                </div>
                <div>
                  <span className="font-semibold text-green-800 print:text-gray-700 text-sm uppercase">
                    SCHOOL FEES BALANCE:
                  </span>
                  <span className="ml-2 font-bold text-green-900 print:text-black text-sm">UGX ________________</span>
                </div>
              </div>
            </div>

            {/* Subjects Table */}
            <div className="mb-3">
              <h3 className="text-base font-bold mb-2 text-center uppercase bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 print:bg-gray-800 print:text-white rounded-lg print:rounded-none">
                ACADEMIC PERFORMANCE
              </h3>
              <Table className="border-2 border-purple-300 print:border-gray-800 text-sm rounded-lg print:rounded-none overflow-hidden">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-purple-100 to-blue-100 print:bg-gray-200">
                    <TableHead className="text-center font-bold border border-purple-200 print:border-gray-400 py-2 px-2 uppercase text-purple-800 print:text-black">
                      SUBJECT
                    </TableHead>
                    <TableHead className="text-center font-bold border border-purple-200 print:border-gray-400 py-2 px-2 uppercase text-purple-800 print:text-black">
                      MARKS
                    </TableHead>
                    <TableHead className="text-center font-bold border border-purple-200 print:border-gray-400 py-2 px-2 uppercase text-purple-800 print:text-black">
                      GRADE
                    </TableHead>
                    <TableHead className="text-center font-bold border border-purple-200 print:border-gray-400 py-2 px-2 uppercase text-purple-800 print:text-black">
                      REMARKS
                    </TableHead>
                    <TableHead className="text-center font-bold border border-purple-200 print:border-gray-400 py-2 px-2 uppercase text-purple-800 print:text-black">
                      TEACHER
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pupil.marks.map((mark, index) => (
                    <TableRow
                      key={mark.subject}
                      className={`border border-purple-200 print:border-gray-400 ${index % 2 === 0 ? "bg-purple-25 print:bg-white" : "bg-white print:bg-gray-50"}`}
                    >
                      <TableCell className="font-medium text-center border border-purple-200 print:border-gray-400 py-2 px-2 uppercase text-purple-900 print:text-black">
                        {mark.subject === "MTC" && "MATHEMATICS"}
                        {mark.subject === "ENG" && "ENGLISH"}
                        {mark.subject === "SCIE" && "SCIENCE"}
                        {mark.subject === "SST" && "SOCIAL STUDIES"}
                      </TableCell>
                      <TableCell className="text-center font-bold border border-purple-200 print:border-gray-400 py-2 px-2 text-blue-600 print:text-black">
                        {mark.marks}
                      </TableCell>
                      <TableCell className="text-center font-bold border border-purple-200 print:border-gray-400 py-2 px-2 uppercase text-green-600 print:text-black">
                        {mark.grade}
                      </TableCell>
                      <TableCell className="text-center border border-purple-200 print:border-gray-400 py-2 px-2 uppercase text-xs text-orange-600 print:text-black">
                        {getRemarkFromGrade(mark.grade)}
                      </TableCell>
                      <TableCell className="text-center border border-purple-200 print:border-gray-400 py-2 px-2 uppercase text-gray-700 print:text-black">
                        {mark.teacherName || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Performance Summary - Single Line with Professional Colors */}
            <div className="mb-3 p-4 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 print:bg-gray-100 border-2 border-amber-300 print:border-gray-400 rounded-lg print:rounded-none">
              <div className="flex justify-center items-center gap-8">
                <div className="text-center">
                  <span className="font-semibold text-amber-800 print:text-gray-700 block text-sm uppercase">
                    TOTAL MARKS:
                  </span>
                  <span className="text-xl font-bold text-blue-600 print:text-black">
                    {pupil.totalMarks || "NOT CALCULATED"}
                  </span>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-amber-800 print:text-gray-700 block text-sm uppercase">
                    TOTAL AGGREGATE:
                  </span>
                  <span className="text-xl font-bold text-green-600 print:text-black">
                    {pupil.totalAggregate || "NOT CALCULATED"}
                  </span>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-amber-800 print:text-gray-700 block text-sm uppercase">
                    DIVISION:
                  </span>
                  <span className="text-xl font-bold text-purple-600 print:text-black uppercase">
                    {pupil.division || "NOT CALCULATED"}
                  </span>
                </div>
              </div>
            </div>

            {/* Class Teacher's Comments */}
            <div className="mb-3 p-3 border-2 border-teal-300 bg-gradient-to-r from-teal-50 to-cyan-50 print:bg-gray-50 print:border-gray-400 rounded-lg print:rounded-none">
              <h3 className="font-bold mb-2 text-center text-sm uppercase text-teal-800 print:text-black">
                CLASS TEACHER'S COMMENTS
              </h3>
              <div className="min-h-[40px] p-3 bg-white print:bg-white border border-teal-200 print:border-gray-300 rounded print:rounded-none">
                <p className="text-xs leading-relaxed uppercase text-gray-800 print:text-black">
                  {getPersonalizedComment(pupil.division, pupil.name)}
                </p>
              </div>
            </div>

            {/* Grading Scale */}
            <GradingScale />
          </CardContent>

          <CardFooter className="flex-col items-start border-t-2 border-gray-800 pt-3 print:pt-2">
            {/* Both Signatures on Same Line */}
            <div className="w-full grid grid-cols-2 gap-8 mb-3">
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
            </div>

            <div className="w-full text-center text-sm text-gray-600 border-t border-gray-300 pt-2">
              <p className="font-bold uppercase text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent print:text-black">
                "WITH GOD WE EXCEL"
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
