"use client"

import { usePupilData } from "@/lib/pupil-data-provider"
import { SchoolHeader } from "@/components/school-header"
import { GradingScale } from "@/components/grading-scale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

interface BulkReportGeneratorProps {
  className: string
}

export function BulkReportGenerator({ className }: BulkReportGeneratorProps) {
  const { pupils, schoolSettings } = usePupilData()
  const classPupils = pupils.filter((pupil) => pupil.class === className)

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
    <div className="hidden print:hidden">
      {classPupils.map((pupil, index) => (
        <div
          key={pupil.id}
          id={`pupil-report-${pupil.id}`}
          className="w-[210mm] min-h-[297mm] bg-white p-[10mm] box-border text-black"
          style={{ pageBreakAfter: index < classPupils.length - 1 ? "always" : "auto" }}
        >
          <Card className="shadow-none border-none bg-white h-full">
            <CardHeader className="pb-2">
              {/* School Header with Photo on the Right */}
              <div className="relative">
                <SchoolHeader title="PUPIL REPORT CARD" className="border-b-2 border-black" />

                {/* Pupil Photo positioned on the right side - Only if photo exists */}
                {pupil.photo && pupil.photo.trim() !== "" && (
                  <div className="absolute top-6 right-2 z-20">
                    <div className="bg-white border-2 border-gray-600 p-1">
                      <img
                        src={pupil.photo || "/placeholder.svg"}
                        alt={`${pupil.name} photo`}
                        className="w-16 h-16 object-cover"
                        onError={(e) => {
                          console.log(
                            "Image failed to load for bulk report, removing from DOM:",
                            pupil.photo?.substring(0, 50),
                          )
                          // Completely remove the image element from DOM
                          const imgElement = e.currentTarget
                          const parentDiv = imgElement.closest(".absolute")
                          if (parentDiv) {
                            parentDiv.remove()
                          } else {
                            imgElement.remove()
                          }
                        }}
                        onLoad={(e) => {
                          // Validate image after loading
                          const img = e.currentTarget
                          if (img.naturalWidth === 0 || img.naturalHeight === 0) {
                            console.log("Image has no dimensions, removing from DOM:", pupil.photo?.substring(0, 50))
                            const parentDiv = img.closest(".absolute")
                            if (parentDiv) {
                              parentDiv.remove()
                            } else {
                              img.remove()
                            }
                          }
                        }}
                        style={{
                          // Ensure image doesn't cause layout issues
                          maxWidth: "64px",
                          maxHeight: "64px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-1 text-xs">
              {/* Academic Information */}
              <div className="grid grid-cols-2 gap-2 mb-3 p-2 bg-gray-100 border border-gray-400">
                <div className="space-y-1">
                  <div>
                    <span className="font-semibold text-gray-700 text-xs uppercase">ACADEMIC YEAR:</span>
                    <span className="ml-1 font-bold text-xs uppercase">{pupil.academicYear}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 text-xs uppercase">TERM:</span>
                    <span className="ml-1 font-bold text-xs uppercase">{pupil.academicTerm}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div>
                    <span className="font-semibold text-gray-700 text-xs uppercase">NEXT TERM BEGINS:</span>
                    <span className="ml-1 font-bold text-xs uppercase">
                      {formatDate(schoolSettings.nextTermBegins)}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 text-xs uppercase">REPORT DATE:</span>
                    <span className="ml-1 font-bold text-xs uppercase">{new Date().toLocaleDateString("en-GB")}</span>
                  </div>
                </div>
              </div>

              {/* Pupil Information */}
              <div className="grid grid-cols-2 gap-2 mb-3 p-2 border-2 border-gray-300 bg-gray-50">
                <div className="space-y-1">
                  <div>
                    <span className="font-semibold text-gray-700 text-xs uppercase">PUPIL NAME:</span>
                    <span className="ml-1 font-bold text-sm uppercase">{pupil.name}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 text-xs uppercase">CLASS:</span>
                    <span className="ml-1 font-bold text-sm uppercase">{pupil.class}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div>
                    <span className="font-semibold text-gray-700 text-xs uppercase">SEX:</span>
                    <span className="ml-1 font-bold text-xs uppercase">{pupil.sex}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 text-xs uppercase">SCHOOL FEES BALANCE:</span>
                    <span className="ml-1 font-bold text-xs">UGX ________________</span>
                  </div>
                </div>
              </div>

              {/* Subjects Table */}
              <div className="mb-3">
                <h3 className="text-sm font-bold mb-1 text-center uppercase bg-gray-800 text-white py-1">
                  ACADEMIC PERFORMANCE
                </h3>
                <Table className="border-2 border-gray-800 text-xs">
                  <TableHeader>
                    <TableRow className="bg-gray-200">
                      <TableHead className="text-center font-bold border border-gray-400 py-1 px-2 text-xs uppercase">
                        SUBJECT
                      </TableHead>
                      <TableHead className="text-center font-bold border border-gray-400 py-1 px-2 text-xs uppercase">
                        MARKS
                      </TableHead>
                      <TableHead className="text-center font-bold border border-gray-400 py-1 px-2 text-xs uppercase">
                        GRADE
                      </TableHead>
                      <TableHead className="text-center font-bold border border-gray-400 py-1 px-2 text-xs uppercase">
                        REMARKS
                      </TableHead>
                      <TableHead className="text-center font-bold border border-gray-400 py-1 px-2 text-xs uppercase">
                        TEACHER
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pupil.marks.map((mark, markIndex) => (
                      <TableRow
                        key={mark.subject}
                        className={`border border-gray-400 ${markIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                      >
                        <TableCell className="font-medium text-center border border-gray-400 py-1 px-2 text-xs uppercase">
                          {mark.subject === "MTC" && "MATHEMATICS"}
                          {mark.subject === "ENG" && "ENGLISH"}
                          {mark.subject === "SCIE" && "SCIENCE"}
                          {mark.subject === "SST" && "SOCIAL STUDIES"}
                        </TableCell>
                        <TableCell className="text-center font-bold border border-gray-400 py-1 px-2 text-xs">
                          {mark.marks}
                        </TableCell>
                        <TableCell className="text-center font-bold border border-gray-400 py-1 px-2 text-xs uppercase">
                          {mark.grade}
                        </TableCell>
                        <TableCell className="text-center border border-gray-400 py-1 px-2 text-xs uppercase">
                          {getRemarkFromGrade(mark.grade)}
                        </TableCell>
                        <TableCell className="text-center border border-gray-400 py-1 px-2 text-xs uppercase">
                          {mark.teacherName || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Performance Summary - Single Line */}
              <div className="mb-3 p-2 border-2 border-gray-400 bg-gray-100">
                <div className="flex justify-center items-center gap-6 text-xs">
                  <div className="text-center">
                    <span className="font-semibold text-gray-700 block text-xs uppercase">TOTAL MARKS:</span>
                    <span className="text-lg font-bold">{pupil.totalMarks || "NOT CALCULATED"}</span>
                  </div>
                  <div className="text-center">
                    <span className="font-semibold text-gray-700 block text-xs uppercase">TOTAL AGGREGATE:</span>
                    <span className="text-lg font-bold">{pupil.totalAggregate || "NOT CALCULATED"}</span>
                  </div>
                  <div className="text-center">
                    <span className="font-semibold text-gray-700 block text-xs uppercase">DIVISION:</span>
                    <span className="text-lg font-bold uppercase">{pupil.division || "NOT CALCULATED"}</span>
                  </div>
                </div>
              </div>

              {/* Class Teacher's Comments */}
              <div className="mb-2 p-2 border-2 border-gray-400 bg-gray-50">
                <h3 className="font-bold mb-1 text-center text-xs uppercase">CLASS TEACHER'S COMMENTS</h3>
                <div className="min-h-[30px] p-2 border border-gray-300 bg-white">
                  <p className="text-xs leading-relaxed uppercase">
                    {getPersonalizedComment(pupil.division, pupil.name)}
                  </p>
                </div>
              </div>

              {/* Grading Scale */}
              <div className="mb-3">
                <GradingScale />
              </div>
            </CardContent>

            <CardFooter className="flex-col items-start border-t-2 border-gray-800 pt-2 text-xs">
              {/* Both Signatures on Same Line */}
              <div className="w-full grid grid-cols-2 gap-4 mb-2">
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

              <div className="w-full text-center text-xs text-gray-600 border-t border-gray-300 pt-2">
                <p className="font-bold uppercase text-sm">"WITH GOD WE EXCEL"</p>
              </div>
            </CardFooter>
          </Card>
        </div>
      ))}
    </div>
  )
}
