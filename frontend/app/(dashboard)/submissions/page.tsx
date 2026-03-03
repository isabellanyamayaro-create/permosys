"use client"

import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Save, Calculator, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getKpiTemplate, getSubmissions, getEntities, submitActuals, type Submission, type Entity } from "@/lib/api"

interface KpiRow {
  id: number
  name: string
  area: string
  unit: string
  target: number
  weight: number
  actual: string
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

const QUARTER_PERIODS: Record<string, string> = {
  Q1: "Jul-Sep 2025",
  Q2: "Oct-Dec 2025",
  Q3: "Jan-Mar 2026",
  Q4: "Apr-Jun 2026",
}

export default function SubmissionsPage() {
  const [kpis, setKpis] = useState<KpiRow[]>([])
  const [entities, setEntities] = useState<Entity[]>([])
  const [pastSubmissions, setPastSubmissions] = useState<Submission[]>([])
  const [entity, setEntity] = useState("")
  const [quarter, setQuarter] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    getKpiTemplate().then((tpl) => setKpis(tpl.map((k) => ({ ...k, actual: "" })))).catch(console.error)
    getEntities().then((data) => setEntities(Array.isArray(data) ? data : [])).catch(console.error)
    getSubmissions().then((data) => setPastSubmissions(Array.isArray(data) ? data : [])).catch(console.error)
  }, [])

  const updateActual = (id: number, value: string) => {
    setKpis((prev) =>
      prev.map((kpi) => (kpi.id === id ? { ...kpi, actual: value } : kpi))
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
  const maxPossibleScore = totalWeight * 6
  const overallScore = maxPossibleScore > 0 ? (totalWeightedScore / totalWeight).toFixed(2) : "---"
  const filledCount = computedRows.filter((r) => r.actualNum !== null).length

  return (
    <>
      <Header title="Quarterly Submissions" />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-6">
          <Tabs defaultValue="new">
            <TabsList>
              <TabsTrigger value="new">New Submission</TabsTrigger>
              <TabsTrigger value="history">Submission History</TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="space-y-6 mt-6">
              {/* Selection bar */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Entity</label>
                  <Select value={entity} onValueChange={setEntity}>
                    <SelectTrigger className="w-56 h-9">
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {entities.map((e) => (
                        <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quarter</label>
                  <Select value={quarter} onValueChange={setQuarter}>
                    <SelectTrigger className="w-40 h-9">
                      <SelectValue placeholder="Select quarter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1">Q1 (Jul - Sep)</SelectItem>
                      <SelectItem value="Q2">Q2 (Oct - Dec)</SelectItem>
                      <SelectItem value="Q3">Q3 (Jan - Mar)</SelectItem>
                      <SelectItem value="Q4">Q4 (Apr - Jun)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border-primary/20 bg-primary/[0.03]">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                        <Calculator className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Overall Score</p>
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

              {/* Submission Form Table */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground">
                    KPI Actuals Entry
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>KPI Name</TableHead>
                          <TableHead>Area</TableHead>
                          <TableHead className="text-center">Target</TableHead>
                          <TableHead className="text-center">Actual</TableHead>
                          <TableHead className="text-center">Variance</TableHead>
                          <TableHead className="text-center">Raw Score</TableHead>
                          <TableHead className="text-center">Weight</TableHead>
                          <TableHead className="text-center">Weighted</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {computedRows.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="font-medium text-foreground min-w-[180px]">
                              {row.name}
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-muted-foreground">{row.area}</span>
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
                                    row.variance >= 0 ? "text-success" : row.variance >= -10 ? "text-warning-foreground" : "text-destructive"
                                  )}
                                >
                                  {row.variance >= 0 ? "+" : ""}{row.variance.toFixed(1)}%
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
                                    row.rawScore >= 5 ? "bg-success/10 text-success" :
                                    row.rawScore >= 3 ? "bg-warning/10 text-warning-foreground" :
                                    "bg-destructive/10 text-destructive"
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
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50 font-semibold">
                          <TableCell colSpan={6} className="text-right text-foreground">
                            Totals
                          </TableCell>
                          <TableCell className="text-center tabular-nums text-foreground">
                            {totalWeight}
                          </TableCell>
                          <TableCell className="text-center tabular-nums text-foreground">
                            {totalWeightedScore.toFixed(1)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button variant="outline" className="gap-2" disabled={submitting}>
                  <Save className="size-4" />
                  Save Draft
                </Button>
                <Button
                  className="gap-2"
                  disabled={submitting || !entity || !quarter}
                  onClick={async () => {
                    setSubmitting(true)
                    setSubmitError(null)
                    try {
                      const payload = {
                        quarter,
                        period: QUARTER_PERIODS[quarter] ?? quarter,
                        overall_comment: "",
                        kpis: kpis
                          .filter((k) => k.actual !== "")
                          .map((k) => ({ kpi: k.id, actual: parseFloat(k.actual), comment: "" })),
                      }
                      await submitActuals(payload)
                      setKpis((prev) => prev.map((k) => ({ ...k, actual: "" })))
                      setEntity("")
                      setQuarter("")
                      getSubmissions().then((data) => setPastSubmissions(Array.isArray(data) ? data : [])).catch(console.error)
                    } catch (err) {
                      setSubmitError((err as Error).message)
                    } finally {
                      setSubmitting(false)
                    }
                  }}
                >
                  <Send className="size-4" />
                  {submitting ? "Submitting..." : "Submit for Review"}
                </Button>
              </div>
              {submitError && (
                <p className="text-xs text-destructive">{submitError}</p>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Past Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entity</TableHead>
                        <TableHead>Quarter</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                        <TableHead>Date Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pastSubmissions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">No submissions found.</TableCell>
                        </TableRow>
                      ) : (
                        pastSubmissions.map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell className="font-medium text-foreground">{sub.entity_name}</TableCell>
                            <TableCell className="text-muted-foreground">{sub.quarter} {sub.period}</TableCell>
                            <TableCell>
                              <Badge className={cn(
                                "text-xs",
                                sub.status === "Approved" && "bg-success/10 text-success",
                                sub.status === "Pending" && "bg-warning/10 text-warning-foreground",
                                sub.status === "Under Review" && "bg-warning/10 text-warning-foreground",
                                sub.status === "Rejected" && "bg-destructive/10 text-destructive",
                              )}>
                                {sub.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold tabular-nums text-foreground">
                              {sub.overall_score.toFixed(1)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">{sub.submitted_date}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
