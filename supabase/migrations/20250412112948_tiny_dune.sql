/*
  # Create seats table and initial data

  1. New Tables
    - `seats`
      - `id` (serial, primary key)
      - `row_number` (integer)
      - `seat_number` (integer)
      - `is_booked` (boolean)
      - `booked_by` (uuid, references auth.users)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `seats` table
    - Add policies for:
      - Anyone can view seats
      - Only authenticated users can book seats
      - Users can only modify their own bookings
*/

-- Create seats table if it doesn't exist
CREATE TABLE IF NOT EXISTS seats (
  id SERIAL PRIMARY KEY,
  row_number INTEGER NOT NULL,
  seat_number INTEGER NOT NULL,
  is_booked BOOLEAN DEFAULT false,
  booked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(row_number, seat_number)
);

-- Enable RLS
DO $$ 
BEGIN 
  ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
EXCEPTION 
  WHEN others THEN NULL;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN 
  DROP POLICY IF EXISTS "Anyone can view seats" ON seats;
  DROP POLICY IF EXISTS "Authenticated users can book seats" ON seats;
  DROP POLICY IF EXISTS "Users can book seats" ON seats;
END $$;

-- Create policies
CREATE POLICY "Anyone can view seats"
  ON seats
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can book seats"
  ON seats
  FOR UPDATE
  TO authenticated
  USING (
    NOT is_booked OR -- Can book if seat is not booked
    booked_by = auth.uid() -- Or if they booked it themselves
  )
  WITH CHECK (
    NOT is_booked -- Can only book if seat is not already booked
  );

CREATE POLICY "Users can book seats"
  ON seats
  FOR UPDATE
  TO authenticated
  USING (uid() = booked_by)
  WITH CHECK (
    (NOT is_booked) OR (booked_by = uid())
  );

-- Insert initial seat data only if the table is empty
DO $$
DECLARE
  row_num INTEGER;
  seat_num INTEGER;
  total_rows INTEGER := 11; -- 10 rows of 7 seats + 1 row of 3 seats
  seat_count INTEGER;
BEGIN
  -- Check if seats already exist
  SELECT COUNT(*) INTO seat_count FROM seats;
  
  IF seat_count = 0 THEN
    FOR row_num IN 1..total_rows LOOP
      FOR seat_num IN 1..CASE WHEN row_num = total_rows THEN 3 ELSE 7 END LOOP
        INSERT INTO seats (row_number, seat_number, is_booked, booked_by)
        VALUES (row_num, seat_num, false, null);
      END LOOP;
    END LOOP;
  END IF;
END $$;