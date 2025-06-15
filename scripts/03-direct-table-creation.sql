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
