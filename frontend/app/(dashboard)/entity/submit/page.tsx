"use client"

import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Send,
  Save,
  Calculator,
  AlertCircle,
  CheckCircle2,
  Upload,
  FileUp,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getKpiTemplate, getSubmissions, submitActuals, type Submission } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

interface KpiRow {
  id: number
  name: string
  area: string
  unit: string
  target: number
  weight: number
  actual: string
  comment: string
}

const QUARTER_PERIODS: Record<string, string> = {
  Q1: "Jul-Sep 2025",
  Q2: "Oct-Dec 2025",
  Q3: "Jan-Mar 2026",
  Q4: "Apr-Jun 2026",
}

function calculateVariance(target: number, actual: number): number {
  if (target === 0) return 0
  return ((actual - target) / target) * 100
}

function calculateRawScore(variance: number): number {
  if (variance >= 0) return 6
  if (variance >= -5) return 5
  if (variance >= -10) return 4
  if (variance >= -20) return 3
  if (variance >= -30) return 2
  return 1
}

export default function EntitySubmitPage() {
  const { user } = useAuth()
  const [kpis, setKpis] = useState<KpiRow[]>([])
  const [pastSubmissions, setPastSubmissions] = useState<Submission[]>([])
  const [quarter, setQuarter] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [overallComment, setOverallComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    getKpiTemplate().then((template) => {
      setKpis(template.map((k) => ({ ...k, actual: "", comment: "" })))
    }).catch(console.error)
    getSubmissions().then((d) => setPastSubmissions(Array.isArray(d) ? d : [])).catch(console.error)
  }, [])

  const updateActual = (id: number, value: string) => {
    setKpis((prev) =>
      prev.map((kpi) => (kpi.id === id ? { ...kpi, actual: value } : kpi))
    )
  }

  const updateComment = (id: number, value: string) => {
    setKpis((prev) =>
      prev.map((kpi) => (kpi.id === id ? { ...kpi, comment: value } : kpi))
    )
  }

  const computedRows = useMemo(() => {
    return kpis.map((kpi) => {
      const actual = parseFloat(kpi.actual)
      const hasValue = !isNaN(actual)
      const variance = hasValue ? calculateVariance(kpi.target, actual) : null
      const rawScore = variance !== null ? calculateRawScore(variance) : null
      const weightedScore = rawScore !== null ? rawScore * kpi.weight : null
      return { ...kpi, actualNum: hasValue ? actual : null, variance, rawScore, weightedScore }
    })
  }, [kpis])

  const totalWeight = kpis.reduce((sum, k) => sum + k.weight, 0)
  const totalWeightedScore = computedRows.reduce((sum, r) => sum + (r.weightedScore || 0), 0)
  const overallScore = totalWeight > 0 ? (totalWeightedScore / totalWeight).toFixed(2) : "---"
  const filledCount = computedRows.filter((r) => r.actualNum !== null).length
  const allFilled = filledCount === kpis.length

  const areas = Array.from(new Set(kpis.map((k) => k.area)))

  return (
    <>
      <Header title="Submit Actuals" />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-6">
          <Tabs defaultValue="new">
            <TabsList>
              <TabsTrigger value="new">New Submission</TabsTrigger>
              <TabsTrigger value="history">My Submissions</TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="space-y-6 mt-6">
              {/* Entity & Quarter selector */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileUp className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{user?.entity_name ?? "Loading..."}</p>
                        <p className="text-xs text-muted-foreground">FY 2025/26 Performance Contract</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          Quarter
                        </label>
                        <Select value={quarter} onValueChange={setQuarter}>
                          <SelectTrigger className="w-48 h-9">
                            <SelectValue placeholder="Select quarter" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Q1">Q1 (Jul - Sep 2025)</SelectItem>
                            <SelectItem value="Q2">Q2 (Oct - Dec 2025)</SelectItem>
                            <SelectItem value="Q3">Q3 (Jan - Mar 2026)</SelectItem>
                            <SelectItem value="Q4">Q4 (Apr - Jun 2026)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress summary */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border-primary/20 bg-primary/[0.03]">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                        <Calculator className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Calculated Score</p>
                        <p className="text-xl font-bold text-foreground">{overallScore}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-success/10">
                        <CheckCircle2 className="size-5 text-success" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">KPIs Completed</p>
                        <p className="text-xl font-bold text-foreground">{filledCount}/{kpis.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-warning/10">
                        <AlertCircle className="size-5 text-warning" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Weight</p>
                        <p className="text-xl font-bold text-foreground">{totalWeight}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actuals entry table grouped by area */}
              {areas.map((area) => {
                const areaRows = computedRows.filter((r) => r.area === area)
                return (
                  <Card key={area}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-foreground">
                        {area}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {areaRows.length} indicators in this section
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="min-w-[180px]">KPI Name</TableHead>
                              <TableHead className="text-center">Target</TableHead>
                              <TableHead className="text-center">Actual</TableHead>
                              <TableHead className="text-center">Variance</TableHead>
                              <TableHead className="text-center">Score</TableHead>
                              <TableHead className="text-center">Wt</TableHead>
                              <TableHead className="text-center">Weighted</TableHead>
                              <TableHead className="min-w-[140px]">Comment</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {areaRows.map((row) => (
                              <TableRow key={row.id}>
                                <TableCell className="font-medium text-foreground">
                                  {row.name}
                                </TableCell>
                                <TableCell className="text-center tabular-nums text-muted-foreground">
                                  {row.target} {row.unit}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Input
                                    type="number"
                                    value={row.actual}
                                    onChange={(e) => updateActual(row.id, e.target.value)}
                                    className="h-8 w-24 text-center mx-auto"
                                    placeholder="---"
                                  />
                                </TableCell>
                                <TableCell className="text-center">
                                  {row.variance !== null ? (
                                    <span
                                      className={cn(
                                        "text-sm font-mono tabular-nums",
                                        row.variance >= 0
                                          ? "text-success"
                                          : row.variance >= -10
                                          ? "text-warning-foreground"
                                          : "text-destructive"
                                      )}
                                    >
                                      {row.variance >= 0 ? "+" : ""}
                                      {row.variance.toFixed(1)}%
                                    </span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">---</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {row.rawScore !== null ? (
                                    <Badge
                                      className={cn(
                                        "font-mono tabular-nums",
                                        row.rawScore >= 5
                                          ? "bg-success/10 text-success"
                                          : row.rawScore >= 3
                                          ? "bg-warning/10 text-warning-foreground"
                                          : "bg-destructive/10 text-destructive"
                                      )}
                                    >
                                      {row.rawScore}
                                    </Badge>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">---</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center tabular-nums text-muted-foreground">
                                  {row.weight}
                                </TableCell>
                                <TableCell className="text-center font-semibold tabular-nums text-foreground">
                                  {row.weightedScore !== null ? row.weightedScore.toFixed(1) : "---"}
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={row.comment}
                                    onChange={(e) => updateComment(row.id, e.target.value)}
                                    className="h-8 text-xs"
                                    placeholder="Optional note..."
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {/* Overall comment & supporting docs */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Overall Comment
                    </label>
                    <Textarea
                      value={overallComment}
                      onChange={(e) => setOverallComment(e.target.value)}
                      placeholder="Provide any additional context for this quarterly submission..."
                      className="resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Supporting Documents
                    </label>
                    <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-6 text-center">
                      <div className="space-y-2">
                        <Upload className="size-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Drag and drop files here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF, DOC, XLS up to 10MB each
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {allFilled
                    ? "All KPIs completed. Ready to submit."
                    : `${kpis.length - filledCount} KPIs remaining.`}
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" className="gap-2">
                    <Save className="size-4" />
                    Save Draft
                  </Button>
                  <Button
                    className="gap-2"
                    onClick={() => setConfirmOpen(true)}
                  >
                    <Send className="size-4" />
                    Submit for Review
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-6 space-y-4">
              {pastSubmissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No submissions yet.</p>
              ) : (
                pastSubmissions.map((sub) => (
                  <Card key={sub.id}>
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "flex size-11 items-center justify-center rounded-lg",
                            sub.status === "Approved" ? "bg-success/10" : "bg-warning/10"
                          )}>
                            {sub.status === "Approved" ? (
                              <CheckCircle2 className="size-5 text-success" />
                            ) : (
                              <Clock className="size-5 text-warning" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{sub.quarter} {sub.period}</p>
                            <p className="text-xs text-muted-foreground">Submitted: {sub.submitted_date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xl font-bold tabular-nums text-foreground">{sub.overall_score.toFixed(1)}</p>
                            <p className="text-[10px] text-muted-foreground">out of 6.0</p>
                          </div>
                          <Badge className={cn(
                            sub.status === "Approved" && "bg-success/10 text-success",
                            sub.status === "Pending" && "bg-warning/10 text-warning-foreground",
                            sub.status === "Rejected" && "bg-destructive/10 text-destructive",
                          )}>{sub.status}</Badge>
                        </div>
                      </div>
                      {sub.ceo_comment && (
                        <div className="mt-4 rounded-lg bg-muted/50 p-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">CEO Feedback</p>
                          <p className="text-sm text-foreground">{sub.ceo_comment}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>

          {/* Confirmation dialog */}
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Submission</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <p className="text-sm text-muted-foreground">
                  You are about to submit your quarterly actuals for review. Once submitted,
                  you will not be able to edit the values until the CEO returns the submission.
                </p>
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quarter</span>
                    <span className="font-medium text-foreground">{quarter || "Not selected"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">KPIs Filled</span>
                    <span className="font-medium text-foreground">{filledCount}/{kpis.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Overall Score</span>
                    <span className="font-bold text-foreground">{overallScore}</span>
                  </div>
                </div>
                {!allFilled && (
                  <div className="flex items-center gap-2 rounded-lg bg-warning/10 p-3">
                    <AlertCircle className="size-4 text-warning shrink-0" />
                    <p className="text-xs text-warning-foreground">
                      Warning: {kpis.length - filledCount} KPI(s) have no actual values entered.
                    </p>
                  </div>
                )}
              </div>
              {submitError && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3">
                  <AlertCircle className="size-4 text-destructive shrink-0" />
                  <p className="text-xs text-destructive">{submitError}</p>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={submitting}>Cancel</Button>
                <Button
                  className="gap-2"
                  disabled={submitting || !quarter}
                  onClick={async () => {
                    setSubmitting(true)
                    setSubmitError(null)
                    try {
                      const payload = {
                        quarter,
                        period: QUARTER_PERIODS[quarter] ?? quarter,
                        overall_comment: overallComment,
                        kpis: kpis
                          .filter((k) => k.actual !== "")
                          .map((k) => ({ kpi: k.id, actual: parseFloat(k.actual), comment: k.comment })),
                      }
                      await submitActuals(payload)
                      setSubmitSuccess(true)
                      setConfirmOpen(false)
                      setQuarter("")
                      setOverallComment("")
                      setKpis((prev) => prev.map((k) => ({ ...k, actual: "", comment: "" })))
                      getSubmissions().then((d) => setPastSubmissions(Array.isArray(d) ? d : [])).catch(console.error)
                    } catch (err) {
                      setSubmitError((err as Error).message)
                    } finally {
                      setSubmitting(false)
                    }
                  }}
                >
                  <Send className="size-4" />
                  {submitting ? "Submitting..." : "Confirm Submit"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  )
}
