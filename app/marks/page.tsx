"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { usePupilData, type Subject } from "@/lib/pupil-data-provider"
import { useToast } from "@/components/ui/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { RefreshCw } from "lucide-react"

export default function MarksEntryPage() {
  const { pupils, updatePupil, getGrade, loading, refreshPupils } = usePupilData()
  const [selectedClass, setSelectedClass] = useState<string>("")
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [marksState, setMarksState] = useState<Record<string, Record<Subject, number>>>({})

  const classPupils = selectedClass ? pupils.filter((pupil) => pupil.class === selectedClass) : []

  const handleMarksChange = (pupilId: string, subject: Subject, value: string) => {
    const numValue = Number.parseInt(value, 10)
    const validValue = isNaN(numValue) ? 0 : Math.min(100, Math.max(0, numValue))

    setMarksState((prev) => ({
      ...prev,
      [pupilId]: {
        ...(prev[pupilId] || {}),
        [subject]: validValue,
      },
    }))
  }

  const getSubjectMark = (pupilId: string, subject: Subject) => {
    // First check if we have a value in the state
    if (marksState[pupilId]?.[subject] !== undefined) {
      return marksState[pupilId][subject].toString()
    }

    // Otherwise get from the pupil data
    const pupil = pupils.find((p) => p.id === pupilId)
    if (!pupil) return ""

    const mark = pupil.marks.find((m) => m.subject === subject)
    return mark ? mark.marks.toString() : ""
  }

  const handleSaveMarks = async () => {
    if (!selectedClass || Object.keys(marksState).length === 0) {
      toast({
        title: "No changes",
        description: "No marks have been changed to save.",
      })
      return
    }

    setIsSaving(true)

    try {
      // For each pupil with changed marks
      for (const [pupilId, subjectMarks] of Object.entries(marksState)) {
        const pupil = pupils.find((p) => p.id === pupilId)
        if (!pupil) continue

        // Get existing marks to preserve teacher names
        const existingMarks = pupil.marks.reduce(
          (acc, mark) => {
            acc[mark.subject] = mark.teacherName || ""
            return acc
          },
          {} as Record<Subject, string>,
        )

        // Prepare marks for update
        const marksToUpdate = Object.entries(subjectMarks).map(([subject, marks]) => ({
          subject: subject as Subject,
          marks,
          teacherName: existingMarks[subject as Subject] || undefined,
        }))

        // Update the pupil
        await updatePupil(pupilId, { marks: marksToUpdate })
      }

      // Clear the marks state after saving
      setMarksState({})

      toast({
        title: "Marks Saved",
        description: `Marks for ${selectedClass} have been saved successfully.`,
      })
    } catch (error) {
      console.error("Error saving marks:", error)
      toast({
        title: "Error",
        description: "Failed to save marks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshPupils()
    setMarksState({}) // Clear local state
    setIsRefreshing(false)
    toast({
      title: "Data refreshed",
      description: "The pupil data has been refreshed from the database.",
    })
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Marks Entry</h1>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
      </div>

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
          {loading ? (
            <LoadingSpinner className="py-8" />
          ) : selectedClass ? (
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
                              disabled={isSaving}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-6 flex justify-end">
                  <Button onClick={handleSaveMarks} disabled={isSaving || Object.keys(marksState).length === 0}>
                    {isSaving ? (
                      <>
                        <LoadingSpinner className="mr-2 h-4 w-4" />
                        Saving...
                      </>
                    ) : (
                      "Save Marks"
                    )}
                  </Button>
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
