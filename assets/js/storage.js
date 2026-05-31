/**
 * AS Pharmacy - Backend Storage Module (PHP + MySQL)
 * Drop-in replacement for the localStorage version.
 * All functions are async and return the same shape as before.
 */

const DB = {
    USERS:      'users',
    MEDS:       'medicines',
    SALES:      'sales',
    ATTENDANCE: 'attendance',
    SETTINGS:   'settings',
    SESSION:    'session'
};

// ── Base URL (change if you rename the folder) ────────────────────────────────
const API_BASE = 'api';

// ── Internal cache so sync-looking pages still work ──────────────────────────
const _cache = {
    users:      null,
    medicines:  null,
    sales:      null,
    attendance: null,
    settings:   null,
    session:    null,          // loaded once on page load
};

// ─────────────────────────────────────────────────────────────────────────────
// LOW-LEVEL FETCH HELPER
// ─────────────────────────────────────────────────────────────────────────────
async function _api(endpoint, method = 'GET', body = null, params = {}) {
    const url = new URL(`${API_BASE}/${endpoint}`, window.location.href);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    const opts = {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
    };
    if (body) opts.body = JSON.stringify(body);

    const res  = await fetch(url.toString(), opts);
    const data = await res.json();
    return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE OBJECT  (mirrors the old API surface used by every page)
// ─────────────────────────────────────────────────────────────────────────────
const Storage = {

    // ── Bootstrapped synchronously via the init promise ───────────────────────
    _initPromise: null,

    init() {
        if (this._initPromise) return this._initPromise;
        this._initPromise = (async () => {
            // Load session first
            const s = await _api('auth.php', 'GET', null, { action: 'session' });
            _cache.session = s.user;

            // Auto-mark attendance for logged-in user
            if (_cache.session) {
                this.autoMarkAttendance();
            }
        })();
        return this._initPromise;
    },

    // ── GET (returns array; uses lazy-loaded per-type cache) ──────────────────
    get(key) {
        // Return cached value synchronously when available
        return _cache[key] ?? [];
    },

    // Async version used internally
    async fetch(key) {
        const map = {
            users:      'users.php',
            medicines:  'medicines.php',
            sales:      'sales.php',
            attendance: 'attendance.php',
            settings:   'settings.php',
        };
        const file = map[key];
        if (!file) return [];

        const data = await _api(file);
        _cache[key] = Array.isArray(data) ? data : (data ? [data] : []);
        return _cache[key];
    },

    // ── SET (raw replace – used mostly for settings / bulk writes) ─────────────
    async set(key, value) {
        if (key === DB.SETTINGS) {
            const payload = Array.isArray(value) ? Object.fromEntries(value.map(i => [i.key_name, i.value])) : value;
            await _api('settings.php', 'POST', payload);
            _cache.settings = null;
        }
        _cache[key] = value;
    },

    // ── ADD ───────────────────────────────────────────────────────────────────
    async add(key, item) {
        const map = { users: 'users.php', medicines: 'medicines.php', sales: 'sales.php', attendance: 'attendance.php' };
        const file = map[key];
        if (!file) return item;

        const result = await _api(file, 'POST', item);
        _cache[key] = null; // invalidate cache
        return result;
    },

    // ── UPDATE ────────────────────────────────────────────────────────────────
    async update(key, id, updates) {
        const map = { users: 'users.php', medicines: 'medicines.php' };
        const file = map[key];
        if (!file) return false;

        await _api(file, 'PUT', updates, { id });
        _cache[key] = null;
        return true;
    },

    // ── DELETE ────────────────────────────────────────────────────────────────
    async delete(key, id) {
        const map = { users: 'users.php', medicines: 'medicines.php', sales: 'sales.php', attendance: 'attendance.php' };
        const file = map[key];
        if (!file) return false;

        await _api(file, 'DELETE', null, { id });
        _cache[key] = null;
        return true;
    },

    // ── AUTH ──────────────────────────────────────────────────────────────────
    getCurrentUser() {
        return _cache.session;
    },

    async login(email, password) {
        const result = await _api('auth.php', 'POST', { email, password }, { action: 'login' });
        if (result.success) {
            _cache.session = result.user;
        }
        return result;
    },

    async logout() {
        await _api('auth.php', 'GET', null, { action: 'logout' });
        _cache.session = null;
        window.location.href = 'index.html';
    },

    // ── ATTENDANCE AUTO-MARK ──────────────────────────────────────────────────
    async autoMarkAttendance() {
        const user = this.getCurrentUser();
        if (!user) return;

        const today = new Date().toISOString().split('T')[0];
        await _api('attendance.php', 'POST', {
            userId:   user.id,
            userName: user.name,
            date:     today,
            time:     new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        });
    },

    // ── RESET PASSWORD HELPERS ─────────────────────────────────────────────────
    async verifyResetIdentity(email, dob) {
        return await _api('auth.php', 'POST', { email, dob }, { action: 'verify_identity' });
    },

    async resetPassword(email, newPassword) {
        return await _api('auth.php', 'POST', { email, password: newPassword }, { action: 'reset_password' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE BOOTSTRAP
// Every page calls Storage.init() then loads its own data.
// We kick off init immediately so the session is ready before DOMContentLoaded.
// ─────────────────────────────────────────────────────────────────────────────
Storage.init();
