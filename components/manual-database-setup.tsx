"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Database, Copy, CheckCircle } from "lucide-react"

export function ManualDatabaseSetup({ onContinue }: { onContinue: () => void }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const createTablesSQL = `
-- Enable UUID extension
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
CREATE INDEX IF NOT EXISTS idx_marks_pupil_id ON marks(pupil_id);
`

  const createStoredProceduresSQL = `
-- Create a function to create the uuid extension
CREATE OR REPLACE FUNCTION create_uuid_extension()
RETURNS void AS $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to create the pupils table
CREATE OR REPLACE FUNCTION create_pupils_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS pupils (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    class TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Create index
  CREATE INDEX IF NOT EXISTS idx_pupils_class ON pupils(class);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to create the marks table
CREATE OR REPLACE FUNCTION create_marks_table()
RETURNS void AS $$
BEGIN
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
  
  -- Create index
  CREATE INDEX IF NOT EXISTS idx_marks_pupil_id ON marks(pupil_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Manual Database Setup
        </CardTitle>
        <CardDescription>
          Follow these steps to manually set up the database for the Pupil Marks Analysis System
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Automatic initialization failed</h3>
              <p className="text-sm text-amber-700 mt-1">
                Please follow these steps to manually set up the database using the Supabase SQL Editor.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-lg">Steps to initialize the database:</h3>
            <ol className="list-decimal list-inside space-y-4">
              <li>
                <span className="font-medium">Open the Supabase SQL Editor:</span>
                <p className="text-sm text-muted-foreground ml-6 mt-1">
                  Go to your Supabase project dashboard and click on "SQL Editor" in the left sidebar.
                </p>
              </li>
              <li>
                <span className="font-medium">Copy and run the SQL script below:</span>
                <div className="mt-2">
                  <Tabs defaultValue="tables">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="tables">Create Tables</TabsTrigger>
                      <TabsTrigger value="procedures">Create Stored Procedures</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tables" className="mt-2">
                      <div className="relative">
                        <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-auto max-h-80 text-xs">
                          {createTablesSQL}
                        </pre>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(createTablesSQL)}
                        >
                          {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="procedures" className="mt-2">
                      <div className="relative">
                        <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-auto max-h-80 text-xs">
                          {createStoredProceduresSQL}
                        </pre>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(createStoredProceduresSQL)}
                        >
                          {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </li>
              <li>
                <span className="font-medium">Verify the tables were created:</span>
                <p className="text-sm text-muted-foreground ml-6 mt-1">
                  Run the following SQL to check if the tables exist:
                </p>
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-auto mt-2 text-xs">
                  SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
                </pre>
              </li>
              <li>
                <span className="font-medium">Return to the application:</span>
                <p className="text-sm text-muted-foreground ml-6 mt-1">
                  After running the SQL script, come back to the application and click the button below to continue.
                </p>
              </li>
            </ol>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={onContinue}>Continue to Application</Button>
      </CardFooter>
    </Card>
  )
}
