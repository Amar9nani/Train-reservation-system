/*
  # Reset all seats to unbooked state

  1. Changes
    - Reset all seats to unbooked state
    - Clear any existing bookings
*/

-- Reset all seats to unbooked state
UPDATE seats
SET is_booked = false,
    booked_by = null
WHERE is_booked = true;

-- Ensure all new seats are created as unbooked
ALTER TABLE seats
ALTER COLUMN is_booked SET DEFAULT false,
ALTER COLUMN booked_by SET DEFAULT null;