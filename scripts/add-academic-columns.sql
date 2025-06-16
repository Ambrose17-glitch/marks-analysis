-- Add academic year and term columns to existing pupils table
ALTER TABLE pupils ADD COLUMN IF NOT EXISTS academic_year TEXT;
ALTER TABLE pupils ADD COLUMN IF NOT EXISTS academic_term TEXT;

-- Update existing records with default values if they don't have academic year/term
UPDATE pupils 
SET academic_year = '2024/2025' 
WHERE academic_year IS NULL;

UPDATE pupils 
SET academic_term = 'Term 1' 
WHERE academic_term IS NULL;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pupils' 
ORDER BY ordinal_position;
