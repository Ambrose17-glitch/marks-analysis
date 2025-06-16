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

      // Create the tables directly using SQL
      const createTablesSQL = `
        -- Enable UUID extension
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        -- Create pupils table (name, class, and photo are stored)
        CREATE TABLE IF NOT EXISTS pupils (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          class TEXT NOT NULL,
          photo TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create index on class
        CREATE INDEX IF NOT EXISTS idx_pupils_class ON pupils(class);

        -- Create marks table
        CREATE TABLE IF NOT EXISTS marks (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          pupil_id UUID NOT NULL,
          subject TEXT NOT NULL,
          marks INTEGER NOT NULL,
          grade TEXT NOT NULL,
          points INTEGER NOT NULL,
          teacher_name TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          CONSTRAINT fk_pupil
            FOREIGN KEY(pupil_id) 
            REFERENCES pupils(id)
            ON DELETE CASCADE
        );

        -- Create index on pupil_id
        CREATE INDEX IF NOT EXISTS idx_marks_pupil_id ON marks(pupil_id);
      `

      const { error: sqlError } = await supabase.rpc("exec_sql", { sql: createTablesSQL })

      if (sqlError) {
        // If RPC doesn't work, try creating tables step by step
        console.log("RPC failed, trying step by step creation")

        // Enable UUID extension
        const { error: extensionError } = await supabase.rpc("create_uuid_extension")
        if (extensionError && !extensionError.message.includes("already exists")) {
          console.log("Extension creation failed, continuing anyway")
        }

        // Create pupils table
        const { error: pupilsError } = await supabase.rpc("create_pupils_table")
        if (pupilsError) {
          console.log("Pupils table creation failed, trying direct SQL")
          // Try direct table creation
          const { error: directError } = await supabase.from("pupils").select("id").limit(1)

          if (directError && directError.message.includes("does not exist")) {
            throw new Error("Could not create database tables. Please use manual setup.")
          }
        }

        // Create marks table
        const { error: marksError } = await supabase.rpc("create_marks_table")
        if (marksError) {
          console.log("Marks table creation failed, trying direct SQL")
        }
      }

      // Test if tables were created successfully
      const { error: testError } = await supabase.from("pupils").select("id").limit(1)
      if (testError && testError.message.includes("does not exist")) {
        throw new Error("Tables were not created successfully")
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
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {error}
              <div className="mt-2 text-xs">If automatic setup fails, please use the manual setup option.</div>
            </div>
          )}

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
