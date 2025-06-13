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

export default function EditPupilPage() {
  const router = useRouter()
  const params = useParams()
  const { pupils, updatePupil, getGrade } = usePupilData()
  const { toast } = useToast()

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
    } else {
      // Pupil not found, redirect back to pupils list
      toast({
        title: "Error",
        description: "Pupil not found",
        variant: "destructive",
      })
      router.push("/pupils")
    }
  }, [pupil, router, toast])

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

  const handleSubmit = (e: React.FormEvent) => {
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

    // Convert marks to the required format
    const formattedMarks = Object.entries(marks).map(([subject, data]) => {
      const { grade, points } = getGrade(data.marks)
      return {
        subject: subject as Subject,
        marks: data.marks,
        grade,
        points,
        teacherName: data.teacherName || undefined,
      }
    })

    // Update the pupil
    updatePupil(pupilId, {
      name,
      class: className as Pupil["class"],
      marks: formattedMarks,
    })

    toast({
      title: "Success",
      description: `${name}'s information has been updated`,
    })

    router.push("/pupils")
  }

  if (!pupil) {
    return <div className="container py-8">Loading...</div>
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Select value={className} onValueChange={setClassName}>
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
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${subject}-teacher`}>Teacher Name (Optional)</Label>
                      <Input
                        id={`${subject}-teacher`}
                        value={marks[subject].teacherName}
                        onChange={(e) => handleTeacherChange(subject, e.target.value)}
                        placeholder="Enter teacher name"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit">Update Pupil</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
