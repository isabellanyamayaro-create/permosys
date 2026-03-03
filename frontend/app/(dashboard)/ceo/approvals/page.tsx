"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  CheckCircle2, XCircle, FileText, ArrowLeft, Search, Filter, Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getPendingApprovals, approveSubmission, rejectSubmission,
} from "@/lib/api"
import type { Submission } from "@/lib/api"

export default function CEOApprovalsPage() {
  const [approvals, setApprovals]           = useState<Submission[]>([])
  const [loading, setLoading]               = useState(true)
  const [selected, setSelected]             = useState<Submission | null>(null)
  const [comment, setComment]               = useState("")
  const [acting, setActing]                 = useState(false)
  const [searchQuery, setSearchQuery]       = useState("")
  const [quarterFilter, setQuarterFilter]   = useState("all")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getPendingApprovals()
      setApprovals(Array.isArray(data) ? data : [])
    } catch { /* handled globally by api.ts */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleAction = async (action: "approve" | "reject") => {
    if (!selected) return
    setActing(true)
    try {
      if (action === "approve") await approveSubmission(selected.id, comment)
      else                      await rejectSubmission(selected.id, comment)
      setSelected(null)
      setComment("")
      await load()
    } catch { /* todo: toast */ }
    finally { setActing(false) }
  }

  const filtered = approvals.filter((a) => {
    const matchSearch  = a.entity_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchQuarter = quarterFilter === "all" || a.quarter === quarterFilter
    return matchSearch && matchQuarter
  })

  if (selected) {
    return (
      <>
        <Header title="Review Submission" />
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6 space-y-6">
            <Button
              variant="ghost"
              className="gap-2 text-muted-foreground -ml-2"
              onClick={() => { setSelected(null); setComment("") }}
            >
              <ArrowLeft className="size-4" />
              Back to Pending Approvals
            </Button>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">{selected.entity_name}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {selected.quarter} {selected.period} Â· Submitted by {selected.submitted_by} on {selected.submitted_date}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Overall Score</p>
                  <p className="text-3xl font-bold text-primary tabular-nums">{selected.overall_score.toFixed(1)}</p>
                </div>
                <Badge className={cn(
                  "text-sm py-1 px-3",
                  selected.overall_score >= 4 ? "bg-success/10 text-success" :
                  selected.overall_score >= 3 ? "bg-warning/10 text-warning-foreground" :
                  "bg-destructive/10 text-destructive"
                )}>
                  {selected.overall_score >= 5 ? "Excellent" :
                   selected.overall_score >= 4 ? "Good" :
                   selected.overall_score >= 3 ? "Satisfactory" : "Needs Improvement"}
                </Badge>
              </div>
            </div>

            {/* Section Performance */}
            {selected.sections.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Section Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-5">
                    {selected.sections.map((s) => (
                      <div key={s.name} className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                        <p className="text-xs text-muted-foreground">{s.name}</p>
                        <p className={cn(
                          "text-lg font-bold mt-1",
                          s.score >= 4 ? "text-success" :
                          s.score >= 3 ? "text-warning-foreground" : "text-destructive"
                        )}>{s.score.toFixed(1)}</p>
                        <p className="text-[10px] text-muted-foreground">Weight: {s.weight}% | WS: {s.weighted.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* KPI Table */}
            {selected.kpis.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">KPI Breakdown</CardTitle>
                  <CardDescription>{selected.kpis.length} indicators evaluated</CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>KPI</TableHead>
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
                      {selected.kpis.map((kpi) => (
                        <TableRow key={kpi.id}>
                          <TableCell className="font-medium">{kpi.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-[10px]">{kpi.area}</Badge>
                          </TableCell>
                          <TableCell className="text-center tabular-nums text-muted-foreground">{kpi.target}</TableCell>
                          <TableCell className="text-center tabular-nums font-medium">{kpi.actual}</TableCell>
                          <TableCell className="text-center">
                            <span className={cn(
                              "text-sm font-mono tabular-nums",
                              kpi.variance >= 0 ? "text-success" :
                              kpi.variance >= -10 ? "text-warning-foreground" : "text-destructive"
                            )}>
                              {kpi.variance >= 0 ? "+" : ""}{kpi.variance.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={cn(
                              "font-mono tabular-nums",
                              kpi.raw_score >= 5 ? "bg-success/10 text-success" :
                              kpi.raw_score >= 3 ? "bg-warning/10 text-warning-foreground" :
                              "bg-destructive/10 text-destructive"
                            )}>{kpi.raw_score}</Badge>
                          </TableCell>
                          <TableCell className="text-center tabular-nums text-muted-foreground">{kpi.weight}</TableCell>
                          <TableCell className="text-center font-semibold tabular-nums">{kpi.weighted.toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Decision */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Review Decision</CardTitle>
                <CardDescription>Provide your comments and final decision.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>CEO Comments</Label>
                  <Textarea
                    placeholder="Enter your review comments, observations, and recommendations..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                <Separator />
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button
                    variant="outline"
                    className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
                    disabled={acting}
                    onClick={() => handleAction("reject")}
                  >
                    {acting ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
                    Reject Submission
                  </Button>
                  <Button
                    className="gap-2 bg-success text-success-foreground hover:bg-success/90"
                    disabled={acting}
                    onClick={() => handleAction("approve")}
                  >
                    {acting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                    Approve Submission
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header title="Pending Approvals" />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-6">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search entities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <Select value={quarterFilter} onValueChange={setQuarterFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quarters</SelectItem>
                  <SelectItem value="Q1">Q1</SelectItem>
                  <SelectItem value="Q2">Q2</SelectItem>
                  <SelectItem value="Q3">Q3</SelectItem>
                  <SelectItem value="Q4">Q4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((approval) => (
                <Card
                  key={approval.id}
                  className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
                  onClick={() => setSelected(approval)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                          <FileText className="size-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{approval.entity_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {approval.quarter} {approval.period} Â· {approval.kpi_count} KPIs Â· by {approval.submitted_by}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-muted-foreground">Score</p>
                          <p className={cn(
                            "text-xl font-bold tabular-nums",
                            approval.overall_score >= 4 ? "text-success" :
                            approval.overall_score >= 3 ? "text-warning-foreground" : "text-destructive"
                          )}>{approval.overall_score.toFixed(1)}</p>
                        </div>
                        <Badge className="bg-warning/10 text-warning-foreground">Pending</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filtered.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CheckCircle2 className="mx-auto size-10 text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {approvals.length === 0 ? "No pending approvals." : "No approvals match your filters."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
