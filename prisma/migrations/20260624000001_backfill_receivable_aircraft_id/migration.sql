-- Backfill aircraft_id on receivables linked to flights
-- Previously, registerFlight/closeFlight never set aircraft_id on the receivable
UPDATE receivables r
SET aircraft_id = f.aircraft_id
FROM flights f
WHERE r.flight_id = f.id
  AND r.aircraft_id IS NULL;
