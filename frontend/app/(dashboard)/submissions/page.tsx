"use client"

import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Send, Loader2, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getKpiTemplate,
  getSubmissions,
  getEntities,
  submitActuals,
  type Submission,
  type Entity,
  type KpiSubmitEntry,
} from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

// ---------------------------------------------------------------------------
// Section configuration  exact wording from Performance Contract Matrix
// ---------------------------------------------------------------------------

interface SectionMeta {
  subsection: string   // e.g. "A1", "A2", "B", "C", "D"
  subLabel: string     // italic sub-row text
  sectionHeader?: string // bold full-width header (only where a new section starts)
}

const AREA_ORDER = ["Outcomes", "Outputs", "Service Delivery", "Management", "Cross-Cutting"] as const
type AreaKey = typeof AREA_ORDER[number]

const SECTION_META: Record<AreaKey, SectionMeta> = {
  "Outcomes": {
    subsection: "1",
    subLabel: "OUTCOMES \u2013 State all outcomes and outcome indicators contained in the Agency SPP.",
    sectionHeader: "A\u00a0\u00a0\u00a0 DELIVERY OF MANDATES/OPERATIONS CONTAINED IN THE Agency Strategic Performance Plan",
  },
  "Outputs": {
    subsection: "2",
    subLabel: "OUTPUTS \u2013 State all major outputs contained in the Agency SPP.",
  },
  "Service Delivery": {
    subsection: "B",
    subLabel: "SERVICE DELIVERY STANDARDS",
    sectionHeader: "B\u00a0\u00a0\u00a0 SERVICE DELIVERY STANDARDS",
  },
  "Management": {
    subsection: "C",
    subLabel: "MANAGEMENT OF RESOURCES AND ORGANIZATIONAL DEVELOPMENT",
    sectionHeader: "C\u00a0\u00a0\u00a0 MANAGEMENT OF RESOURCES AND ORGANIZATIONAL DEVELOPMENT",
  },
  "Cross-Cutting": {
    subsection: "D",
    subLabel: "CROSS-CUTTING GOVERNMENT PRIORITIES",
    sectionHeader: "D\u00a0\u00a0\u00a0 CROSS-CUTTING GOVERNMENT PRIORITIES",
  },
}

const SECTION_HEADING_FOR_SUMMARY: Record<AreaKey, { section: string; heading: string }> = {
  "Outcomes":         { section: "A1", heading: "Outcomes" },
  "Outputs":          { section: "A2", heading: "Outputs" },
  "Service Delivery": { section: "B",  heading: "Service Delivery Standards" },
  "Management":       { section: "C",  heading: "Management of Resources and Organisational Development" },
  "Cross-Cutting":    { section: "D",  heading: "Cross-cutting Government Priorities" },
}

// ---------------------------------------------------------------------------
// Scoring helpers
// ---------------------------------------------------------------------------

function calcVariance(periodTarget: number, actual: number): number {
  if (periodTarget === 0) return 0
  return ((actual - periodTarget) / periodTarget) * 100
}

function calcRawScore(variance: number): number {
  if (variance >= 0)   return 6
  if (variance >= -5)  return 5
  if (variance >= -10) return 4
  if (variance >= -20) return 3
  if (variance >= -30) return 2
  return 1
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface KpiRow {
  id: number
  name: string
  area: string
  unit: string
  year_target: number
  period_target: number
  allowable_variance: number
  prev_year_performance: number | null
  weight: number
  actual: string
  self_rating: string
  evaluatee_comment: string
  description: string
}

const QUARTER_PERIODS: Record<string, string> = {
  Q1: "Jul-Sep 2025", Q2: "Oct-Dec 2025", Q3: "Jan-Mar 2026", Q4: "Apr-Jun 2026",
}

function scoreColor(score: number | null | string) {
  const n = typeof score === "string" ? parseFloat(score) : score
  if (n === null || isNaN(n as number)) return ""
  if ((n as number) >= 5) return "text-green-600"
  if ((n as number) >= 3) return "text-amber-600"
  return "text-red-600"
}

function statusBadge(s: string) {
  const m: Record<string, string> = {
    Approved: "bg-green-100 text-green-800", Rejected: "bg-red-100 text-red-800",
    Pending: "bg-amber-100 text-amber-800", "Under Review": "bg-blue-100 text-blue-800",
    Draft: "bg-gray-100 text-gray-700",
  }
  return m[s] ?? "bg-gray-100 text-gray-700"
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function SubmissionsPage() {
  const { user } = useAuth()
  const router = useRouter()

  // M&E consultants use the Approvals/Evaluations page for their MDA scoring work.
  // The Performance Contract Matrix here is for entity users only.
  useEffect(() => {
    if (user?.role === "me" || user?.role === "admin") {
      router.replace("/approvals")
    }
  }, [user, router])

  const [kpis,            setKpis]            = useState<KpiRow[]>([])
  const [entities,        setEntities]        = useState<Entity[]>([])
  const [pastSubmissions, setPastSubmissions] = useState<Submission[]>([])
  const [entity,          setEntity]          = useState<string>("")
  const [quarter,         setQuarter]         = useState<string>("")
  const [designation,     setDesignation]     = useState<string>("")
  const [submitting,      setSubmitting]      = useState(false)
  const [submitError,     setSubmitError]     = useState<string | null>(null)
  const [submitSuccess,   setSubmitSuccess]   = useState(false)
  const [loadingKpis,     setLoadingKpis]     = useState(true)

  useEffect(() => {
    if (user?.role === "entity" && user.entity) setEntity(String(user.entity))
    // CEO/DG/GM/MD is intentionally left blank so the user types the actual name
  }, [user])

  useEffect(() => {
    setLoadingKpis(true)
    getKpiTemplate()
      .then(tpl => setKpis(tpl.map(k => ({
        id: k.id, name: k.name, area: k.area, unit: k.unit,
        year_target: k.target, period_target: k.period_target,
        allowable_variance: k.allowable_variance,
        prev_year_performance: k.prev_year_performance,
        weight: k.weight, actual: "", self_rating: "", evaluatee_comment: "",
        description: k.description ?? "",
      }))))
      .catch(console.error)
      .finally(() => setLoadingKpis(false))
    getEntities().then(d => setEntities(Array.isArray(d) ? d : [])).catch(console.error)
    getSubmissions().then(d => setPastSubmissions(Array.isArray(d) ? d : [])).catch(console.error)
  }, [])

  const updateActual    = (id: number, v: string) => setKpis(p => p.map(k => k.id===id ? {...k, actual: v, self_rating:""} : k))
  const updateRating    = (id: number, v: string) => setKpis(p => p.map(k => k.id===id ? {...k, self_rating: v} : k))
  const updateComment   = (id: number, v: string) => setKpis(p => p.map(k => k.id===id ? {...k, evaluatee_comment: v} : k))
  const updateUnit      = (id: number, v: string) => setKpis(p => p.map(k => k.id===id ? { ...k, unit: v } : k))
  const updateWeight    = (id: number, v: string) => setKpis(p => p.map(k => k.id===id ? { ...k, weight: parseFloat(v) || k.weight } : k))
  const updatePrevYear  = (id: number, v: string) => setKpis(p => p.map(k => k.id===id ? { ...k, prev_year_performance: v === "" ? null : parseFloat(v) } : k))
  const updateYearTgt   = (id: number, v: string) => setKpis(p => p.map(k => k.id===id ? { ...k, year_target: parseFloat(v) || 0 } : k))
  const updateVariance  = (id: number, v: string) => setKpis(p => p.map(k => k.id===id ? { ...k, allowable_variance: parseFloat(v) || 0 } : k))
  const updatePeriodTgt = (id: number, v: string) => setKpis(p => p.map(k => k.id===id ? { ...k, period_target: parseFloat(v) || 0 } : k))

  const computedRows = useMemo(() => kpis.map(kpi => {
    const actualNum  = parseFloat(kpi.actual)
    const hasActual  = !isNaN(actualNum)
    const variance   = hasActual ? calcVariance(kpi.period_target, actualNum) : null
    const autoScore  = variance !== null ? calcRawScore(variance) : null
    const selfRating = kpi.self_rating ? parseInt(kpi.self_rating) : (autoScore ?? null)
    const weighted   = selfRating !== null ? selfRating * kpi.weight : null
    return { ...kpi, actualNum: hasActual ? actualNum : null, variance, autoScore, selfRating, weighted }
  }), [kpis])

  const summaryByArea = useMemo(() => {
    const map: Record<string, {totalWeight:number; totalWeighted:number}> = {}
    for (const r of computedRows) {
      if (!map[r.area]) map[r.area] = { totalWeight: 0, totalWeighted: 0 }
      map[r.area].totalWeight   += r.weight
      map[r.area].totalWeighted += r.weighted ?? 0
    }
    return map
  }, [computedRows])

  const totalWeight   = computedRows.reduce((s,r) => s + r.weight, 0)
  const totalWeighted = computedRows.reduce((s,r) => s + (r.weighted ?? 0), 0)
  const filledCount   = computedRows.filter(r => r.actualNum !== null).length
  const overallScore  = totalWeight > 0 ? (totalWeighted / totalWeight).toFixed(2) : "\u2014"

  const handleSubmit = async () => {
    if (!entity || !quarter) { setSubmitError("Please select an entity and quarter."); return }
    setSubmitting(true); setSubmitError(null)
    try {
      const kpiEntries: KpiSubmitEntry[] = computedRows
        .filter(r => r.actualNum !== null)
        .map(r => ({
          kpi_id: r.id, name: r.name, area: r.area, unit: r.unit,
          year_target: r.year_target, period_target: r.period_target,
          allowable_variance: r.allowable_variance,
          actual: r.actualNum!, self_rating: r.selfRating ?? undefined,
          weight: r.weight, evaluatee_comment: r.evaluatee_comment,
        }))
      await submitActuals({
        entity: parseInt(entity), quarter,
        period: QUARTER_PERIODS[quarter] ?? quarter,
        submitted_by: designation || user?.name || "Entity User",
        kpi_count: kpiEntries.length,
        overall_score: parseFloat(overallScore) || 0,
        overall_comment: "",
        kpis: kpiEntries,
      })
      setSubmitSuccess(true)
      getSubmissions().then(d => setPastSubmissions(Array.isArray(d) ? d : [])).catch(console.error)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Header title="Performance Contract Matrix" />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-6">
          <Tabs defaultValue="new">
            <TabsList>
              <TabsTrigger value="new">New Submission</TabsTrigger>
              <TabsTrigger value="history">Submission History</TabsTrigger>
            </TabsList>

            {/*  NEW SUBMISSION TAB  */}
            <TabsContent value="new" className="space-y-6 mt-6">

              {/* Header block */}
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-center uppercase tracking-wide">
                    PERFORMANCE CONTRACT MATRIX
                  </CardTitle>
                  <p className="text-[11px] text-muted-foreground text-center mt-1">
                    Please note that the last three columns (Actual Performance, Raw score and Weighted score) are to be
                    completed when rating performance, at the end of the performance cycle, while all other columns have
                    to be completed at the beginning of the performance cycle.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        State Enterprise / Parastatal
                      </Label>
                      {user?.role === "entity" ? (
                        <p className="text-sm font-medium border rounded-md px-3 py-2 bg-muted/30">
                          {entities.find(e => String(e.id) === entity)?.name ?? user.entity_name ?? "\u2014"}
                        </p>
                      ) : (
                        <Select value={entity} onValueChange={setEntity}>
                          <SelectTrigger className="h-9"><SelectValue placeholder="Select entity" /></SelectTrigger>
                          <SelectContent>
                            {entities.map(e => <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Performance Period
                      </Label>
                      <Select value={quarter} onValueChange={setQuarter}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Select quarter" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Q1">Quarter 1 (Jul\u2013Sep)</SelectItem>
                          <SelectItem value="Q2">Quarter 2 (Oct\u2013Dec)</SelectItem>
                          <SelectItem value="Q3">Quarter 3 (Jan\u2013Mar)</SelectItem>
                          <SelectItem value="Q4">Quarter 4 (Apr\u2013Jun)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Budget Year
                      </Label>
                      <p className="text-sm font-medium border rounded-md px-3 py-2 bg-muted/30">2025/26</p>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        CEO/DG/GM/MD
                      </Label>
                      <Input
                        value={designation}
                        onChange={e => setDesignation(e.target.value)}
                        placeholder="Type full name and title of the head of the entity"
                        className="h-9 bg-background"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        This field is editable — enter the name &amp; title of the CEO / DG / GM / MD.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rating Scale legend */}
              <Card className="bg-muted/30">
                <CardContent className="py-3 px-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide mb-2">Rating Scale</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 text-[11px]">
                    {[
                      { r: 6, d: "Clearly Exceeds Set Targets \u2013 beyond variance" },
                      { r: 5, d: "Performance Above Set Targets \u2013 but within variance" },
                      { r: 4, d: "Met All Agreed Set Targets" },
                      { r: 3, d: "Performance Below Set Targets \u2013 but within variance" },
                      { r: 2, d: "Performance Below Set Targets \u2013 below variance" },
                      { r: 1, d: "Nothing was accomplished" },
                    ].map(({ r, d }) => (
                      <div key={r} className="flex gap-1.5 items-start">
                        <span className={cn("font-bold shrink-0 text-sm", scoreColor(r))}>{r}</span>
                        <span className="text-muted-foreground leading-tight">{d}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Scoresheet table */}
              {loadingKpis ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  <span className="ml-3 text-sm text-muted-foreground">Loading performance contract...</span>
                </div>
              ) : (
                <Card>
                  <CardContent className="px-0 pb-0">
                    <div className="overflow-x-auto">
                      <Table className="text-xs min-w-[1400px]">
                        <TableHeader>
                          <TableRow className="bg-muted/60">
                            <TableHead className="w-8 text-center font-bold border-r"></TableHead>
                            <TableHead className="min-w-[220px] font-bold">PERFORMANCE AREA/CATEGORY</TableHead>
                            <TableHead className="w-20 text-center font-bold">Measurement Unit</TableHead>
                            <TableHead className="w-16 text-center font-bold">Weightage</TableHead>
                            <TableHead className="w-24 text-center font-bold">Performance Previous Year</TableHead>
                            <TableHead className="w-24 text-center font-bold">Performance Target For Budget Year</TableHead>
                            <TableHead className="w-20 text-center font-bold">Allowable Variance</TableHead>
                            <TableHead className="w-20 text-center font-bold">Period Target</TableHead>
                            <TableHead className="w-24 text-center font-bold text-primary">Actual Performance </TableHead>
                            <TableHead className="w-20 text-center font-bold text-primary">Self Rating </TableHead>
                            <TableHead className="w-20 text-center font-bold text-muted-foreground">Consultant Rating</TableHead>
                            <TableHead className="w-20 text-center font-bold text-muted-foreground">Agreed Rating</TableHead>
                            <TableHead className="w-28 text-center font-bold">Weighted Score (Raw score x weight)</TableHead>
                            <TableHead className="min-w-[150px] font-bold text-primary">Evaluatee Comments </TableHead>
                            <TableHead className="min-w-[130px] font-bold text-muted-foreground">Recommendations</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {AREA_ORDER.map(area => {
                            const rows = computedRows.filter(r => r.area === area)
                            if (rows.length === 0) return null
                            const meta    = SECTION_META[area]
                            const summary = summaryByArea[area] ?? { totalWeight: 0, totalWeighted: 0 }
                            const sectionScore = summary.totalWeight > 0
                              ? (summary.totalWeighted / summary.totalWeight).toFixed(2) : "\u2014"
                            return [
                              /* Section header row  only where a new top-level section begins */
                              meta.sectionHeader && (
                                <TableRow key={`hdr-${area}`} className="bg-primary/10 border-t-2 border-primary/20">
                                  <TableCell className="font-bold text-center text-primary py-2 border-r">
                                    {/* letter extracted from sectionHeader string */}
                                  </TableCell>
                                  <TableCell colSpan={14} className="py-2 px-3 font-bold text-xs uppercase tracking-wide text-primary">
                                    {meta.sectionHeader}
                                  </TableCell>
                                </TableRow>
                              ),
                              /* Sub-section row */
                              <TableRow key={`sub-${area}`} className="bg-muted/30">
                                <TableCell className="font-bold text-center border-r text-muted-foreground">{meta.subsection}</TableCell>
                                <TableCell colSpan={14} className="font-semibold italic text-muted-foreground py-1.5">{meta.subLabel}</TableCell>
                              </TableRow>,
                              /* KPI rows */
                              ...rows.map((row, idx) => (
                                <TableRow key={row.id} className="hover:bg-muted/20">
                                  <TableCell className="text-center text-muted-foreground border-r">{idx + 1}</TableCell>
                                  <TableCell className="font-medium">
                                    <span className="flex items-start gap-1">
                                      <span>{row.name}</span>
                                      {row.description && (
                                        <span title={row.description} className="shrink-0 cursor-help text-muted-foreground/50 hover:text-primary transition-colors mt-0.5">
                                          <Info className="size-3" />
                                        </span>
                                      )}
                                    </span>
                                  </TableCell>
                                  <TableCell className="px-1">
                                    <Input value={row.unit} onChange={e => updateUnit(row.id, e.target.value)} className="h-7 w-16 text-xs text-center" placeholder="Unit" />
                                  </TableCell>
                                  <TableCell className="px-1">
                                    <Input type="number" value={String(row.weight)} onChange={e => updateWeight(row.id, e.target.value)} className="h-7 w-12 text-xs text-center tabular-nums" min={0} step={0.01} />
                                  </TableCell>
                                  <TableCell className="px-1">
                                    <Input type="number" value={row.prev_year_performance ?? ""} onChange={e => updatePrevYear(row.id, e.target.value)} className="h-7 w-20 text-xs text-center tabular-nums" placeholder="\u2014" />
                                  </TableCell>
                                  <TableCell className="px-1">
                                    <Input type="number" value={String(row.year_target)} onChange={e => updateYearTgt(row.id, e.target.value)} className="h-7 w-20 text-xs text-center tabular-nums" min={0} />
                                  </TableCell>
                                  <TableCell className="px-1">
                                    <div className="flex items-center gap-0.5 justify-center">
                                      <span className="text-[10px] text-muted-foreground">±</span>
                                      <Input type="number" value={String(row.allowable_variance)} onChange={e => updateVariance(row.id, e.target.value)} className="h-7 w-12 text-xs text-center tabular-nums" min={0} />
                                      <span className="text-[10px] text-muted-foreground">%</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="px-1">
                                    <Input type="number" value={String(row.period_target)} onChange={e => updatePeriodTgt(row.id, e.target.value)} className="h-7 w-20 text-xs text-center tabular-nums" min={0} />
                                  </TableCell>
                                  <TableCell className="px-1">
                                    <Input type="number" value={row.actual} onChange={e => updateActual(row.id, e.target.value)}
                                      placeholder="Enter" className="h-7 w-20 text-xs text-center tabular-nums" />
                                  </TableCell>
                                  <TableCell className="px-1">
                                    <Select value={row.self_rating || (row.selfRating ? String(row.selfRating) : "")} onValueChange={v => updateRating(row.id, v)}>
                                      <SelectTrigger className="h-7 w-16 text-xs">
                                        <SelectValue placeholder={row.selfRating ? String(row.selfRating) : "\u2014"} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {[1,2,3,4,5,6].map(n => <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>)}
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell className="text-center text-muted-foreground/40 bg-muted/10">\u2014</TableCell>
                                  <TableCell className="text-center text-muted-foreground/40 bg-muted/10">\u2014</TableCell>
                                  <TableCell className="text-center tabular-nums font-semibold">
                                    <span className={cn(scoreColor(row.weighted))}>
                                      {row.weighted != null ? row.weighted.toFixed(1) : "\u2014"}
                                    </span>
                                  </TableCell>
                                  <TableCell className="px-1">
                                    <Input value={row.evaluatee_comment} onChange={e => updateComment(row.id, e.target.value)}
                                      placeholder="Comment..." className="h-7 min-w-[130px] text-xs" />
                                  </TableCell>
                                  <TableCell className="text-muted-foreground/40 bg-muted/10 text-xs">\u2014</TableCell>
                                </TableRow>
                              )),
                              /* Weights sub-total row */
                              <TableRow key={`subtotal-${area}`} className="bg-muted/40 border-b-2 border-muted">
                                <TableCell className="border-r" />
                                <TableCell className="font-bold uppercase tracking-wide text-xs py-2">Weights Sub Total</TableCell>
                                <TableCell /><TableCell className="text-center font-bold">{summary.totalWeight}</TableCell>
                                <TableCell colSpan={6} />
                                <TableCell colSpan={2} className="text-center font-bold">\u2014</TableCell>
                                <TableCell className="text-center font-bold tabular-nums">
                                  <span className={cn(scoreColor(sectionScore))}>{sectionScore}</span>
                                </TableCell>
                                <TableCell colSpan={2} />
                              </TableRow>,
                            ]
                          })}
                          {/* Grand total */}
                          <TableRow className="bg-primary/5 font-bold text-sm border-t-2 border-primary/30">
                            <TableCell className="border-r" />
                            <TableCell className="uppercase tracking-wide py-2">Grand Total</TableCell>
                            <TableCell /><TableCell className="text-center">{totalWeight}</TableCell>
                            <TableCell colSpan={6} />
                            <TableCell colSpan={2} className="text-center">\u2014</TableCell>
                            <TableCell className="text-center tabular-nums">
                              <span className={cn(scoreColor(overallScore))}>{overallScore}</span>
                            </TableCell>
                            <TableCell colSpan={2} />
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Agreed Ratings Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-wide">AGREED RATINGS</CardTitle>
                  <p className="text-[11px] text-muted-foreground">
                    Please use the Rating scale above for guidance in allocating raw scores.
                  </p>
                </CardHeader>
                <CardContent>
                  <Table className="text-xs">
                    <TableHeader>
                      <TableRow className="bg-muted/60">
                        <TableHead className="font-bold w-16">SECTION</TableHead>
                        <TableHead className="font-bold">HEADING</TableHead>
                        <TableHead className="text-center font-bold">Total Weightage</TableHead>
                        <TableHead className="text-center font-bold">Weighted Score</TableHead>
                        <TableHead className="text-center font-bold">RATING</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {AREA_ORDER.map(area => {
                        const meta = SECTION_HEADING_FOR_SUMMARY[area]
                        const s    = summaryByArea[area] ?? { totalWeight: 0, totalWeighted: 0 }
                        const sc   = s.totalWeight > 0 ? (s.totalWeighted / s.totalWeight).toFixed(2) : "\u2014"
                        return (
                          <TableRow key={area}>
                            <TableCell className="font-semibold">{meta.section}</TableCell>
                            <TableCell>{meta.heading}</TableCell>
                            <TableCell className="text-center tabular-nums">{s.totalWeight || "\u2014"}</TableCell>
                            <TableCell className="text-center tabular-nums">{s.totalWeighted > 0 ? s.totalWeighted.toFixed(2) : "\u2014"}</TableCell>
                            <TableCell className="text-center font-bold tabular-nums">
                              <span className={cn(scoreColor(sc))}>{sc}</span>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      <TableRow className="bg-primary/5 font-bold">
                        <TableCell>TOTAL</TableCell>
                        <TableCell />
                        <TableCell className="text-center">{totalWeight || "\u2014"}</TableCell>
                        <TableCell className="text-center tabular-nums">{totalWeighted > 0 ? totalWeighted.toFixed(2) : "\u2014"}</TableCell>
                        <TableCell className="text-center">
                          <span className={cn(scoreColor(overallScore))}>{overallScore}</span>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {submitError && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  <AlertCircle className="size-4 shrink-0" />{submitError}
                </div>
              )}
              {submitSuccess && (
                <div className="flex items-center gap-2 rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700">
                  <CheckCircle2 className="size-4 shrink-0" />Submission sent successfully. Pending review.
                </div>
              )}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <Button disabled={submitting || filledCount === 0} onClick={handleSubmit} className="gap-2 w-full sm:w-auto">
                  {submitting
                    ? <><Loader2 className="size-4 animate-spin" /> Submitting...</>
                    : <><Send className="size-4" /> Submit Performance Contract ({filledCount}/{kpis.length} KPIs)</>}
                </Button>
              </div>
            </TabsContent>

            {/*  HISTORY TAB  */}
            <TabsContent value="history" className="mt-6">
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Submission History</CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <div className="overflow-x-auto">
                  <Table className="text-xs">
                    <TableHeader>
                      <TableRow>
                        <TableHead>State Enterprise / Parastatal</TableHead>
                        <TableHead>Quarter</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead className="text-center">KPIs</TableHead>
                        <TableHead className="text-center">Final Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Reviewed By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pastSubmissions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">No submissions yet.</TableCell>
                        </TableRow>
                      ) : pastSubmissions.map(s => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.entity_name}</TableCell>
                          <TableCell><Badge variant="outline">{s.quarter}</Badge></TableCell>
                          <TableCell className="text-muted-foreground">{s.period}</TableCell>
                          <TableCell className="text-center">{s.kpi_count}</TableCell>
                          <TableCell className="text-center">
                            <span className={cn("font-bold tabular-nums", scoreColor(s.overall_score))}>{s.overall_score.toFixed(2)}</span>
                          </TableCell>
                          <TableCell>
                            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", statusBadge(s.status))}>{s.status}</span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{s.submitted_date}</TableCell>
                          <TableCell className="text-muted-foreground">{s.reviewed_by || "\u2014"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
