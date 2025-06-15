"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

export type Subject = "MTC" | "ENG" | "SCIE" | "SST"

export interface SubjectMark {
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
  marks: SubjectMark[]
  totalMarks?: number
  totalAggregate?: number
  division?: string
  position?: number
}

interface PupilDataContextType {
  pupils: Pupil[]
  addPupil: (pupil: Omit<Pupil, "id">) => void
  updatePupil: (id: string, pupil: Partial<Pupil>) => void
  deletePupil: (id: string) => void
  getPupilsByClass: (className: string) => Pupil[]
  calculateResults: (className: string) => Pupil[]
  getGrade: (marks: number) => { grade: string; points: number }
  getDivision: (totalAggregate: number) => string
}

const PupilDataContext = createContext<PupilDataContextType | undefined>(undefined)

export function PupilDataProvider({ children }: { children: React.ReactNode }) {
  const [pupils, setPupils] = useState<Pupil[]>([])

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedPupils = localStorage.getItem("pupils")
    if (savedPupils) {
      setPupils(JSON.parse(savedPupils))
    }
  }, [])

  // Save data to localStorage whenever pupils change
  useEffect(() => {
    localStorage.setItem("pupils", JSON.stringify(pupils))
  }, [pupils])

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

  const addPupil = (pupil: Omit<Pupil, "id">) => {
    const newPupil: Pupil = {
      ...pupil,
      id: crypto.randomUUID(),
    }
    setPupils((prev) => [...prev, newPupil])
  }

  const updatePupil = (id: string, pupilData: Partial<Pupil>) => {
    setPupils((prev) => prev.map((pupil) => (pupil.id === id ? { ...pupil, ...pupilData } : pupil)))
  }

  const deletePupil = (id: string) => {
    setPupils((prev) => prev.filter((pupil) => pupil.id !== id))
  }

  const getPupilsByClass = (className: string) => {
    return pupils.filter((pupil) => pupil.class === className)
  }

  const calculateResults = (className: string) => {
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
  }

  return (
    <PupilDataContext.Provider
      value={{
        pupils,
        addPupil,
        updatePupil,
        deletePupil,
        getPupilsByClass,
        calculateResults,
        getGrade,
        getDivision,
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
