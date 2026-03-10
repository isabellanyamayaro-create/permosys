"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, XCircle, Loader2, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getPendingApprovals,
  getReviewed,
  approveSubmission,
  rejectSubmission,
  type Submission,
  type KpiActual,
  type KpiRating,
} from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

// ---------------------------------------------------------------------------
// Section configuration — mirrors the MDA Evaluation Scoring Template
// ---------------------------------------------------------------------------

const AREA_ORDER = ["Outcomes", "Outputs", "Service Delivery", "Management", "Cross-Cutting"] as const
type AreaKey = typeof AREA_ORDER[number]

interface SectionMeta {
  letter: string
  subLabel: string
  sectionHeader?: string
}

const SECTION_META: Record<AreaKey, SectionMeta> = {
  "Outcomes": {
    letter: "1",
    subLabel: "OUTCOMES \u2013 State all outcomes and outcome indicators contained in the Agency SPP.",
    sectionHeader: "A\u00a0\u00a0\u00a0 DELIVERY OF MANDATES/OPERATIONS CONTAINED IN THE Agency Strategic Performance Plan (SPP)",
  },
  "Outputs": {
    letter: "2",
    subLabel: "OUTPUTS \u2013 State all major outputs contained in the Agency SPP.",
  },
  "Service Delivery": {
    letter: "B",
    subLabel: "SERVICE DELIVERY STANDARDS",
    sectionHeader: "B\u00a0\u00a0\u00a0 SERVICE DELIVERY STANDARDS",
  },
  "Management": {
    letter: "C",
    subLabel: "MANAGEMENT OF RESOURCES AND ORGANIZATIONAL DEVELOPMENT",
    sectionHeader: "C\u00a0\u00a0\u00a0 MANAGEMENT OF RESOURCES AND ORGANIZATIONAL DEVELOPMENT",
  },
  "Cross-Cutting": {
    letter: "D",
    subLabel: "CROSS-CUTTING GOVERNMENT PRIORITIES",
    sectionHeader: "D\u00a0\u00a0\u00a0 CROSS-CUTTING GOVERNMENT PRIORITIES",
  },
}

const SUMMARY_META: Record<AreaKey, { section: string; heading: string }> = {
  "Outcomes":         { section: "A1", heading: "Outcomes" },
  "Outputs":          { section: "A2", heading: "Outputs" },
  "Service Delivery": { section: "B",  heading: "Service Delivery Standards" },
  "Management":       { section: "C",  heading: "Management of Resources and Organisational Development" },
  "Cross-Cutting":    { section: "D",  heading: "Cross-Cutting Government Priorities" },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scoreColor(s: number | string | null) {
  const n = typeof s === "string" ? parseFloat(s) : s
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
// Rating state per KPI
// ---------------------------------------------------------------------------

interface RatingState {
  consultant_rating: string
  agreed_rating: string
  recommendation: string
}

interface PlanningState {
  unit: string
  weight: string
  prev_year_performance: string
  year_target: string
  allowable_variance: string
  period_target: string
}

// ---------------------------------------------------------------------------
// MDA IRBM Evaluation Scoresheet — one per submission
// ---------------------------------------------------------------------------

function MdaScoresheet({
  submission,
  onReviewed,
}: {
  submission: Submission
  onReviewed: () => void
}) {
  const { user } = useAuth()
  const isReadOnly = submission.status === "Approved" || submission.status === "Rejected"
  const [open,            setOpen]            = useState(false)
  const [consultantName,  setConsultantName]  = useState(user?.name ?? "")
  const [ratings,         setRatings]         = useState<Record<number, RatingState>>(() =>
    Object.fromEntries(
      submission.kpis.map(k => [
        k.id,
        {
          consultant_rating: k.consultant_rating ? String(k.consultant_rating) : "",
          agreed_rating:     k.agreed_rating     ? String(k.agreed_rating)     : "",
          recommendation:    k.recommendation    ?? "",
        },
      ])
    )
  )
  const [reviewerComment, setReviewerComment] = useState("")
  const [submitting,      setSubmitting]      = useState(false)
  const [error,           setError]           = useState<string | null>(null)
  const [planning, setPlanning] = useState<Record<number, PlanningState>>(() =>
    Object.fromEntries(
      submission.kpis.map(k => [k.id, {
        unit:                  k.unit,
        weight:                String(k.weight),
        prev_year_performance: k.prev_year_performance != null ? String(k.prev_year_performance) : "",
        year_target:           k.year_target != null ? String(k.year_target) : "",
        allowable_variance:    k.allowable_variance != null ? String(k.allowable_variance) : "",
        period_target:         String(k.period_target),
      }])
    )
  )

  const setRating = (id: number, field: keyof RatingState, v: string) =>
    setRatings(prev => ({ ...prev, [id]: { ...prev[id], [field]: v } }))
  const setPlann  = (id: number, field: keyof PlanningState, v: string) =>
    setPlanning(prev => ({ ...prev, [id]: { ...prev[id], [field]: v } }))

  // Group KPIs by area
  const grouped = useMemo(() => {
    const g: Record<string, KpiActual[]> = {}
    for (const k of submission.kpis) {
      if (!g[k.area]) g[k.area] = []
      g[k.area].push(k)
    }
    return g
  }, [submission.kpis])

  // Per-area and grand totals using agreed (fallback consultant, then self) rating
  const summaryByArea = useMemo(() => {
    const map: Record<string, { totalWeight: number; totalWeighted: number }> = {}
    for (const k of submission.kpis) {
      const r  = ratings[k.id]
      const ar = parseFloat(r?.agreed_rating) || parseFloat(r?.consultant_rating)
              || k.agreed_rating || k.consultant_rating || k.self_rating || 0
      const pw = parseFloat(planning[k.id]?.weight) || k.weight
      if (!map[k.area]) map[k.area] = { totalWeight: 0, totalWeighted: 0 }
      map[k.area].totalWeight   += pw
      map[k.area].totalWeighted += ar * pw
    }
    return map
  }, [ratings, planning, submission.kpis])

  const totalWeight   = Object.values(summaryByArea).reduce((s, v) => s + v.totalWeight,   0)
  const totalWeighted = Object.values(summaryByArea).reduce((s, v) => s + v.totalWeighted, 0)
  const liveScore     = totalWeight > 0 ? (totalWeighted / totalWeight).toFixed(2) : "\u2014"

  const kpiRatings: KpiRating[] = submission.kpis.map(k => ({
    kpi_id:            k.kpi_id,
    consultant_rating: parseFloat(ratings[k.id]?.consultant_rating) || 0,
    agreed_rating:     parseFloat(ratings[k.id]?.agreed_rating)     || 0,
    recommendation:    ratings[k.id]?.recommendation ?? "",
  }))

  const handleAction = async (action: "approve" | "reject") => {
    setSubmitting(true); setError(null)
    try {
      const payload = { action, reviewer_comment: reviewerComment, kpi_ratings: kpiRatings }
      if (action === "approve") await approveSubmission(submission.id, payload)
      else                       await rejectSubmission(submission.id, payload)
      onReviewed()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="border-border/60">
      {/* Collapsible header */}
      <CardHeader
        className="cursor-pointer select-none pb-3 flex flex-row items-start justify-between gap-2"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex flex-wrap items-center gap-3">
          {open ? <ChevronDown className="size-4 shrink-0 mt-0.5" /> : <ChevronRight className="size-4 shrink-0 mt-0.5" />}
          <span className="font-semibold text-sm">{submission.entity_name}</span>
          <Badge variant="outline">{submission.quarter}</Badge>
          <span className="text-xs text-muted-foreground">{submission.period}</span>
        </div>
        <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2 text-xs text-muted-foreground shrink-0">
          <span className="text-right">
            Submitted by <strong>{submission.submitted_by}</strong> on {submission.submitted_date}
          </span>
          <span className={cn("rounded-full px-2 py-0.5 font-medium text-[11px] whitespace-nowrap", statusBadge(submission.status))}>
            {submission.status}
          </span>
        </div>
      </CardHeader>

      {open && (
        <CardContent className="space-y-6 pt-0">

          {/* MDA header block */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-center uppercase tracking-wide">
                MDA IRBM Evaluation Scoresheet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Entity Name</Label>
                  <p className="text-sm font-medium border rounded-md px-3 py-2 bg-muted/30">{submission.entity_name}</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Evaluation Period</Label>
                  <p className="text-sm font-medium border rounded-md px-3 py-2 bg-muted/30">
                    {submission.quarter} &mdash; {submission.period}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Year</Label>
                  <p className="text-sm font-medium border rounded-md px-3 py-2 bg-muted/30">2025/26</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Evaluatee Designation (CEO/DG/GM/MD)</Label>
                  <p className="text-sm font-medium border rounded-md px-3 py-2 bg-muted/30">{submission.submitted_by || "\u2014"}</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">State Enterprise / Parastatal</Label>
                  <p className="text-sm font-medium border rounded-md px-3 py-2 bg-muted/30">{submission.entity_name}</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Consultant</Label>
                  <Input
                    value={consultantName}
                    onChange={e => setConsultantName(e.target.value)}
                    placeholder="Consultant name"
                    className="h-9 bg-background"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rating scale legend */}
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

          {/* Main scoresheet table */}
          <Card>
            <CardContent className="px-0 pb-0">
              <div className="overflow-x-auto">
                <Table className="text-xs min-w-[1400px]">
                  <TableHeader>
                    <TableRow className="bg-muted/60">
                      <TableHead className="w-8 text-center font-bold border-r" />
                      <TableHead className="min-w-[220px] font-bold">PERFORMANCE AREA/CATEGORY</TableHead>
                      <TableHead className="w-20 text-center font-bold">Measurement Unit</TableHead>
                      <TableHead className="w-16 text-center font-bold">Weightage</TableHead>
                      <TableHead className="w-24 text-center font-bold">Performance Previous Year</TableHead>
                      <TableHead className="w-24 text-center font-bold">Year Target</TableHead>
                      <TableHead className="w-20 text-center font-bold">Allowable Variance</TableHead>
                      <TableHead className="w-20 text-center font-bold">Period Target</TableHead>
                      <TableHead className="w-24 text-center font-bold text-muted-foreground">Period Actual</TableHead>
                      <TableHead className="w-20 text-center font-bold text-muted-foreground">Self-Rating</TableHead>
                      <TableHead className="w-20 text-center font-bold text-primary">Consultant Rating ✏</TableHead>
                      <TableHead className="w-20 text-center font-bold text-primary">Agreed Rating ✏</TableHead>
                      <TableHead className="w-28 text-center font-bold">Weighted Score</TableHead>
                      <TableHead className="min-w-[140px] font-bold text-muted-foreground">Evaluatee Comments</TableHead>
                      <TableHead className="min-w-[150px] font-bold text-primary">Recommendations ✏</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {AREA_ORDER.map(area => {
                      const rows = grouped[area]
                      if (!rows?.length) return null
                      const meta     = SECTION_META[area]
                      const summary  = summaryByArea[area] ?? { totalWeight: 0, totalWeighted: 0 }
                      const secScore = summary.totalWeight > 0
                        ? (summary.totalWeighted / summary.totalWeight).toFixed(2)
                        : "\u2014"
                      return [
                        /* Section header */
                        meta.sectionHeader && (
                          <TableRow key={`hdr-${area}`} className="bg-primary/10 border-t-2 border-primary/20">
                            <TableCell className="font-bold text-center text-primary py-2 border-r" />
                            <TableCell colSpan={14} className="py-2 px-3 font-bold text-xs uppercase tracking-wide text-primary">
                              {meta.sectionHeader}
                            </TableCell>
                          </TableRow>
                        ),
                        /* Sub-section row */
                        <TableRow key={`sub-${area}`} className="bg-muted/30">
                          <TableCell className="font-bold text-center border-r text-muted-foreground">{meta.letter}</TableCell>
                          <TableCell colSpan={14} className="font-semibold italic text-muted-foreground py-1.5">{meta.subLabel}</TableCell>
                        </TableRow>,
                        /* KPI rows */
                        ...rows.map((kpi, idx) => {
                          const r   = ratings[kpi.id] ?? { consultant_rating: "", agreed_rating: "", recommendation: "" }
                          const cr  = parseFloat(r.consultant_rating) || kpi.consultant_rating || null
                          const ar  = parseFloat(r.agreed_rating)     || kpi.agreed_rating     || null
                          const eff = ar ?? cr ?? kpi.self_rating ?? null
                          const pw  = parseFloat(planning[kpi.id]?.weight) || kpi.weight
                          const wtd = eff !== null ? (eff * pw).toFixed(1) : "\u2014"
                          return (
                            <TableRow key={kpi.id} className="hover:bg-muted/20">
                              <TableCell className="text-center text-muted-foreground border-r">{idx + 1}</TableCell>
                              <TableCell className="font-medium">{kpi.name}</TableCell>
                              <TableCell className="px-1">
                                <Input value={planning[kpi.id]?.unit ?? kpi.unit} onChange={e => setPlann(kpi.id, "unit", e.target.value)} className="h-7 w-16 text-xs text-center" placeholder="Unit" readOnly={isReadOnly} />
                              </TableCell>
                              <TableCell className="px-1">
                                <Input type="number" value={planning[kpi.id]?.weight ?? String(kpi.weight)} onChange={e => setPlann(kpi.id, "weight", e.target.value)} className="h-7 w-12 text-xs text-center tabular-nums" min={0} step={0.01} readOnly={isReadOnly} />
                              </TableCell>
                              <TableCell className="px-1">
                                <Input type="number" value={planning[kpi.id]?.prev_year_performance ?? ""} onChange={e => setPlann(kpi.id, "prev_year_performance", e.target.value)} className="h-7 w-20 text-xs text-center tabular-nums" placeholder="\u2014" readOnly={isReadOnly} />
                              </TableCell>
                              <TableCell className="px-1">
                                <Input type="number" value={planning[kpi.id]?.year_target ?? ""} onChange={e => setPlann(kpi.id, "year_target", e.target.value)} className="h-7 w-20 text-xs text-center tabular-nums" min={0} readOnly={isReadOnly} />
                              </TableCell>
                              <TableCell className="px-1">
                                <div className="flex items-center gap-0.5 justify-center">
                                  <span className="text-[10px] text-muted-foreground">±</span>
                                  <Input type="number" value={planning[kpi.id]?.allowable_variance ?? ""} onChange={e => setPlann(kpi.id, "allowable_variance", e.target.value)} className="h-7 w-12 text-xs text-center tabular-nums" min={0} readOnly={isReadOnly} />
                                  <span className="text-[10px] text-muted-foreground">%</span>
                                </div>
                              </TableCell>
                              <TableCell className="px-1">
                                <Input type="number" value={planning[kpi.id]?.period_target ?? ""} onChange={e => setPlann(kpi.id, "period_target", e.target.value)} className="h-7 w-20 text-xs text-center tabular-nums" min={0} readOnly={isReadOnly} />
                              </TableCell>
                              {/* Entity-submitted — read-only */}
                              <TableCell className="text-center tabular-nums font-semibold bg-muted/5">
                                {kpi.actual.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-center bg-muted/5">
                                <span className={cn("font-medium tabular-nums", scoreColor(kpi.self_rating))}>
                                  {kpi.self_rating ?? "\u2014"}
                                </span>
                              </TableCell>
                              {/* Consultant Rating ✏ */}
                              <TableCell className="px-1">
                                <Select value={r.consultant_rating} onValueChange={v => setRating(kpi.id, "consultant_rating", v)} disabled={isReadOnly}>
                                  <SelectTrigger className="h-7 w-16 text-xs">
                                    <SelectValue placeholder={kpi.consultant_rating ? String(kpi.consultant_rating) : "\u2014"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[1, 2, 3, 4, 5, 6].map(n => (
                                      <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              {/* Agreed Rating ✏ */}
                              <TableCell className="px-1">
                                <Select value={r.agreed_rating} onValueChange={v => setRating(kpi.id, "agreed_rating", v)} disabled={isReadOnly}>
                                  <SelectTrigger className="h-7 w-16 text-xs">
                                    <SelectValue placeholder={kpi.agreed_rating ? String(kpi.agreed_rating) : "\u2014"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[1, 2, 3, 4, 5, 6].map(n => (
                                      <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-center tabular-nums font-semibold">
                                <span className={cn(scoreColor(eff))}>{wtd}</span>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground bg-muted/5">
                                {kpi.evaluatee_comment || ""}
                              </TableCell>
                              {/* Recommendation ✏ */}
                              <TableCell className="px-1">
                                <Input
                                  value={r.recommendation}
                                  onChange={e => setRating(kpi.id, "recommendation", e.target.value)}
                                  placeholder={isReadOnly ? "" : "Enter recommendation..."}
                                  className="h-7 min-w-[130px] text-xs"
                                  readOnly={isReadOnly}
                                />
                              </TableCell>
                            </TableRow>
                          )
                        }),
                        /* Weighted sub-total */
                        <TableRow key={`subtotal-${area}`} className="bg-muted/40 border-b-2 border-muted">
                          <TableCell className="border-r" />
                          <TableCell className="font-bold uppercase tracking-wide text-xs py-2">Weighted Sub Total</TableCell>
                          <TableCell />
                          <TableCell className="text-center font-bold">{summary.totalWeight}</TableCell>
                          <TableCell colSpan={7} />
                          <TableCell className="text-center font-bold tabular-nums">
                            <span className={cn(scoreColor(secScore))}>{secScore}</span>
                          </TableCell>
                          <TableCell colSpan={2} />
                        </TableRow>,
                      ]
                    })}
                    {/* Grand total */}
                    <TableRow className="bg-primary/5 font-bold text-sm border-t-2 border-primary/30">
                      <TableCell className="border-r" />
                      <TableCell className="uppercase tracking-wide py-2">Grand Totals</TableCell>
                      <TableCell />
                      <TableCell className="text-center">{totalWeight}</TableCell>
                      <TableCell colSpan={7} />
                      <TableCell className="text-center tabular-nums">
                        <span className={cn(scoreColor(liveScore))}>{liveScore}</span>
                      </TableCell>
                      <TableCell colSpan={2} />
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Summary Scores table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wide">Summary Scores</CardTitle>
              <p className="text-[11px] text-muted-foreground">Use the rating scale above for guidance in allocating raw scores.</p>
            </CardHeader>
            <CardContent>
              <Table className="text-xs">
                <TableHeader>
                  <TableRow className="bg-muted/60">
                    <TableHead className="font-bold w-16">SECTION</TableHead>
                    <TableHead className="font-bold">HEADING</TableHead>
                    <TableHead className="text-center font-bold">Weightage</TableHead>
                    <TableHead className="text-center font-bold">Weighted Score</TableHead>
                    <TableHead className="text-center font-bold">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {AREA_ORDER.map(area => {
                    const meta = SUMMARY_META[area]
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
                      <span className={cn(scoreColor(liveScore))}>{liveScore}</span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Overall Reviewer Comment */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Overall Reviewer Comment</Label>
            {isReadOnly ? (
              <p className="text-sm text-foreground bg-muted/30 rounded-md p-3 min-h-[60px]">
                {submission.reviewer_comment || "No comment recorded."}
              </p>
            ) : (
              <Textarea
                value={reviewerComment}
                onChange={e => setReviewerComment(e.target.value)}
                placeholder="Summarise the evaluation, note key achievements or concerns..."
                rows={3}
                className="text-sm resize-none"
              />
            )}
          </div>

          {isReadOnly && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge className={statusBadge(submission.status)}>{submission.status}</Badge>
              <span>by {submission.reviewed_by || "—"} on {submission.review_date || "—"}</span>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Actions — only show for pending submissions */}
          {!isReadOnly && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button disabled={submitting} onClick={() => handleAction("approve")}
                className="gap-2 bg-green-700 hover:bg-green-800 text-white w-full sm:w-auto">
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                Approve
              </Button>
              <Button disabled={submitting} variant="destructive" onClick={() => handleAction("reject")}
                className="gap-2 w-full sm:w-auto">
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
                Reject
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ApprovalsPage() {
  const [pending,  setPending]  = useState<Submission[]>([])
  const [reviewed, setReviewed] = useState<Submission[]>([])
  const [loading,  setLoading]  = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([getPendingApprovals(), getReviewed()])
      .then(([p, r]) => {
        setPending(Array.isArray(p) ? p : [])
        setReviewed(Array.isArray(r) ? r : [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <>
      <Header title="MDA Evaluations" />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-4">
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">
                Pending Evaluation
                {pending.length > 0 && (
                  <span className="ml-2 rounded-full bg-amber-500 text-white text-[10px] px-1.5 py-0.5 font-bold leading-none">
                    {pending.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="reviewed">Completed</TabsTrigger>
            </TabsList>

            {/* PENDING */}
            <TabsContent value="pending" className="space-y-4 mt-6">
              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  <span className="ml-3 text-sm text-muted-foreground">Loading submissions...</span>
                </div>
              ) : pending.length === 0 ? (
                <div className="text-center py-24 text-muted-foreground text-sm">
                  <CheckCircle2 className="size-8 mx-auto mb-3 opacity-30" />
                  All caught up! No submissions pending evaluation.
                </div>
              ) : (
                pending.map(s => <MdaScoresheet key={s.id} submission={s} onReviewed={load} />)
              )}
            </TabsContent>

            {/* COMPLETED */}
            <TabsContent value="reviewed" className="mt-6 space-y-4">
              {reviewed.length === 0 ? (
                <p className="text-sm text-muted-foreground py-10 text-center">No completed evaluations yet.</p>
              ) : (
                reviewed.map(s => <MdaScoresheet key={s.id} submission={s} onReviewed={load} />)
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
