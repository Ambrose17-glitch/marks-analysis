"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ManualDatabaseSetupProps {
  onContinue: () => void
}

export function ManualDatabaseSetup({ onContinue }: ManualDatabaseSetupProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const createTablesSQL = `-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create pupils table
CREATE TABLE IF NOT EXISTS pupils (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  class TEXT NOT NULL,
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
CREATE INDEX IF NOT EXISTS idx_marks_pupil_id ON marks(pupil_id);`

  const createProceduresSQL = `-- Create stored procedure for UUID extension
CREATE OR REPLACE FUNCTION create_uuid_extension()
RETURNS void AS $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
END;
$$ LANGUAGE plpgsql;

-- Create stored procedure for creating tables
CREATE OR REPLACE FUNCTION create_tables()
RETURNS void AS $$
BEGIN
  -- Create pupils table
  CREATE TABLE IF NOT EXISTS pupils (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    class TEXT NOT NULL,
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
END;
$$ LANGUAGE plpgsql;`

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Manual Database Setup</CardTitle>
          <CardDescription>
            Please run the following SQL scripts in your Supabase SQL Editor to set up the database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tables" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tables">Create Tables</TabsTrigger>
              <TabsTrigger value="procedures">Create Stored Procedures</TabsTrigger>
            </TabsList>

            <TabsContent value="tables" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Step 1: Create Tables</h3>
                <p className="text-sm text-gray-600">
                  Copy and paste this SQL into your Supabase SQL Editor and run it:
                </p>
              </div>
              <div className="relative">
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                  <code>{createTablesSQL}</code>
                </pre>
                <Button
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(createTablesSQL, "tables")}
                >
                  {copied === "tables" ? "Copied!" : "Copy"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="procedures" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Step 2: Create Stored Procedures (Optional)</h3>
                <p className="text-sm text-gray-600">
                  Copy and paste this SQL into your Supabase SQL Editor and run it:
                </p>
              </div>
              <div className="relative">
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                  <code>{createProceduresSQL}</code>
                </pre>
                <Button
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(createProceduresSQL, "procedures")}
                >
                  {copied === "procedures" ? "Copied!" : "Copy"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800">Instructions:</h4>
              <ol className="list-decimal list-inside text-sm text-blue-700 mt-2 space-y-1">
                <li>Go to your Supabase project dashboard</li>
                <li>Navigate to the SQL Editor</li>
                <li>Copy and paste the "Create Tables" SQL above</li>
                <li>Click "Run" to execute the SQL</li>
                <li>Optionally, run the "Create Stored Procedures" SQL as well</li>
                <li>Click "Continue to Application" below</li>
              </ol>
            </div>

            <Button onClick={onContinue} className="w-full">
              Continue to Application
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
