"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePupilData } from "@/lib/pupil-data-provider"
import { PlusCircle, Pencil, Trash2, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function PupilsPage() {
  const { pupils, deletePupil, loading, refreshPupils } = usePupilData()
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const { toast } = useToast()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filteredPupils = selectedClass === "all" ? pupils : pupils.filter((pupil) => pupil.class === selectedClass)

  const handleDeletePupil = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      await deletePupil(id)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshPupils()
    setIsRefreshing(false)
    toast({
      title: "Data refreshed",
      description: "The pupil data has been refreshed from the database.",
    })
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pupils Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/pupils/add">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Pupil
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pupil Records</CardTitle>
          <CardDescription>Manage pupil information for all classes.</CardDescription>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Filter by class:</span>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
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
          ) : filteredPupils.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPupils.map((pupil) => (
                  <TableRow key={pupil.id}>
                    <TableCell className="font-medium">{pupil.name}</TableCell>
                    <TableCell>{pupil.class}</TableCell>
                    <TableCell>{pupil.marks.length} / 4</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/pupils/edit/${pupil.id}`}>
                          <Button variant="outline" size="sm">
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </Link>
                        <Button variant="destructive" size="sm" onClick={() => handleDeletePupil(pupil.id, pupil.name)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No pupils found. {selectedClass !== "all" ? "Try selecting a different class or " : ""}
              <Link href="/pupils/add" className="text-primary hover:underline">
                add a new pupil
              </Link>
              .
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
