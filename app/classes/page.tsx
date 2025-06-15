"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePupilData } from "@/lib/pupil-data-provider"
import { Users, FileText } from "lucide-react"
import { useEffect } from "react"

export default function ClassesPage() {
  const { pupils, calculateResults } = usePupilData()

  // Count pupils per class
  const classCounts = {
    "P.4": pupils.filter((pupil) => pupil.class === "P.4").length,
    "P.5": pupils.filter((pupil) => pupil.class === "P.5").length,
    "P.6": pupils.filter((pupil) => pupil.class === "P.6").length,
    "P.7": pupils.filter((pupil) => pupil.class === "P.7").length,
  }

  // Count divisions per class
  const classDivisions = ["P.4", "P.5", "P.6", "P.7"].map((className) => {
    const classPupils = pupils.filter((pupil) => pupil.class === className)

    const divisionCounts = classPupils.reduce(
      (counts, pupil) => {
        if (pupil.division) {
          counts[pupil.division] = (counts[pupil.division] || 0) + 1
        }
        return counts
      },
      {} as Record<string, number>,
    )

    return {
      className,
      divisions: {
        "Division 1": divisionCounts["Division 1"] || 0,
        "Division 2": divisionCounts["Division 2"] || 0,
        "Division 3": divisionCounts["Division 3"] || 0,
        "Division 4": divisionCounts["Division 4"] || 0,
        "Ungraded (U)": divisionCounts["Ungraded (U)"] || 0,
      },
    }
  })

  // Add auto-calculation for all classes
  useEffect(() => {
    const classesNeedingCalculation = ["P.4", "P.5", "P.6", "P.7"].filter((className) => {
      const classPupils = pupils.filter((pupil) => pupil.class === className)
      return classPupils.some(
        (pupil) =>
          pupil.marks.length > 0 &&
          (pupil.totalMarks === undefined ||
            pupil.totalAggregate === undefined ||
            pupil.division === undefined ||
            pupil.position === undefined),
      )
    })

    // Calculate results for classes that need it
    classesNeedingCalculation.forEach((className) => {
      calculateResults(className)
    })
  }, [pupils, calculateResults])

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Classes Management</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {["P.4", "P.5", "P.6", "P.7"].map((className) => (
          <Card key={className}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Class {className}</span>
              </CardTitle>
              <CardDescription>{classCounts[className as keyof typeof classCounts]} pupils</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Division 1:</span>
                  <span>{classDivisions.find((c) => c.className === className)?.divisions["Division 1"] || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Division 2:</span>
                  <span>{classDivisions.find((c) => c.className === className)?.divisions["Division 2"] || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Division 3:</span>
                  <span>{classDivisions.find((c) => c.className === className)?.divisions["Division 3"] || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Division 4:</span>
                  <span>{classDivisions.find((c) => c.className === className)?.divisions["Division 4"] || 0}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/reports/class/${className}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="h-4 w-4 mr-1" />
                    Report
                  </Button>
                </Link>
                <Link href={`/pupils?class=${className}`} className="flex-1">
                  <Button size="sm" className="w-full">
                    <Users className="h-4 w-4 mr-1" />
                    Pupils
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Overview</CardTitle>
          <CardDescription>Summary of all classes and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Total Pupils</TableHead>
                <TableHead>Division 1</TableHead>
                <TableHead>Division 2</TableHead>
                <TableHead>Division 3</TableHead>
                <TableHead>Division 4</TableHead>
                <TableHead>Ungraded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classDivisions.map((classData) => (
                <TableRow key={classData.className}>
                  <TableCell className="font-medium">{classData.className}</TableCell>
                  <TableCell>{classCounts[classData.className as keyof typeof classCounts]}</TableCell>
                  <TableCell>{classData.divisions["Division 1"]}</TableCell>
                  <TableCell>{classData.divisions["Division 2"]}</TableCell>
                  <TableCell>{classData.divisions["Division 3"]}</TableCell>
                  <TableCell>{classData.divisions["Division 4"]}</TableCell>
                  <TableCell>{classData.divisions["Ungraded (U)"]}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/reports/class/${classData.className}`}>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Report</span>
                        </Button>
                      </Link>
                      <Link href={`/pupils?class=${classData.className}`}>
                        <Button size="sm">
                          <Users className="h-4 w-4" />
                          <span className="sr-only">Pupils</span>
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
