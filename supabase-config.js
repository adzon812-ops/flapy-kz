// Настройки Supabase (потом заменим на свои)
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_KEY = 'your-anon-key';

// Функция для подключения
function initSupabase() {
    return supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}
