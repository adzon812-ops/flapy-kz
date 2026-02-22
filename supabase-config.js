// Настройки Supabase (потом заменим на свои)
const SUPABASE_URL = 'https://qagcjbfqjheflilennpd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZ2NqYmZxamhlZmxpbGVubnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODI5MzksImV4cCI6MjA4NzI1ODkzOX0.jzLXUE6Zi0EbcmorXxSqlLBVIRylJyYIeTQd5Kan53I';

// Функция для подключения
function initSupabase() {
    return supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}
