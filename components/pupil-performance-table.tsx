"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"
import type { Pupil } from "@/lib/pupil-data-provider"

interface PupilPerformanceTableProps {
  pupils: Pupil[]
  showActions?: boolean
  className?: string
}

export function PupilPerformanceTable({ pupils, showActions = true, className }: PupilPerformanceTableProps) {
  // Sort pupils by position
  const sortedPupils = [...pupils].sort((a, b) => (a.position || 999) - (b.position || 999))

  const getDivisionColor = (division?: string) => {
    switch (division) {
      case "Division 1":
        return "bg-green-100 text-green-800 border-green-200"
      case "Division 2":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Division 3":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Division 4":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Ungraded (U)":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-primary/5">
          <TableHead className="font-semibold">Position</TableHead>
          <TableHead className="font-semibold">Name</TableHead>
          <TableHead className="font-semibold">Total Marks</TableHead>
          <TableHead className="font-semibold">Total Aggregate</TableHead>
          <TableHead className="font-semibold">Division</TableHead>
          {showActions && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedPupils.map((pupil) => (
          <TableRow key={pupil.id}>
            <TableCell className="font-medium">
              {pupil.position ? (
                <Badge variant="outline" className="font-bold">
                  {pupil.position}
                </Badge>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell className="font-medium">{pupil.name}</TableCell>
            <TableCell>
              {pupil.totalMarks !== undefined ? (
                <span className="font-medium">{pupil.totalMarks}</span>
              ) : (
                <span className="text-muted-foreground">Not calculated</span>
              )}
            </TableCell>
            <TableCell>
              {pupil.totalAggregate !== undefined ? (
                <span className="font-medium">{pupil.totalAggregate}</span>
              ) : (
                <span className="text-muted-foreground">Not calculated</span>
              )}
            </TableCell>
            <TableCell>
              {pupil.division ? (
                <Badge className={getDivisionColor(pupil.division)}>{pupil.division}</Badge>
              ) : (
                <span className="text-muted-foreground">Not calculated</span>
              )}
            </TableCell>
            {showActions && (
              <TableCell className="text-right">
                <Link href={`/reports/pupil/${pupil.id}`}>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-1" />
                    Report Card
                  </Button>
                </Link>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
