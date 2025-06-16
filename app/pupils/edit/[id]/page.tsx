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
  const { pupils, updatePupil, getGrade, getCurrentAcademicYear, getCurrentTerm } = usePupilData()
  const { toast } = useToast()

  const pupilId = params.id as string
  const pupil = pupils.find((p) => p.id === pupilId)

  const [name, setName] = useState("")
  const [className, setClassName] = useState<string>("")
  const [sex, setSex] = useState<string>("Male") // Keep for UI but don't store in database
  const [academicYear, setAcademicYear] = useState<string>(getCurrentAcademicYear())
  const [academicTerm, setAcademicTerm] = useState<string>(getCurrentTerm())
  const [photo, setPhoto] = useState<string>("")
  const [marks, setMarks] = useState<Record<Subject, { marks: number; teacherName: string }>>({
    MTC: { marks: 0, teacherName: "" },
    ENG: { marks: 0, teacherName: "" },
    SCIE: { marks: 0, teacherName: "" },
    SST: { marks: 0, teacherName: "" },
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhoto(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Load pupil data when component mounts
  useEffect(() => {
    if (pupil) {
      setName(pupil.name)
      setClassName(pupil.class)
      setSex(pupil.sex)
      setPhoto(pupil.photo || "")
      setAcademicYear(pupil.academicYear || getCurrentAcademicYear())
      setAcademicTerm(pupil.academicTerm || getCurrentTerm())

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
  }, [pupil, router, toast, getCurrentAcademicYear, getCurrentTerm])

  const handleNameChange = (value: string) => {
    setName(value.toUpperCase())
  }

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
        teacherName: value.toUpperCase(),
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
      return {
        subject: subject as Subject,
        marks: data.marks,
        teacherName: data.teacherName || undefined,
      }
    })

    // Update the pupil
    updatePupil(pupilId, {
      name,
      class: className as Pupil["class"],
      photo: photo && photo.trim() !== "" ? photo : undefined, // Only set photo if it exists and is not empty
      academicYear,
      academicTerm,
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
      <h1 className="text-3xl font-bold mb-6 uppercase">EDIT PUPIL</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="uppercase">EDIT PUPIL INFORMATION</CardTitle>
            <CardDescription className="uppercase">UPDATE THE PUPIL'S DETAILS AND SUBJECT MARKS.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="uppercase">
                  PUPIL NAME
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="ENTER FULL NAME"
                  required
                  className="uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class" className="uppercase">
                  CLASS
                </Label>
                <Select value={className} onValueChange={setClassName}>
                  <SelectTrigger id="class">
                    <SelectValue placeholder="SELECT CLASS" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P.4">P.4</SelectItem>
                    <SelectItem value="P.5">P.5</SelectItem>
                    <SelectItem value="P.6">P.6</SelectItem>
                    <SelectItem value="P.7">P.7</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sex" className="uppercase">
                  SEX (FOR REPORTS ONLY)
                </Label>
                <Select value={sex} onValueChange={setSex}>
                  <SelectTrigger id="sex">
                    <SelectValue placeholder="SELECT SEX" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">MALE</SelectItem>
                    <SelectItem value="Female">FEMALE</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground uppercase">NOTE: SEX IS USED FOR REPORT DISPLAY ONLY</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="academicYear" className="uppercase">
                  ACADEMIC YEAR
                </Label>
                <Input
                  id="academicYear"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value.toUpperCase())}
                  placeholder="2024/2025"
                  required
                  className="uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicTerm" className="uppercase">
                  ACADEMIC TERM
                </Label>
                <Select value={academicTerm} onValueChange={setAcademicTerm}>
                  <SelectTrigger id="academicTerm">
                    <SelectValue placeholder="SELECT TERM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Term 1">TERM 1</SelectItem>
                    <SelectItem value="Term 2">TERM 2</SelectItem>
                    <SelectItem value="Term 3">TERM 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo" className="uppercase">
                  PUPIL PHOTO (OPTIONAL)
                </Label>
                <Input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} />
                <p className="text-xs text-muted-foreground uppercase">
                  NOTE: PHOTO IS OPTIONAL AND WILL APPEAR ON REPORT CARDS IF PROVIDED
                </p>
                {photo && (
                  <div className="mt-2">
                    <img
                      src={photo || "/placeholder.svg"}
                      alt="Preview"
                      className="w-20 h-20 object-cover border rounded"
                    />
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setPhoto("")}>
                      REMOVE PHOTO
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4 uppercase">SUBJECT MARKS</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(["MTC", "ENG", "SCIE", "SST"] as Subject[]).map((subject) => (
                  <div key={subject} className="space-y-4 p-4 border rounded-md">
                    <div className="font-medium uppercase">
                      {subject === "MTC" && "MATHEMATICS"}
                      {subject === "ENG" && "ENGLISH"}
                      {subject === "SCIE" && "SCIENCE"}
                      {subject === "SST" && "SOCIAL STUDIES"}
                      <span className="text-muted-foreground ml-2">({subject})</span>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${subject}-marks`} className="uppercase">
                        MARKS (0-100)
                      </Label>
                      <Input
                        id={`${subject}-marks`}
                        type="number"
                        min="0"
                        max="100"
                        value={marks[subject].marks}
                        onChange={(e) => handleMarksChange(subject, e.target.value)}
                        className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${subject}-teacher`} className="uppercase">
                        TEACHER NAME (OPTIONAL)
                      </Label>
                      <Input
                        id={`${subject}-teacher`}
                        value={marks[subject].teacherName}
                        onChange={(e) => handleTeacherChange(subject, e.target.value)}
                        placeholder="ENTER TEACHER NAME"
                        className="uppercase"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()} className="uppercase">
              CANCEL
            </Button>
            <Button type="submit" className="uppercase">
              UPDATE PUPIL
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
