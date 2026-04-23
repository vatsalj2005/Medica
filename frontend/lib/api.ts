const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || JSON.stringify(data.errors) || "Request failed");
  return data;
}
