export function loadJSON(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function saveJSON(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('Error saving to localStorage:', e)
    return false
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key)
  } catch { /* ignore */ }
}
