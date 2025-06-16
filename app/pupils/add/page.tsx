"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePupilData, type Pupil, type Subject } from "@/lib/pupil-data-provider"
import { useToast } from "@/components/ui/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function AddPupilPage() {
  const router = useRouter()
  const { addPupil, getGrade, loading, getCurrentAcademicYear, getCurrentTerm } = usePupilData()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [name, setName] = useState("")
  const [className, setClassName] = useState<string>("")
  const [sex, setSex] = useState<string>("Male") // Keep for UI but don't store in database
  const [academicYear, setAcademicYear] = useState<string>(getCurrentAcademicYear())
  const [academicTerm, setAcademicTerm] = useState<string>(getCurrentTerm())
  const [marks, setMarks] = useState<Record<Subject, { marks: number; teacherName: string }>>({
    MTC: { marks: 0, teacherName: "" },
    ENG: { marks: 0, teacherName: "" },
    SCIE: { marks: 0, teacherName: "" },
    SST: { marks: 0, teacherName: "" },
  })
  const [photo, setPhoto] = useState<string>("")

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

  const handleNameChange = (value: string) => {
    // Convert to uppercase
    setName(value.toUpperCase())
  }

  const handleTeacherChange = (subject: Subject, value: string) => {
    setMarks((prev) => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        teacherName: value.toUpperCase(), // Convert to uppercase
      },
    }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "ERROR",
        description: "PLEASE ENTER THE PUPIL'S NAME",
        variant: "destructive",
      })
      return
    }

    if (!className) {
      toast({
        title: "ERROR",
        description: "PLEASE SELECT A CLASS",
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

      // Add the new pupil
      await addPupil({
        name,
        class: className as Pupil["class"],
        sex: sex as "Male" | "Female", // This will be ignored by the database operation
        photo: photo && photo.trim() !== "" ? photo : undefined, // Only set photo if it exists and is not empty
        academicYear,
        academicTerm,
        marks: formattedMarks,
      })

      router.push("/pupils")
    } catch (error) {
      console.error("Error adding pupil:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading && !isSubmitting) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6 uppercase">ADD NEW PUPIL</h1>
        <Card>
          <CardContent className="py-10">
            <LoadingSpinner />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6 uppercase">ADD NEW PUPIL</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="uppercase">PUPIL INFORMATION</CardTitle>
            <CardDescription className="uppercase">ENTER THE PUPIL'S DETAILS AND SUBJECT MARKS.</CardDescription>
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
                  disabled={isSubmitting}
                  className="uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class" className="uppercase">
                  CLASS
                </Label>
                <Select value={className} onValueChange={setClassName} disabled={isSubmitting}>
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
                <Select value={sex} onValueChange={setSex} disabled={isSubmitting}>
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
                  disabled={isSubmitting}
                  className="uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicTerm" className="uppercase">
                  ACADEMIC TERM
                </Label>
                <Select value={academicTerm} onValueChange={setAcademicTerm} disabled={isSubmitting}>
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
                <Input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} disabled={isSubmitting} />
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
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setPhoto("")}
                      disabled={isSubmitting}
                    >
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
                        className="uppercase"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="uppercase"
            >
              CANCEL
            </Button>
            <Button type="submit" disabled={isSubmitting} className="uppercase">
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  SAVING...
                </>
              ) : (
                "SAVE PUPIL"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
