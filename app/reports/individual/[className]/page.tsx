"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePupilData } from "@/lib/pupil-data-provider"
import { ArrowLeft, FileText } from "lucide-react"

export default function IndividualReportsPage() {
  const router = useRouter()
  const params = useParams()
  const { pupils, calculateResults } = usePupilData()

  const className = params.className as string
  const classPupils = pupils.filter((pupil) => pupil.class === className)

  // Calculate results if not already done
  if (classPupils.some((pupil) => !pupil.position)) {
    calculateResults(className)
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Individual Reports: {className}</h1>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Individual Report Cards</CardTitle>
          <CardDescription>Access individual report cards for all pupils in {className}</CardDescription>
        </CardHeader>
        <CardContent>
          {classPupils.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Total Marks</TableHead>
                  <TableHead>Aggregate</TableHead>
                  <TableHead>Division</TableHead>
                  <TableHead className="text-right">Report Card</TableHead>
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
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No pupils found in {className}. Please add pupils to this class first.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
