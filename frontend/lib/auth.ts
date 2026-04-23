export interface AuthSession {
  role: "patient" | "doctor" | "receptionist";
  id: string;
  name: string;
  email: string;
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const s = localStorage.getItem("medica_session");
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

export function setSession(session: AuthSession) {
  localStorage.setItem("medica_session", JSON.stringify(session));
  document.cookie = `medica_role=${session.role}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearSession() {
  localStorage.removeItem("medica_session");
  document.cookie = "medica_role=; path=/; max-age=0";
}
