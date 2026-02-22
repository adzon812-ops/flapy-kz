// Подключение к Supabase
const SUPABASE_URL = 'https://qagcjbfqjheflilennpd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZ2NqYmZxamhlZmxpbGVubnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODI5MzksImV4cCI6MjA4NzI1ODkzOX0.jzLXUE6Zi0EbcmorXxSqlLBVIRylJyYIeTQd5Kan53I';

// Инициализация клиента
let supabaseClient;

function initSupabase() {
    if (!supabaseClient) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return supabaseClient;
}

// ==================== РИЕЛТОРЫ ====================

// Вход риелтора
async function loginRealtor(phone, password) {
    const supabase = initSupabase();
    
    const { data, error } = await supabase
        .from('realtors')
        .select('*')
        .eq('phone', phone)
        .eq('password', password)
        .single();
    
    if (error || !data) {
        return { success: false, error: 'Неверный телефон или пароль' };
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('flapy_user', JSON.stringify(data));
    
    return { success: true, user: data };
}

// Регистрация риелтора
async function registerRealtor(userData) {
    const supabase = initSupabase();
    
    const { data, error } = await supabase
        .from('realtors')
        .insert([userData])
        .select()
        .single();
    
    if (error) {
        return { success: false, error: error.message };
    }
    
    localStorage.setItem('flapy_user', JSON.stringify(data));
    
    return { success: true, user: data };
}

// Получить текущего пользователя
function getCurrentUser() {
    const user = localStorage.getItem('flapy_user');
    return user ? JSON.parse(user) : null;
}

// Выйти
function logout() {
    localStorage.removeItem('flapy_user');
    location.reload();
}

// ==================== ОБЪЕКТЫ ====================

// Получить все объекты (для всех, без регистрации)
async function getAllProperties() {
    const supabase = initSupabase();
    
    const { data, error } = await supabase
        .from('properties')
        .select(`
            *,
            realtor:realtor_id (full_name, phone, agency_name, is_verified)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Ошибка загрузки объектов:', error);
        return [];
    }
    
    return data || [];
}

// Добавить объект (только для риелторов)
async function addProperty(propertyData) {
    const supabase = initSupabase();
    const user = getCurrentUser();
    
    if (!user) {
        return { success: false, error: 'Требуется авторизация' };
    }
    
    const { data, error } = await supabase
        .from('properties')
        .insert([{
            ...propertyData,
            realtor_id: user.id
        }])
        .select()
        .single();
    
    if (error) {
        return { success: false, error: error.message };
    }
    
    return { success: true, property: data };
}

// ==================== ИЗБРАННОЕ ====================

async function addToFavorites(propertyId) {
    const supabase = initSupabase();
    const user = getCurrentUser();
    
    // Если не зарегистрирован — сохраняем по сессии/телефону
    const userPhone = user ? user.phone : localStorage.getItem('guest_phone') || 'guest_' + Date.now();
    
    const { data, error } = await supabase
        .from('favorites')
        .insert([{
            user_phone: userPhone,
            property_id: propertyId
        }]);
    
    if (error) {
        return { success: false, error: error.message };
    }
    
    return { success: true };
}

// ==================== СООБЩЕНИЯ ====================

async function sendMessage(receiverId, propertyId, content) {
    const supabase = initSupabase();
    const user = getCurrentUser();
    
    if (!user) {
        return { success: false, error: 'Требуется авторизация' };
    }
    
    const { data, error } = await supabase
        .from('messages')
        .insert([{
            sender_id: user.id,
            receiver_id: receiverId,
            property_id: propertyId,
            content: content
        }]);
    
    if (error) {
        return { success: false, error: error.message };
    }
    
    return { success: true };
}

// ==================== АДМИН ====================

// Проверка админа
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// Получить статистику (только для админа)
async function getAdminStats() {
    const supabase = initSupabase();
    
    if (!isAdmin()) {
        return null;
    }
    
    const { count: realtorsCount } = await supabase
        .from('realtors')
        .select('*', { count: 'exact', head: true });
    
    const { count: propertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });
    
    const { count: pendingVerif } = await supabase
        .from('realtors')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', false);
    
    return {
        realtors: realtorsCount,
        properties: propertiesCount,
        pendingVerifications: pendingVerif
    };
}
