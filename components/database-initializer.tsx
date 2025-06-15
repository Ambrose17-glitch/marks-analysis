"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/loading-spinner"
import { CheckCircle2, Database } from "lucide-react"

export function DatabaseInitializer({ onInitialized, onFailed }: { onInitialized: () => void; onFailed: () => void }) {
  const [isInitializing, setIsInitializing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializeDatabase = async () => {
    setIsInitializing(true)
    setError(null)

    try {
      // Try to create the tables using the stored procedures we defined
      // First, try to create the uuid extension
      try {
        const { error: extensionError } = await supabase.rpc("create_uuid_extension")
        if (extensionError) {
          console.log("Note: uuid-ossp extension might not be created. This is okay if it already exists.")
        }
      } catch (err) {
        console.log("Note: create_uuid_extension RPC might not exist. This is okay if using direct SQL.")
      }

      // Try to create the pupils table
      try {
        const { error: pupilsError } = await supabase.rpc("create_pupils_table")
        if (pupilsError) {
          throw new Error(`Failed to create pupils table: ${pupilsError.message}`)
        }
      } catch (err) {
        console.error("Error creating pupils table:", err)
        throw new Error("Failed to create pupils table. Please check if the stored procedure exists.")
      }

      // Try to create the marks table
      try {
        const { error: marksError } = await supabase.rpc("create_marks_table")
        if (marksError) {
          throw new Error(`Failed to create marks table: ${marksError.message}`)
        }
      } catch (err) {
        console.error("Error creating marks table:", err)
        throw new Error("Failed to create marks table. Please check if the stored procedure exists.")
      }

      setIsInitialized(true)
      setTimeout(() => {
        onInitialized()
      }, 1500)
    } catch (err) {
      console.error("Error initializing database:", err)
      setError("Failed to initialize database. Please run the SQL scripts manually in the Supabase SQL editor.")
      onFailed()
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Setup
        </CardTitle>
        <CardDescription>Initialize the database for the Pupil Marks Analysis System</CardDescription>
      </CardHeader>
      <CardContent>
        {isInitialized ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-lg font-medium">Database initialized successfully!</p>
            <p className="text-sm text-muted-foreground mt-2">Loading application...</p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="mb-4">
              The database tables required for this application don't exist yet. Click the button below to create them.
            </p>
            {error && (
              <div className="text-destructive mb-4">
                <p>{error}</p>
                <p className="mt-2 text-sm">
                  Please run the initialization SQL script in the Supabase SQL editor and then refresh this page.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        {!isInitialized && (
          <Button onClick={initializeDatabase} disabled={isInitializing}>
            {isInitializing ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Initializing...
              </>
            ) : (
              "Initialize Database"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
