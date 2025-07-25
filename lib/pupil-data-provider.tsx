"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "./supabase"
import { useToast } from "@/components/ui/use-toast"
import { DatabaseInitializer } from "@/components/database-initializer"
import { ManualDatabaseSetup } from "@/components/manual-database-setup"

export type Subject = "MTC" | "ENG" | "SCIE" | "SST"

export interface SubjectMark {
  id?: string
  subject: Subject
  marks: number
  grade: string
  points: number
  teacherName?: string
}

export interface Pupil {
  id: string
  name: string
  class: "P.4" | "P.5" | "P.6" | "P.7"
  sex: "Male" | "Female"
  photo?: string
  academicYear: string
  academicTerm: string
  marks: SubjectMark[]
  totalMarks?: number
  totalAggregate?: number
  division?: string
  position?: number
}

export interface SchoolSettings {
  academicYear: string
  currentTerm: string
  nextTermBegins: string
}

interface PupilDataContextType {
  pupils: Pupil[]
  schoolSettings: SchoolSettings
  loading: boolean
  addPupil: (pupil: Omit<Pupil, "id" | "marks"> & { marks: Omit<SubjectMark, "grade" | "points">[] }) => Promise<void>
  updatePupil: (
    id: string,
    pupil: Partial<Omit<Pupil, "marks"> & { marks: Omit<SubjectMark, "grade" | "points">[] }>,
  ) => Promise<void>
  deletePupil: (id: string) => Promise<void>
  getPupilsByClass: (className: string) => Pupil[]
  calculateResults: (className: string) => Promise<Pupil[]>
  getGrade: (marks: number) => { grade: string; points: number }
  getDivision: (totalAggregate: number) => string
  refreshPupils: () => Promise<void>
  updateSchoolSettings: (settings: Partial<SchoolSettings>) => Promise<void>
  getCurrentAcademicYear: () => string
  getCurrentTerm: () => string
}

const PupilDataContext = createContext<PupilDataContextType | undefined>(undefined)

export function PupilDataProvider({ children }: { children: React.ReactNode }) {
  const [pupils, setPupils] = useState<Pupil[]>([])
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>({
    academicYear: "2024/2025",
    currentTerm: "Term 1",
    nextTermBegins: "2025-04-28",
  })
  const [loading, setLoading] = useState(true)
  const [databaseError, setDatabaseError] = useState<boolean>(false)
  const [databaseInitialized, setDatabaseInitialized] = useState<boolean>(true)
  const [needsManualSetup, setNeedsManualSetup] = useState<boolean>(false)
  const { toast } = useToast()

  // Load data from Supabase on initial render
  useEffect(() => {
    refreshPupils()
  }, [])

  const getCurrentAcademicYear = (): string => {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1 // JavaScript months are 0-indexed

    // Academic year typically starts in February/March
    if (currentMonth >= 2) {
      return `${currentYear}/${currentYear + 1}`
    } else {
      return `${currentYear - 1}/${currentYear}`
    }
  }

  const getCurrentTerm = (): string => {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1

    // Term 1: February - April
    // Term 2: May - August
    // Term 3: September - December
    if (currentMonth >= 2 && currentMonth <= 4) {
      return "Term 1"
    } else if (currentMonth >= 5 && currentMonth <= 8) {
      return "Term 2"
    } else {
      return "Term 3"
    }
  }

  const refreshPupils = async () => {
    try {
      setLoading(true)
      setDatabaseError(false)
      setNeedsManualSetup(false)

      // Check if tables exist by trying to query the pupils table
      const { data: pupilsData, error: pupilsError } = await supabase.from("pupils").select("*").limit(1)

      if (pupilsError) {
        // If the error is about the table not existing, we need to initialize the database
        if (pupilsError.message.includes("does not exist")) {
          console.log("Database tables don't exist yet. Showing initializer.")
          setDatabaseInitialized(false)
          setLoading(false)
          return
        }
        throw pupilsError
      }

      // If we got here, the tables exist, so fetch all data
      const { data: allPupilsData, error: allPupilsError } = await supabase.from("pupils").select("*").order("name")

      if (allPupilsError) {
        throw allPupilsError
      }

      // Fetch all marks
      const { data: marksData, error: marksError } = await supabase.from("marks").select("*")

      if (marksError) {
        throw marksError
      }

      // Combine the data
      const combinedData: Pupil[] = allPupilsData.map((pupil) => {
        const pupilMarks = marksData
          .filter((mark) => mark.pupil_id === pupil.id)
          .map((mark) => ({
            id: mark.id,
            subject: mark.subject as Subject,
            marks: mark.marks,
            grade: mark.grade,
            points: mark.points,
            teacherName: mark.teacher_name || undefined,
          }))

        // Calculate totals for each pupil
        const totalMarks = pupilMarks.reduce((sum, mark) => sum + mark.marks, 0)
        const totalAggregate = pupilMarks.reduce((sum, mark) => sum + mark.points, 0)
        const division = getDivision(totalAggregate)

        return {
          id: pupil.id,
          name: pupil.name,
          class: pupil.class as "P.4" | "P.5" | "P.6" | "P.7",
          sex: "Male", // Default value since it's not stored in database
          photo: pupil.photo && pupil.photo.trim() !== "" ? pupil.photo : undefined, // Only set if photo exists and is not empty
          academicYear: pupil.academic_year || getCurrentAcademicYear(),
          academicTerm: pupil.academic_term || getCurrentTerm(),
          marks: pupilMarks,
          totalMarks: pupilMarks.length > 0 ? totalMarks : undefined,
          totalAggregate: pupilMarks.length > 0 ? totalAggregate : undefined,
          division: pupilMarks.length > 0 ? division : undefined,
        }
      })

      // Calculate positions for each class
      const classes = ["P.4", "P.5", "P.6", "P.7"]
      const pupilsWithPositions = [...combinedData]

      classes.forEach((className) => {
        const classPupils = combinedData.filter(
          (pupil) => pupil.class === className && pupil.totalAggregate !== undefined,
        )

        if (classPupils.length > 0) {
          // Sort pupils by aggregate (lower is better) and then by total marks (higher is better)
          const sortedPupils = [...classPupils].sort((a, b) => {
            if (a.totalAggregate !== b.totalAggregate) {
              return a.totalAggregate! - b.totalAggregate!
            }
            return b.totalMarks! - a.totalMarks!
          })

          // Assign positions
          let currentPosition = 1
          let previousAggregate = -1
          let previousTotalMarks = -1

          sortedPupils.forEach((pupil, index) => {
            // If this is the first pupil or if the current pupil has different results than the previous one
            if (index === 0 || pupil.totalAggregate !== previousAggregate || pupil.totalMarks !== previousTotalMarks) {
              currentPosition = index + 1
            }

            previousAggregate = pupil.totalAggregate!
            previousTotalMarks = pupil.totalMarks!

            // Update the pupil in the main array
            const pupilIndex = pupilsWithPositions.findIndex((p) => p.id === pupil.id)
            if (pupilIndex !== -1) {
              pupilsWithPositions[pupilIndex].position = currentPosition
            }
          })
        }
      })

      setPupils(pupilsWithPositions)
    } catch (error) {
      console.error("Error fetching data:", error)
      setDatabaseError(true)
      toast({
        title: "Error",
        description: "Failed to load pupil data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDatabaseInitialized = () => {
    setDatabaseInitialized(true)
    refreshPupils()
  }

  const handleInitializationFailed = () => {
    setNeedsManualSetup(true)
  }

  const handleManualSetupComplete = () => {
    setNeedsManualSetup(false)
    setDatabaseInitialized(true)
    refreshPupils()
  }

  const getGrade = (marks: number): { grade: string; points: number } => {
    if (marks >= 95 && marks <= 100) return { grade: "D1", points: 1 }
    if (marks >= 80 && marks <= 94) return { grade: "D2", points: 2 }
    if (marks >= 70 && marks <= 79) return { grade: "C3", points: 3 }
    if (marks >= 65 && marks <= 69) return { grade: "C4", points: 4 }
    if (marks >= 60 && marks <= 64) return { grade: "C5", points: 5 }
    if (marks >= 55 && marks <= 59) return { grade: "C6", points: 6 }
    if (marks >= 50 && marks <= 54) return { grade: "P7", points: 7 }
    if (marks >= 40 && marks <= 49) return { grade: "P8", points: 8 }
    return { grade: "F9", points: 9 }
  }

  const getDivision = (totalAggregate: number): string => {
    if (totalAggregate >= 4 && totalAggregate <= 12) return "Division 1"
    if (totalAggregate >= 13 && totalAggregate <= 24) return "Division 2"
    if (totalAggregate >= 25 && totalAggregate <= 28) return "Division 3"
    if (totalAggregate >= 29 && totalAggregate <= 32) return "Division 4"
    return "Ungraded (U)"
  }

  const addPupil = async (
    pupilData: Omit<Pupil, "id" | "marks"> & { marks: Omit<SubjectMark, "grade" | "points">[] },
  ) => {
    try {
      setLoading(true)

      // Check if academic columns exist by trying to insert with them first, then fallback
      let newPupil
      try {
        // Try inserting with all columns including academic year and term
        const { data, error } = await supabase
          .from("pupils")
          .insert({
            name: pupilData.name,
            class: pupilData.class,
            photo: pupilData.photo && pupilData.photo.trim() !== "" ? pupilData.photo : null, // Handle empty photo
            academic_year: pupilData.academicYear,
            academic_term: pupilData.academicTerm,
          })
          .select()
          .single()

        if (error) throw error
        newPupil = data
      } catch (error: any) {
        // If academic columns don't exist, try without them
        if (error.message.includes("academic_year") || error.message.includes("academic_term")) {
          console.log("Academic columns don't exist, inserting without them")
          try {
            const { data, error: photoError } = await supabase
              .from("pupils")
              .insert({
                name: pupilData.name,
                class: pupilData.class,
                photo: pupilData.photo || null,
              })
              .select()
              .single()

            if (photoError) throw photoError
            newPupil = data
          } catch (photoError: any) {
            // If photo column doesn't exist either, insert with just name and class
            if (photoError.message.includes("photo")) {
              console.log("Photo column doesn't exist, inserting with basic fields only")
              const { data, error: basicError } = await supabase
                .from("pupils")
                .insert({
                  name: pupilData.name,
                  class: pupilData.class,
                })
                .select()
                .single()

              if (basicError) throw basicError
              newPupil = data
            } else {
              throw photoError
            }
          }
        } else {
          throw error
        }
      }

      // Insert the marks with grades and points
      const marksToInsert = pupilData.marks.map((mark) => {
        const { grade, points } = getGrade(mark.marks)
        return {
          pupil_id: newPupil.id,
          subject: mark.subject,
          marks: mark.marks,
          grade,
          points,
          teacher_name: mark.teacherName || null,
        }
      })

      if (marksToInsert.length > 0) {
        const { error: marksError } = await supabase.from("marks").insert(marksToInsert)

        if (marksError) throw marksError
      }

      // Refresh the pupils data
      await refreshPupils()

      toast({
        title: "Success",
        description: `${pupilData.name} has been added successfully`,
      })
    } catch (error) {
      console.error("Error adding pupil:", error)
      toast({
        title: "Error",
        description: "Failed to add pupil",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updatePupil = async (
    id: string,
    pupilData: Partial<Omit<Pupil, "marks"> & { marks: Omit<SubjectMark, "grade" | "points">[] }>,
  ) => {
    try {
      setLoading(true)

      // Update pupil basic info if provided
      if (
        pupilData.name ||
        pupilData.class ||
        pupilData.photo !== undefined ||
        pupilData.academicYear ||
        pupilData.academicTerm
      ) {
        // Check if academic columns exist by trying to update with them first, then fallback
        try {
          const updateData: {
            name?: string
            class?: string
            photo?: string | null
            academic_year?: string
            academic_term?: string
          } = {}

          if (pupilData.name) updateData.name = pupilData.name
          if (pupilData.class) updateData.class = pupilData.class
          if (pupilData.photo !== undefined) updateData.photo = pupilData.photo || null
          if (pupilData.academicYear) updateData.academic_year = pupilData.academicYear
          if (pupilData.academicTerm) updateData.academic_term = pupilData.academicTerm

          const { error: pupilError } = await supabase.from("pupils").update(updateData).eq("id", id)

          if (pupilError) throw pupilError
        } catch (error: any) {
          // If academic columns don't exist, update without them
          if (error.message.includes("academic_year") || error.message.includes("academic_term")) {
            console.log("Academic columns don't exist, updating without them")
            try {
              const updateData: { name?: string; class?: string; photo?: string | null } = {}
              if (pupilData.name) updateData.name = pupilData.name
              if (pupilData.class) updateData.class = pupilData.class
              if (pupilData.photo !== undefined) updateData.photo = pupilData.photo || null

              const { error: photoError } = await supabase.from("pupils").update(updateData).eq("id", id)

              if (photoError) throw photoError
            } catch (photoError: any) {
              // If photo column doesn't exist either, update with just name and class
              if (photoError.message.includes("photo")) {
                console.log("Photo column doesn't exist, updating basic fields only")
                const updateData: { name?: string; class?: string } = {}
                if (pupilData.name) updateData.name = pupilData.name
                if (pupilData.class) updateData.class = pupilData.class

                const { error: basicError } = await supabase.from("pupils").update(updateData).eq("id", id)

                if (basicError) throw basicError
              } else {
                throw photoError
              }
            }
          } else {
            throw error
          }
        }
      }

      // Update marks if provided
      if (pupilData.marks && pupilData.marks.length > 0) {
        // First, get existing marks
        const { data: existingMarks, error: fetchError } = await supabase.from("marks").select("*").eq("pupil_id", id)

        if (fetchError) throw fetchError

        // Process each mark
        for (const mark of pupilData.marks) {
          const { grade, points } = getGrade(mark.marks)
          const existingMark = existingMarks?.find((m) => m.subject === mark.subject)

          if (existingMark) {
            // Update existing mark
            const { error } = await supabase
              .from("marks")
              .update({
                marks: mark.marks,
                grade,
                points,
                teacher_name: mark.teacherName || null,
              })
              .eq("id", existingMark.id)

            if (error) throw error
          } else {
            // Insert new mark
            const { error } = await supabase.from("marks").insert({
              pupil_id: id,
              subject: mark.subject,
              marks: mark.marks,
              grade,
              points,
              teacher_name: mark.teacherName || null,
            })

            if (error) throw error
          }
        }
      }

      // Refresh the pupils data
      await refreshPupils()

      toast({
        title: "Success",
        description: "Pupil information updated successfully",
      })
    } catch (error) {
      console.error("Error updating pupil:", error)
      toast({
        title: "Error",
        description: "Failed to update pupil information",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deletePupil = async (id: string) => {
    try {
      setLoading(true)

      // Delete the pupil (marks will be deleted via CASCADE)
      const { error } = await supabase.from("pupils").delete().eq("id", id)

      if (error) throw error

      // Update local state
      setPupils((prev) => prev.filter((pupil) => pupil.id !== id))

      toast({
        title: "Success",
        description: "Pupil deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting pupil:", error)
      toast({
        title: "Error",
        description: "Failed to delete pupil",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateSchoolSettings = async (settings: Partial<SchoolSettings>) => {
    setSchoolSettings((prev) => ({ ...prev, ...settings }))
    // In a real app, you'd save this to the database
    localStorage.setItem("schoolSettings", JSON.stringify({ ...schoolSettings, ...settings }))
  }

  const getPupilsByClass = (className: string) => {
    return pupils.filter((pupil) => pupil.class === className)
  }

  const calculateResults = async (className: string) => {
    try {
      // Get all pupils in the specified class
      const classPupils = [...getPupilsByClass(className)]

      // Calculate total marks and aggregate for each pupil
      const pupilsWithTotals = classPupils.map((pupil) => {
        const totalMarks = pupil.marks.reduce((sum, mark) => sum + mark.marks, 0)
        const totalAggregate = pupil.marks.reduce((sum, mark) => sum + mark.points, 0)
        const division = getDivision(totalAggregate)

        return {
          ...pupil,
          totalMarks,
          totalAggregate,
          division,
        }
      })

      // Sort pupils by aggregate (lower is better) and then by total marks (higher is better)
      const sortedPupils = [...pupilsWithTotals].sort((a, b) => {
        if (a.totalAggregate !== b.totalAggregate) {
          return a.totalAggregate! - b.totalAggregate!
        }
        return b.totalMarks! - a.totalMarks!
      })

      // Assign positions
      let currentPosition = 1
      let samePositionCount = 1
      let previousAggregate = -1
      let previousTotalMarks = -1

      const pupilsWithPositions = sortedPupils.map((pupil, index) => {
        // If this is the first pupil or if the current pupil has different results than the previous one
        if (index === 0 || pupil.totalAggregate !== previousAggregate || pupil.totalMarks !== previousTotalMarks) {
          currentPosition = index + 1
          samePositionCount = 1
        } else {
          // If the current pupil has the same results as the previous one
          samePositionCount++
        }

        previousAggregate = pupil.totalAggregate!
        previousTotalMarks = pupil.totalMarks!

        return {
          ...pupil,
          position: currentPosition,
        }
      })

      // Update the pupils state with the calculated results
      setPupils((prev) =>
        prev.map((pupil) => {
          const calculatedPupil = pupilsWithPositions.find((p) => p.id === pupil.id)
          return calculatedPupil || pupil
        }),
      )

      return pupilsWithPositions
    } catch (error) {
      console.error("Error calculating results:", error)
      toast({
        title: "Error",
        description: "Failed to calculate results",
        variant: "destructive",
      })
      return []
    }
  }

  // If database is not initialized, show the initializer or manual setup
  if (!databaseInitialized) {
    if (needsManualSetup) {
      return <ManualDatabaseSetup onContinue={handleManualSetupComplete} />
    }
    return <DatabaseInitializer onInitialized={handleDatabaseInitialized} onFailed={handleInitializationFailed} />
  }

  return (
    <PupilDataContext.Provider
      value={{
        pupils,
        schoolSettings,
        loading,
        addPupil,
        updatePupil,
        deletePupil,
        getPupilsByClass,
        calculateResults,
        getGrade,
        getDivision,
        refreshPupils,
        updateSchoolSettings,
        getCurrentAcademicYear,
        getCurrentTerm,
      }}
    >
      {children}
    </PupilDataContext.Provider>
  )
}

export function usePupilData() {
  const context = useContext(PupilDataContext)
  if (context === undefined) {
    throw new Error("usePupilData must be used within a PupilDataProvider")
  }
  return context
}
