-- Create pupils table
CREATE TABLE IF NOT EXISTS pupils (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create marks table
CREATE TABLE IF NOT EXISTS marks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pupil_id UUID NOT NULL REFERENCES pupils(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  marks INTEGER NOT NULL,
  grade TEXT NOT NULL,
  points INTEGER NOT NULL,
  teacher_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_marks_pupil_id ON marks(pupil_id);
CREATE INDEX IF NOT EXISTS idx_pupils_class ON pupils(class);
