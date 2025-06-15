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
