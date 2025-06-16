-- Add photo column to existing pupils table
ALTER TABLE pupils ADD COLUMN IF NOT EXISTS photo TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pupils' 
ORDER BY ordinal_position;
