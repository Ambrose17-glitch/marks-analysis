"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { supabase } from "@/lib/supabase"

interface DatabaseInitializerProps {
  onInitialized: () => void
  onFailed: () => void
}

export function DatabaseInitializer({ onInitialized, onFailed }: DatabaseInitializerProps) {
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializeDatabase = async () => {
    try {
      setIsInitializing(true)
      setError(null)

      // Try to create the tables using RPC calls
      const { error: extensionError } = await supabase.rpc("create_uuid_extension")
      if (extensionError && !extensionError.message.includes("already exists")) {
        throw extensionError
      }

      const { error: tablesError } = await supabase.rpc("create_tables")
      if (tablesError) {
        throw tablesError
      }

      onInitialized()
    } catch (error: any) {
      console.error("Error initializing database:", error)
      setError(error.message || "Failed to initialize database")
      onFailed()
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Database Setup Required</CardTitle>
          <CardDescription>The database tables need to be created before you can use the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">{error}</div>}

          <Button onClick={initializeDatabase} disabled={isInitializing} className="w-full">
            {isInitializing ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Initializing Database...
              </>
            ) : (
              "Initialize Database"
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            This will create the necessary tables for storing pupil data and marks.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
