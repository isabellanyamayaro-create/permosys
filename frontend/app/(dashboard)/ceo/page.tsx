"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  ClipboardCheck, CheckCircle2, TrendingUp, AlertTriangle, ChevronRight, Eye, Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts"
import { getDashboard } from "@/lib/api"
import type { DashboardSummary } from "@/lib/api"

const barColor = (score: number) => {
  if (score >= 4) return "oklch(0.55 0.18 165)"
  if (score >= 3) return "oklch(0.75 0.15 80)"
  return "oklch(0.55 0.22 27)"
}

export default function CEODashboardPage() {
  const [data, setData]       = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <>
        <Header title="CEO Dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  if (!data) return null

  const atRisk = data.entity_ranking.filter((e) => e.avg_score < 3).length
  const chartData = data.entity_ranking.map((e) => ({
    entity: e.entity__short_name || e.entity__name,
    score:  e.avg_score,
  }))

  return (
    <>
      <Header title="CEO Dashboard" />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Pending Approvals",    value: data.pending,          icon: ClipboardCheck, variant: "warning" as const,     desc: "Awaiting your review" },
              { label: "Reviewed This Period",  value: data.approved + data.rejected, icon: CheckCircle2,  variant: "success" as const,     desc: "Approved + Rejected" },
              { label: "Avg. Entity Score",     value: data.avg_score.toFixed(2),      icon: TrendingUp,    variant: "primary" as const,     desc: "Across approved submissions" },
              { label: "At-Risk Entities",      value: atRisk,               icon: AlertTriangle,  variant: "destructive" as const, desc: "Below 3.0 threshold" },
            ].map((stat) => (
              <Card key={stat.label} className="relative overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.desc}</p>
                    </div>
                    <div className={cn("flex size-10 items-center justify-center rounded-lg", {
                      "bg-warning/10 text-warning-foreground":   stat.variant === "warning",
                      "bg-success/10 text-success":              stat.variant === "success",
                      "bg-primary/10 text-primary":              stat.variant === "primary",
                      "bg-destructive/10 text-destructive":      stat.variant === "destructive",
                    })}>
                      <stat.icon className="size-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Performance Chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Entity Performance Overview</CardTitle>
                <CardDescription>Average scores across approved submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="entity" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                      <YAxis domain={[0, 6]} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                      <Tooltip
                        contentStyle={{ borderRadius: "8px", border: "1px solid oklch(0.91 0.01 250)", background: "white", fontSize: "13px" }}
                        formatter={(v: number) => [v.toFixed(2), "Avg Score"]}
                      />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={48}>
                        {chartData.map((entry, i) => (
                          <Cell key={i} fill={barColor(entry.score)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5"><div className="size-2.5 rounded-full" style={{ background: barColor(5) }} />Good (4+)</div>
                  <div className="flex items-center gap-1.5"><div className="size-2.5 rounded-full" style={{ background: barColor(3.5) }} />Average (3â€“4)</div>
                  <div className="flex items-center gap-1.5"><div className="size-2.5 rounded-full" style={{ background: barColor(2) }} />At Risk (&lt;3)</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending Submissions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Pending Submissions</CardTitle>
                  <CardDescription>Quarterly submissions awaiting your approval</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <Link href="/ceo/approvals">
                    View All <ChevronRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recent_submissions
                    .filter((s) => s.status === "Pending")
                    .map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium text-foreground">{s.entity}</TableCell>
                      <TableCell className="text-muted-foreground">{s.quarter} {s.period}</TableCell>
                      <TableCell className="text-muted-foreground">{s.submitted_date}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn(
                          "font-semibold tabular-nums",
                          s.overall_score >= 4 ? "bg-success/10 text-success" :
                          s.overall_score >= 3 ? "bg-warning/10 text-warning-foreground" :
                          "bg-destructive/10 text-destructive"
                        )}>{s.overall_score.toFixed(1)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-warning/10 text-warning-foreground">Pending</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-primary">
                          <Link href="/ceo/approvals">
                            <Eye className="size-3.5" />Review
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.recent_submissions.filter(s => s.status === "Pending").length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground text-sm">
                        No pending submissions.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
