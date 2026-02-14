import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://sirniwpjxsowhmyaagto.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcm5pd3BqeHNvd2hteWFhZ3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMzkwNzEsImV4cCI6MjA4NjYxNTA3MX0.8dPkyasX17mJED_NOOsQPVZSIbEPBHplYG13YZuo8TU"

export const supabase = createClient(supabaseUrl, supabaseKey)
