const API_BASE_URL = import.meta.env.VITE_API_URL;

export function redirectToLogin(loginPath = '/auth.html') {
  window.location.replace(loginPath);
}

export async function getSession() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch {
    return null;
  }
}

export async function requireSession(loginPath = '/auth.html') {
  const session = await getSession();
  if (!session) {
    redirectToLogin(loginPath);
    return null;
  }
  return session;
}

export async function loginWithGoogleCredential(credential) {
  const res = await fetch(`${API_BASE_URL}/auth/google/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ credential }),
  });

  if (!res.ok) {
    return { ok: false, status: res.status };
  }

  const data = await res.json().catch(() => ({}));
  return { ok: true, user: data.user ?? null };
}

export async function logout(loginPath = '/auth.html') {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } finally {
    redirectToLogin(loginPath);
  }
}