"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePupilData } from "@/lib/pupil-data-provider"
import { ArrowLeft } from "lucide-react"
import { PupilPerformanceTable } from "@/components/pupil-performance-table"

export default function IndividualReportsPage() {
  const router = useRouter()
  const params = useParams()
  const { pupils, calculateResults } = usePupilData()

  const className = params.className as string
  const classPupils = pupils.filter((pupil) => pupil.class === className)

  // Calculate results if not already done
  if (classPupils.some((pupil) => !pupil.position)) {
    calculateResults(className)
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Individual Reports: {className}</h1>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Individual Report Cards</CardTitle>
          <CardDescription>Access individual report cards for all pupils in {className}</CardDescription>
        </CardHeader>
        <CardContent>
          {classPupils.length > 0 ? (
            <PupilPerformanceTable pupils={classPupils} />
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No pupils found in {className}. Please add pupils to this class first.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
