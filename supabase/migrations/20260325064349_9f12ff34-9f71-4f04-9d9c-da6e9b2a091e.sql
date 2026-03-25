
SELECT cron.schedule(
  'run-crisis-agent',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://iywgdznjhpyjwwfjoebp.supabase.co/functions/v1/crisis-agent',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5d2dkem5qaHB5and3ZmpvZWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MTE5NDYsImV4cCI6MjA4OTk4Nzk0Nn0.TumpJBC-43Vhmme4UBZgQPUg3-a4FDZzYdf11H-OlBg"}'::jsonb,
    body := '{"trigger": "cron"}'::jsonb
  ) AS request_id;
  $$
);
