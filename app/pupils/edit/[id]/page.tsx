"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePupilData, type Pupil, type Subject } from "@/lib/pupil-data-provider"
import { useToast } from "@/components/ui/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function EditPupilPage() {
  const router = useRouter()
  const params = useParams()
  const { pupils, updatePupil, loading } = usePupilData()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const pupilId = params.id as string
  const pupil = pupils.find((p) => p.id === pupilId)

  const [name, setName] = useState("")
  const [className, setClassName] = useState<string>("")
  const [marks, setMarks] = useState<Record<Subject, { marks: number; teacherName: string }>>({
    MTC: { marks: 0, teacherName: "" },
    ENG: { marks: 0, teacherName: "" },
    SCIE: { marks: 0, teacherName: "" },
    SST: { marks: 0, teacherName: "" },
  })

  // Load pupil data when component mounts
  useEffect(() => {
    if (pupil) {
      setName(pupil.name)
      setClassName(pupil.class)

      // Initialize marks from pupil data
      const initialMarks: Record<Subject, { marks: number; teacherName: string }> = {
        MTC: { marks: 0, teacherName: "" },
        ENG: { marks: 0, teacherName: "" },
        SCIE: { marks: 0, teacherName: "" },
        SST: { marks: 0, teacherName: "" },
      }

      // Fill in existing marks
      pupil.marks.forEach((mark) => {
        initialMarks[mark.subject] = {
          marks: mark.marks,
          teacherName: mark.teacherName || "",
        }
      })

      setMarks(initialMarks)
    } else if (!loading) {
      // Pupil not found, redirect back to pupils list
      toast({
        title: "Error",
        description: "Pupil not found",
        variant: "destructive",
      })
      router.push("/pupils")
    }
  }, [pupil, router, toast, loading])

  const handleMarksChange = (subject: Subject, value: string) => {
    const numValue = Number.parseInt(value, 10)
    const validValue = isNaN(numValue) ? 0 : Math.min(100, Math.max(0, numValue))

    setMarks((prev) => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        marks: validValue,
      },
    }))
  }

  const handleTeacherChange = (subject: Subject, value: string) => {
    setMarks((prev) => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        teacherName: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter the pupil's name",
        variant: "destructive",
      })
      return
    }

    if (!className) {
      toast({
        title: "Error",
        description: "Please select a class",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Convert marks to the required format
      const formattedMarks = Object.entries(marks).map(([subject, data]) => {
        return {
          subject: subject as Subject,
          marks: data.marks,
          teacherName: data.teacherName || undefined,
        }
      })

      // Update the pupil
      await updatePupil(pupilId, {
        name,
        class: className as Pupil["class"],
        marks: formattedMarks,
      })

      router.push("/pupils")
    } catch (error) {
      console.error("Error updating pupil:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading && !isSubmitting) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Edit Pupil</h1>
        <Card>
          <CardContent className="py-10">
            <LoadingSpinner />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!pupil && !loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Edit Pupil</h1>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">Pupil not found</p>
            <Button className="mt-4" onClick={() => router.push("/pupils")}>
              Back to Pupils
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Pupil</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Edit Pupil Information</CardTitle>
            <CardDescription>Update the pupil's details and subject marks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Pupil Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Select value={className} onValueChange={setClassName} disabled={isSubmitting}>
                  <SelectTrigger id="class">
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
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Subject Marks</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(["MTC", "ENG", "SCIE", "SST"] as Subject[]).map((subject) => (
                  <div key={subject} className="space-y-4 p-4 border rounded-md">
                    <div className="font-medium">
                      {subject === "MTC" && "Mathematics"}
                      {subject === "ENG" && "English"}
                      {subject === "SCIE" && "Science"}
                      {subject === "SST" && "Social Studies"}
                      <span className="text-muted-foreground ml-2">({subject})</span>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${subject}-marks`}>Marks (0-100)</Label>
                      <Input
                        id={`${subject}-marks`}
                        type="number"
                        min="0"
                        max="100"
                        value={marks[subject].marks}
                        onChange={(e) => handleMarksChange(subject, e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${subject}-teacher`}>Teacher Name (Optional)</Label>
                      <Input
                        id={`${subject}-teacher`}
                        value={marks[subject].teacherName}
                        onChange={(e) => handleTeacherChange(subject, e.target.value)}
                        placeholder="Enter teacher name"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Updating...
                </>
              ) : (
                "Update Pupil"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
