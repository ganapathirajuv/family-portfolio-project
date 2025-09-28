// Lightweight family members API service
// Provides a simple fetch wrapper and mapping for the backend response shape

/**
 * @typedef {Object} ApiMember
 * @property {number|string} id
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} [full_name]
 * @property {string} [birth_date]
 * @property {string} [death_date]
 * @property {string} [birth_location]
 * @property {string} [gender]
 * @property {string} [biography]
 * @property {string} [occupation]
 * @property {number|string} [parent_id]
 * @property {string} [photo_url]
 * @property {boolean} [is_deceased]
 */

/**
 * Fetch family members from the backend and normalize into frontend shape.
 * Uses a simple in-memory cache keyed by query params for the session.
 * @param {{skip?: number, limit?: number, search?: string}} [opts]
 * @returns {Promise<Array<Object>>}
 */
export async function getFamilyMembers({ skip = 0, limit = 50, search = null } = {}) {
  const cacheKey = `fm:${skip}:${limit}:${search || ''}`;
  // Use a window-scoped cache when available (browser). Guard for SSR.
  const cacheHost = (typeof window !== 'undefined') ? window : {};
  if (!cacheHost.__familyServiceCache) cacheHost.__familyServiceCache = new Map();
  const cache = cacheHost.__familyServiceCache;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  const params = new URLSearchParams();
  params.set('skip', String(skip));
  params.set('limit', String(limit));
  if (search) params.set('search', String(search));

  // Use REACT_APP_API_URL when provided (set at build time) otherwise use relative path
  const envBase = typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL;
  const base = (envBase && String(envBase)) || '/api/v1';
  const normalizedBase = base.replace(/\/$/, '');
  // Request the trailing-slash endpoint to avoid 307 redirects
  const url = `${normalizedBase}/family-members/?${params.toString()}`;

  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch family members: ${res.status} ${res.statusText} ${text}`);
  }

  const data = await res.json();

  // Map backend fields to frontend-friendly shape, then attach fallback avatars
  const mapped = (data || []).map(/** @param {ApiMember} m */ (m) => ({
    id: m.id,
    firstName: m.first_name,
    lastName: m.last_name,
    fullName: m.full_name || `${m.first_name}${m.last_name ? ' ' + m.last_name : ''}`,
    birthDate: m.birth_date,
    deathDate: m.death_date,
    birthLocation: m.birth_location,
    gender: m.gender,
    biography: m.biography,
    occupation: m.occupation,
    // support common parent link names if backend provides relationships
    parentId: m.parent_id ?? m.parentId ?? null,
    // photo url if available
    photoUrl: m.photo_url ?? m.photoUrl ?? null,
    isDeceased: Boolean(m.is_deceased)
  }));

  // Attach deterministic fallback avatars from /images when photoUrl absent
  const avatars = ['/images/avatar1.svg', '/images/avatar2.svg', '/images/avatar3.svg'];
  const result = mapped.map((member, idx) => {
    if (!member.photoUrl) {
      const key = typeof member.id === 'number' ? member.id : idx;
      member.photoUrl = avatars[Math.abs(key) % avatars.length];
      member._fallbackPhoto = true;
    }
    return member;
  });

  cache.set(cacheKey, result);
  return result;
}
