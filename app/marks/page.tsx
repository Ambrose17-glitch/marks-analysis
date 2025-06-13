"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { usePupilData, type Subject } from "@/lib/pupil-data-provider"
import { useToast } from "@/components/ui/use-toast"

export default function MarksEntryPage() {
  const { pupils, updatePupil, getGrade } = usePupilData()
  const [selectedClass, setSelectedClass] = useState<string>("")
  const { toast } = useToast()

  const classPupils = selectedClass ? pupils.filter((pupil) => pupil.class === selectedClass) : []

  const handleMarksChange = (pupilId: string, subject: Subject, value: string) => {
    const numValue = Number.parseInt(value, 10)
    const validValue = isNaN(numValue) ? 0 : Math.min(100, Math.max(0, numValue))

    const pupil = pupils.find((p) => p.id === pupilId)
    if (!pupil) return

    const { grade, points } = getGrade(validValue)

    const updatedMarks = [...pupil.marks]
    const markIndex = updatedMarks.findIndex((m) => m.subject === subject)

    if (markIndex >= 0) {
      updatedMarks[markIndex] = {
        ...updatedMarks[markIndex],
        marks: validValue,
        grade,
        points,
      }
    } else {
      updatedMarks.push({
        subject,
        marks: validValue,
        grade,
        points,
      })
    }

    updatePupil(pupilId, { marks: updatedMarks })
  }

  const getSubjectMark = (pupilId: string, subject: Subject) => {
    const pupil = pupils.find((p) => p.id === pupilId)
    if (!pupil) return ""

    const mark = pupil.marks.find((m) => m.subject === subject)
    return mark ? mark.marks.toString() : ""
  }

  const handleSaveMarks = () => {
    toast({
      title: "Marks Saved",
      description: `Marks for ${selectedClass} have been saved successfully.`,
    })
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Marks Entry</h1>

      <Card>
        <CardHeader>
          <CardTitle>Enter Pupil Marks</CardTitle>
          <CardDescription>Select a class and enter marks for each pupil.</CardDescription>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Select class:</span>
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
          </div>
        </CardHeader>
        <CardContent>
          {selectedClass ? (
            classPupils.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pupil Name</TableHead>
                      <TableHead>Mathematics (MTC)</TableHead>
                      <TableHead>English (ENG)</TableHead>
                      <TableHead>Science (SCIE)</TableHead>
                      <TableHead>Social Studies (SST)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classPupils.map((pupil) => (
                      <TableRow key={pupil.id}>
                        <TableCell className="font-medium">{pupil.name}</TableCell>
                        {(["MTC", "ENG", "SCIE", "SST"] as Subject[]).map((subject) => (
                          <TableCell key={`${pupil.id}-${subject}`}>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={getSubjectMark(pupil.id, subject)}
                              onChange={(e) => handleMarksChange(pupil.id, subject, e.target.value)}
                              className="w-20"
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-6 flex justify-end">
                  <Button onClick={handleSaveMarks}>Save Marks</Button>
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No pupils found in {selectedClass}. Please add pupils to this class first.
              </div>
            )
          ) : (
            <div className="text-center py-6 text-muted-foreground">Please select a class to enter marks.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
