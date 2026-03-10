"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  FileText,
  TrendingUp,
  CalendarClock,
  AlertTriangle,
  CheckCircle2,
  Send,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getDashboard, getSubmissions, type DashboardSummary, type Submission } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

const SECTION_COLORS = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
]

const ALL_QUARTERS = ["Q1", "Q2", "Q3", "Q4"]

function quarterStatus(subs: Submission[], q: string): { score: number | null; status: string } {
  const match = subs.find((s) => s.quarter === q)
  if (!match) return { score: null, status: "Not Started" }
  if (match.status === "Approved") return { score: match.overall_score, status: "Approved" }
  if (match.status === "Pending" || match.status === "Under Review")
    return { score: null, status: "Pending Submission" }
  return { score: match.overall_score ?? null, status: match.status }
}

export default function EntityDashboardPage() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])

  useEffect(() => {
    getDashboard().then(setSummary).catch(console.error)
    getSubmissions().then((d) => setSubmissions(Array.isArray(d) ? d : [])).catch(console.error)
  }, [])

  const latestApproved = submissions
    .filter((s) => s.status === "Approved")
    .sort((a, b) => new Date(b.submitted_date).getTime() - new Date(a.submitted_date).getTime())[0]

  const ytdScore = summary?.avg_score ?? 0
  const approvedCount = summary?.approved ?? 0
  const pendingCount = summary?.pending ?? 0

  const quarterlyScores = ALL_QUARTERS.map((q) => ({
    quarter: q,
    ...quarterStatus(submissions, q),
  }))

  const sectionBreakdown = latestApproved?.sections ?? []
  const recentActivity = (summary?.recent_submissions ?? []).map((s) => ({
    action: `${s.quarter} ${s.period} submission — ${s.status}`,
    time: new Date(s.submitted_date).toLocaleDateString(),
    type: s.status === "Approved" ? ("success" as const) : ("info" as const),
  }))

  return (
    <>
      <Header title="My Dashboard" />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-6">
          {/* Welcome banner */}
          <Card className="border-primary/20 bg-primary/[0.03]">
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Welcome, {user?.entity_name ?? "Loading..."}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Performance Contract: FY 2025/26
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/entity/contract" className="gap-2">
                      <FileText className="size-4" />
                      View Contract
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/entity/submit" className="gap-2">
                      <Send className="size-4" />
                      Submit Actuals
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">YTD Score</p>
                    <p className="text-2xl font-bold text-foreground">{ytdScore.toFixed(1)}</p>
                    <p className="text-[10px] text-muted-foreground">out of 6.0</p>
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
                    <p className="text-xs text-muted-foreground">Approved</p>
                    <p className="text-lg font-bold text-foreground">{approvedCount}</p>
                    <p className="text-[10px] text-muted-foreground">submissions accepted</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-chart-3/10">
                    <CalendarClock className="size-5 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Quarters Submitted</p>
                    <p className="text-2xl font-bold text-foreground">
                      {quarterlyScores.filter((q) => q.status !== "Not Started").length}/4
                    </p>
                    <p className="text-[10px] text-muted-foreground">FY 2025/26</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-warning/10">
                    <AlertTriangle className="size-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                    <p className="text-[10px] text-muted-foreground">awaiting review</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Quarterly Progress */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Quarterly Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quarterlyScores.map((q) => (
                  <div key={q.quarter} className="flex items-center gap-4">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted font-semibold text-sm text-foreground shrink-0">
                      {q.quarter}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-muted-foreground">{q.status}</span>
                        <span className="text-sm font-semibold tabular-nums text-foreground">
                          {q.score !== null ? `${q.score.toFixed(1)}/6.0` : "---"}
                        </span>
                      </div>
                      <Progress
                        value={q.score !== null ? (q.score / 6) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                    <Badge
                      className={cn(
                        "text-[10px] shrink-0",
                        q.status === "Approved" && "bg-success/10 text-success",
                        q.status === "Pending Submission" && "bg-warning/10 text-warning-foreground",
                        q.status === "Not Started" && "bg-muted text-muted-foreground",
                      )}
                    >
                      {q.status === "Approved" ? "Done" : q.status === "Pending Submission" ? "Due" : "Upcoming"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Section Performance */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Section Performance (Latest Approved)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sectionBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No approved submissions yet.</p>
                ) : (
                  sectionBreakdown.map((section, i) => (
                    <div key={section.name} className="flex items-center gap-4">
                      <div className={cn("size-2.5 rounded-full shrink-0", SECTION_COLORS[i % SECTION_COLORS.length])} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-foreground">{section.name}</span>
                          <span className="text-xs text-muted-foreground">{section.weight}% weight</span>
                        </div>
                        <Progress value={(section.score / 6) * 100} className="h-2" />
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-foreground w-8 text-right shrink-0">
                        {section.score.toFixed(1)}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity.</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((a, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={cn(
                        "flex size-7 items-center justify-center rounded-full shrink-0 mt-0.5",
                        a.type === "success" ? "bg-success/10" : "bg-primary/10"
                      )}>
                        {a.type === "success" ? (
                          <CheckCircle2 className="size-3.5 text-success" />
                        ) : (
                          <FileText className="size-3.5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{a.action}</p>
                        <p className="text-xs text-muted-foreground">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
