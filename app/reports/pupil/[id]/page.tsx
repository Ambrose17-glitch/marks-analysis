"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePupilData } from "@/lib/pupil-data-provider"
import { ArrowLeft, Printer } from "lucide-react"

export default function PupilReportPage() {
  const router = useRouter()
  const params = useParams()
  const { pupils } = usePupilData()

  const pupilId = params.id as string
  const pupil = pupils.find((p) => p.id === pupilId)

  const handlePrint = () => {
    window.print()
  }

  if (!pupil) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Pupil Report</h1>
        <div className="text-center py-12 text-muted-foreground">
          Pupil not found. The requested pupil may have been deleted.
        </div>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8 print:py-2">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-3xl font-bold">Pupil Report Card</h1>
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

      <Card className="print:shadow-none print:border-none">
        <CardHeader className="text-center border-b">
          <CardTitle className="text-2xl">Bright Generation Learning Centre</CardTitle>
          <CardDescription className="text-lg">Kalisizo</CardDescription>
          <div className="text-xl font-bold mt-2">PUPIL REPORT CARD</div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-muted-foreground">Pupil Name:</p>
              <p className="font-bold text-lg">{pupil.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Class:</p>
              <p className="font-bold text-lg">{pupil.class}</p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Teacher</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pupil.marks.map((mark) => (
                <TableRow key={mark.subject}>
                  <TableCell className="font-medium">
                    {mark.subject === "MTC" && "Mathematics"}
                    {mark.subject === "ENG" && "English"}
                    {mark.subject === "SCIE" && "Science"}
                    {mark.subject === "SST" && "Social Studies"}
                  </TableCell>
                  <TableCell>{mark.marks}</TableCell>
                  <TableCell>{mark.grade}</TableCell>
                  <TableCell>{mark.points}</TableCell>
                  <TableCell>{mark.teacherName || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="grid grid-cols-2 gap-8 mt-8">
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground">Total Marks:</p>
                <p className="font-bold text-lg">{pupil.totalMarks || "Not calculated"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Aggregate:</p>
                <p className="font-bold text-lg">{pupil.totalAggregate || "Not calculated"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground">Division:</p>
                <p className="font-bold text-lg">{pupil.division || "Not calculated"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Position in Class:</p>
                <p className="font-bold text-lg">{pupil.position || "Not calculated"}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t">
            <h3 className="font-bold mb-2">Teacher's Comments:</h3>
            <div className="min-h-[100px] border p-4 rounded-md">
              {pupil.division === "Division 1" && "Excellent performance! Keep up the good work."}
              {pupil.division === "Division 2" &&
                "Good performance. With more effort, you can achieve even better results."}
              {pupil.division === "Division 3" && "Fair performance. You need to work harder in your weak subjects."}
              {pupil.division === "Division 4" &&
                "You need to improve your study habits and seek help in difficult subjects."}
              {pupil.division === "Ungraded (U)" &&
                "Serious attention is needed. Please meet with your teachers for guidance."}
              {!pupil.division && "Results not yet calculated."}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start border-t pt-6">
          <div className="w-full flex justify-between mt-8">
            <div>
              <p className="text-muted-foreground">Class Teacher's Signature</p>
              <div className="mt-8 border-b border-dashed w-40"></div>
            </div>
            <div>
              <p className="text-muted-foreground">Head Teacher's Signature</p>
              <div className="mt-8 border-b border-dashed w-40"></div>
            </div>
          </div>
          <div className="w-full text-center mt-8 text-sm text-muted-foreground">
            <p>This report was generated on {new Date().toLocaleDateString()}</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
