const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "")

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

export type UserRole = "me" | "admin" | "entity"

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
  reviewer_comment: string
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
  // Consultant-defined (read-only after creation)
  year_target: number
  period_target: number
  allowable_variance: number
  prev_year_performance: number | null
  // Entity-supplied
  actual: number
  variance: number
  // Ratings
  self_rating: number | null
  consultant_rating: number | null
  agreed_rating: number | null
  // Scoring
  raw_score: number
  weight: number
  weighted: number
  // Comments
  evaluatee_comment: string
  recommendation: string
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

export async function approveSubmission(id: number, payload: ApprovalPayload) {
  return request(`/api/approvals/${id}/act/`, {
    method: "POST",
    body: JSON.stringify({ ...payload, action: "approve" }),
  })
}

export async function rejectSubmission(id: number, payload: ApprovalPayload) {
  return request(`/api/approvals/${id}/act/`, {
    method: "POST",
    body: JSON.stringify({ ...payload, action: "reject" }),
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
  return request<Array<{
    id: number
    name: string
    area: string
    unit: string
    target: number
    weight: number
    allowable_variance: number
    prev_year_performance: number | null
    period_target: number
    description: string
  }>>(
    `/api/submissions/kpis/template/${qs}`,
  )
}

export interface KpiSubmitEntry {
  kpi_id: number
  name: string
  area: string
  unit: string
  year_target: number
  period_target: number
  allowable_variance: number
  actual: number
  self_rating?: number
  weight: number
  evaluatee_comment?: string
}

export interface SubmitPayload {
  entity: number
  quarter: string
  period: string
  submitted_by: string
  kpi_count: number
  overall_score: number
  overall_comment: string
  kpis: KpiSubmitEntry[]
}

export async function submitActuals(payload: SubmitPayload) {
  return request<Submission>("/api/submissions/", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export interface KpiRating {
  kpi_id: number
  consultant_rating: number
  agreed_rating: number
  recommendation?: string
}

export interface ApprovalPayload {
  action: "approve" | "reject"
  reviewer_comment: string
  kpi_ratings: KpiRating[]
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

export async function createEntity(data: Omit<Entity, "id">) {
  return request<Entity>("/api/entities/", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateEntity(id: number, data: Partial<Entity>) {
  return request<Entity>(`/api/entities/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function deleteEntity(id: number) {
  return request<void>(`/api/entities/${id}/`, { method: "DELETE" })
}

// ── Reports ───────────────────────────────────────────────────────────────────

export async function getReports(): Promise<Submission[]> {
  const res = await request<Submission[] | { results: Submission[] }>("/api/reports/")
  return Array.isArray(res) ? res : (res as { results: Submission[] }).results ?? []
}

// ── Users ────────────────────────────────────────────────────────────────────

export interface PmsUser {
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

export interface CreateUserPayload {
  email: string
  name: string
  role: string
  entity?: number | null
  password: string
}

export async function getUsers(): Promise<PmsUser[]> {
  const res = await request<PmsUser[] | { results: PmsUser[] }>("/api/users/")
  return Array.isArray(res) ? res : (res as { results: PmsUser[] }).results ?? []
}

export async function createUser(data: CreateUserPayload) {
  return request<PmsUser>("/api/users/", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateUser(id: number, data: Partial<PmsUser>) {
  return request<PmsUser>(`/api/users/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function deleteUser(id: number) {
  return request<void>(`/api/users/${id}/`, { method: "DELETE" })
}

// ── KPI Definitions ─────────────────────────────────────────────────────────

export interface KpiDefinition {
  id: number
  name: string
  area: string
  unit: string
  target: number
  weight: number
  allowable_variance: number
  prev_year_performance: number | null
  period_target: number
  description: string
}

export async function getKpiDefinitions(): Promise<KpiDefinition[]> {
  const res = await request<KpiDefinition[] | { results: KpiDefinition[] }>("/api/kpis/")
  return Array.isArray(res) ? res : (res as { results: KpiDefinition[] }).results ?? []
}

export async function createKpiDefinition(data: Omit<KpiDefinition, "id" | "period_target">) {
  return request<KpiDefinition>("/api/kpis/", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateKpiDefinition(id: number, data: Partial<KpiDefinition>) {
  return request<KpiDefinition>(`/api/kpis/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function deleteKpiDefinition(id: number) {
  return request<void>(`/api/kpis/${id}/`, { method: "DELETE" })
}

// ── Contracts ───────────────────────────────────────────────────────────────

export interface Contract {
  id: number
  entity: number
  entity_detail?: Entity
  period: string
  status: string
  total_kpis: number
  reviewer: string
  signed_date: string | null
}

export async function getContracts(): Promise<Contract[]> {
  const res = await request<Contract[] | { results: Contract[] }>("/api/contracts/")
  return Array.isArray(res) ? res : (res as { results: Contract[] }).results ?? []
}

export async function createContract(data: Omit<Contract, "id" | "entity_detail">) {
  return request<Contract>("/api/contracts/", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateContract(id: number, data: Partial<Contract>) {
  return request<Contract>(`/api/contracts/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function deleteContract(id: number) {
  return request<void>(`/api/contracts/${id}/`, { method: "DELETE" })
}

// ── Audit Logs ──────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: number
  action: string
  user: string
  role: string
  target: string
  details: string
  timestamp: string
}

export async function getAuditLogs(params?: { user?: string; action?: string; search?: string }): Promise<AuditLogEntry[]> {
  const qs = new URLSearchParams()
  if (params?.user) qs.set("user", params.user)
  if (params?.action) qs.set("action", params.action)
  if (params?.search) qs.set("search", params.search)
  const query = qs.toString() ? `?${qs.toString()}` : ""
  const res = await request<AuditLogEntry[] | { results: AuditLogEntry[] }>(`/api/audit-log/${query}`)
  return Array.isArray(res) ? res : (res as { results: AuditLogEntry[] }).results ?? []
}
