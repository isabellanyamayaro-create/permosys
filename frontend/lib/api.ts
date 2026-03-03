const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

// ── Token helpers ────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("refresh_token")
}
export function saveTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access)
  localStorage.setItem("refresh_token", refresh)
}
export function clearTokens() {
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
}

// ── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "me" | "ceo" | "admin" | "entity"

export interface AuthUser {
  id: number
  email: string
  name: string
  role: UserRole
  entity: number | null
  entity_name: string | null
  badge: string
  initials: string
  label: string
  is_active: boolean
}

export interface Submission {
  id: number
  entity: number
  entity_name: string
  quarter: string
  period: string
  submitted_by: string
  submitted_date: string
  kpi_count: number
  overall_score: number
  status: "Draft" | "Pending" | "Under Review" | "Approved" | "Rejected"
  reviewed_by: string
  review_date: string | null
  ceo_comment: string
  overall_comment: string
  sections: SectionScore[]
  kpis: KpiActual[]
}

export interface SectionScore {
  id: number
  name: string
  score: number
  weight: number
  weighted: number
}

export interface KpiActual {
  id: number
  kpi_id: number
  name: string
  area: string
  unit: string
  target: number
  actual: number
  variance: number
  raw_score: number
  weight: number
  weighted: number
  comment: string
}

export interface DashboardSummary {
  total_submissions: number
  approved: number
  pending: number
  rejected: number
  avg_score: number
  recent_submissions: Array<{
    id: number
    entity: string
    quarter: string
    period: string
    status: string
    overall_score: number
    submitted_date: string
  }>
  entity_ranking: Array<{
    entity__id: number
    entity__name: string
    entity__short_name: string
    avg_score: number
    total: number
  }>
  trend?: Array<{ quarter: string; period: string; avg: number }>
}

// ── Core fetch wrapper ───────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = getAccessToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  // Token expired → try refresh once
  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh()
    if (refreshed) return request<T>(path, options, false)
    clearTokens()
    window.location.href = "/login"
    throw new Error("Session expired")
  }

  if (!res.ok) {
    const body = await res.text()
    throw new Error(body || `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

async function tryRefresh(): Promise<boolean> {
  const refresh = getRefreshToken()
  if (!refresh) return false
  try {
    const res = await fetch(`${BASE}/api/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    })
    if (!res.ok) return false
    const data = await res.json()
    localStorage.setItem("access_token", data.access)
    return true
  } catch {
    return false
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  const data = await request<{ access: string; refresh: string }>(
    "/api/auth/login/",
    { method: "POST", body: JSON.stringify({ email, password }) },
    false,
  )
  saveTokens(data.access, data.refresh)
  return data
}

export async function logout() {
  const refresh = getRefreshToken()
  if (refresh) {
    try {
      await request("/api/auth/logout/", {
        method: "POST",
        body: JSON.stringify({ refresh }),
      })
    } catch { /* ignore */ }
  }
  clearTokens()
}

export async function getMe() {
  return request<AuthUser>("/api/auth/me/")
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboard() {
  return request<DashboardSummary>("/api/dashboard/")
}

// ── Approvals ────────────────────────────────────────────────────────────────

export async function getPendingApprovals(): Promise<Submission[]> {
  const res = await request<Submission[] | { results: Submission[] }>("/api/approvals/")
  return Array.isArray(res) ? res : (res as { results: Submission[] }).results ?? []
}

export async function approveSubmission(id: number, comment: string) {
  return request(`/api/approvals/${id}/act/`, {
    method: "POST",
    body: JSON.stringify({ action: "approve", comment }),
  })
}

export async function rejectSubmission(id: number, comment: string) {
  return request(`/api/approvals/${id}/act/`, {
    method: "POST",
    body: JSON.stringify({ action: "reject", comment }),
  })
}

// ── Reviewed ─────────────────────────────────────────────────────────────────

export async function getReviewed(): Promise<Submission[]> {
  const res = await request<Submission[] | { results: Submission[] }>("/api/reviewed/")
  return Array.isArray(res) ? res : (res as { results: Submission[] }).results ?? []
}

// ── Submissions ───────────────────────────────────────────────────────────────

export async function getSubmissions(): Promise<Submission[]> {
  const res = await request<Submission[] | { results: Submission[] }>("/api/submissions/")
  return Array.isArray(res) ? res : (res as { results: Submission[] }).results ?? []
}

export async function getKpiTemplate(entityId?: number) {
  const qs = entityId ? `?entity=${entityId}` : ""
  return request<Array<{ id: number; name: string; area: string; unit: string; target: number; weight: number }>>(
    `/api/submissions/kpis/template/${qs}`,
  )
}

export interface SubmitPayload {
  quarter: string
  period: string
  overall_comment: string
  kpis: Array<{ kpi: number; actual: number; comment: string }>
}

export async function submitActuals(payload: SubmitPayload) {
  return request<Submission>("/api/submissions/", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

// ── Entities ─────────────────────────────────────────────────────────────────

export interface Entity {
  id: number
  name: string
  short_name: string
}

export async function getEntities(): Promise<Entity[]> {
  const res = await request<Entity[] | { results: Entity[] }>("/api/entities/")
  return Array.isArray(res) ? res : (res as { results: Entity[] }).results ?? []
}

// ── Reports ───────────────────────────────────────────────────────────────────

export async function getReports(): Promise<Submission[]> {
  const res = await request<Submission[] | { results: Submission[] }>("/api/reports/")
  return Array.isArray(res) ? res : (res as { results: Submission[] }).results ?? []
}
