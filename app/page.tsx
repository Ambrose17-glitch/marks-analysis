import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { School, Users, BookOpen, BarChart3 } from "lucide-react"

export const metadata: Metadata = {
  title: "Pupil Marks Analysis System - Bright Generation Learning Centre",
  description: "Analyze pupil marks, compute aggregates, assign divisions, and generate performance reports",
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Pupil Marks Analysis System</h1>
          <p className="text-xl">Bright Generation Learning Centre, Kalisizo</p>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Welcome to the Pupil Marks Analysis System</h2>
          <p className="text-muted-foreground mb-6">
            This system helps you analyze pupils' marks, compute total aggregates, assign divisions, rank pupils by
            position, and generate detailed performance reports for both individual pupils and entire classes.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>Pupils</span>
                </CardTitle>
                <CardDescription>Manage pupil records</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Add, edit, and view pupil information for classes P.4 to P.7.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/pupils" className="w-full">
                  <Button className="w-full">Manage Pupils</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Marks Entry</span>
                </CardTitle>
                <CardDescription>Enter and update marks</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Record marks for Mathematics, English, Science, and Social Studies.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/marks" className="w-full">
                  <Button className="w-full">Enter Marks</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Reports</span>
                </CardTitle>
                <CardDescription>Generate performance reports</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View individual report cards and class performance summaries.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/reports" className="w-full">
                  <Button className="w-full">View Reports</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5" />
                  <span>Classes</span>
                </CardTitle>
                <CardDescription>Class management</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Manage classes P.4, P.5, P.6, and P.7.</p>
              </CardContent>
              <CardFooter>
                <Link href="/classes" className="w-full">
                  <Button className="w-full">Manage Classes</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container flex flex-col gap-2 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Bright Generation Learning Centre, Kalisizo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
