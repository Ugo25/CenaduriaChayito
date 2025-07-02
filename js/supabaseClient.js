// supabaseClient.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

export const supabase = createClient(
    'https://exeuxjtrjoultopoynmj.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZXV4anRyam91bHRvcG95bm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMjYyMjIsImV4cCI6MjA2MzYwMjIyMn0.g0UuO6jyBJsdnCjS4JmJGvWP2a-D_wAQUQW-8JzLWkY'
);
