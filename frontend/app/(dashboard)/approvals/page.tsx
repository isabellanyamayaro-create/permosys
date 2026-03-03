"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  FileText,
  ArrowLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"

const pendingApprovals = [
  {
    id: "A-001",
    entity: "Ministry of Health",
    quarter: "Q2",
    period: "2025/26",
    submittedBy: "M. Shikongo",
    submittedDate: "2026-01-14",
    kpiCount: 10,
    overallScore: 4.3,
    sections: [
      { name: "Outcomes", score: 4.5, weight: 25, weighted: 1.125 },
      { name: "Outputs", score: 4.2, weight: 25, weighted: 1.05 },
      { name: "Service Delivery", score: 4.1, weight: 20, weighted: 0.82 },
      { name: "Management", score: 4.4, weight: 15, weighted: 0.66 },
      { name: "Cross-Cutting", score: 4.3, weight: 15, weighted: 0.645 },
    ],
    kpis: [
      { name: "Budget Execution Rate", area: "Outcomes", target: 95, actual: 92, variance: -3.2, rawScore: 5, weight: 5, weighted: 25 },
      { name: "Revenue Collection Target", area: "Outcomes", target: 850, actual: 820, variance: -3.5, rawScore: 5, weight: 5, weighted: 25 },
      { name: "Legislative Bills Processed", area: "Outputs", target: 12, actual: 11, variance: -8.3, rawScore: 4, weight: 4, weighted: 16 },
      { name: "Policy Documents Developed", area: "Outputs", target: 8, actual: 7, variance: -12.5, rawScore: 3, weight: 4, weighted: 12 },
      { name: "Service Delivery Index", area: "Service Delivery", target: 4.5, actual: 4.3, variance: -4.4, rawScore: 5, weight: 5, weighted: 25 },
      { name: "Citizen Satisfaction Index", area: "Service Delivery", target: 4.0, actual: 3.8, variance: -5.0, rawScore: 5, weight: 4, weighted: 20 },
      { name: "Staff Training Completion", area: "Management", target: 90, actual: 88, variance: -2.2, rawScore: 5, weight: 3, weighted: 15 },
      { name: "ICT Systems Uptime", area: "Management", target: 99.5, actual: 99.1, variance: -0.4, rawScore: 5, weight: 3, weighted: 15 },
      { name: "Audit Compliance Score", area: "Cross-Cutting", target: 4.5, actual: 4.2, variance: -6.7, rawScore: 4, weight: 4, weighted: 16 },
      { name: "Gender Mainstreaming Score", area: "Cross-Cutting", target: 4.0, actual: 4.1, variance: 2.5, rawScore: 6, weight: 3, weighted: 18 },
    ],
  },
  {
    id: "A-002",
    entity: "Ministry of Education",
    quarter: "Q1",
    period: "2025/26",
    submittedBy: "L. Amupanda",
    submittedDate: "2025-10-20",
    kpiCount: 8,
    overallScore: 3.9,
    sections: [
      { name: "Outcomes", score: 4.0, weight: 25, weighted: 1.0 },
      { name: "Outputs", score: 3.8, weight: 25, weighted: 0.95 },
      { name: "Service Delivery", score: 3.7, weight: 20, weighted: 0.74 },
      { name: "Management", score: 4.1, weight: 15, weighted: 0.615 },
      { name: "Cross-Cutting", score: 3.9, weight: 15, weighted: 0.585 },
    ],
    kpis: [],
  },
]

const completedApprovals = [
  { entity: "Ministry of Finance", quarter: "Q1", decision: "Approved", score: 4.6, decidedBy: "CEO", date: "2025-10-25" },
  { entity: "Ministry of Finance", quarter: "Q2", decision: "Approved", score: 4.5, decidedBy: "CEO", date: "2026-01-20" },
  { entity: "Ministry of Health", quarter: "Q1", decision: "Approved", score: 4.2, decidedBy: "CEO", date: "2025-10-28" },
  { entity: "Ministry of Transport", quarter: "Q1", decision: "Rejected", score: 3.1, decidedBy: "CEO", date: "2025-11-02" },
]

export default function ApprovalsPage() {
  const [selectedApproval, setSelectedApproval] = useState<typeof pendingApprovals[0] | null>(null)
  const [comment, setComment] = useState("")

  if (selectedApproval) {
    return (
      <>
        <Header title="Review Submission" />
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6 space-y-6">
            <Button
              variant="ghost"
              className="gap-2 text-muted-foreground -ml-2"
              onClick={() => setSelectedApproval(null)}
            >
              <ArrowLeft className="size-4" />
              Back to Approvals
            </Button>

            {/* Header info */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">{selectedApproval.entity}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedApproval.quarter} {selectedApproval.period} -- Submitted by {selectedApproval.submittedBy} on {selectedApproval.submittedDate}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Overall Score</p>
                  <p className="text-3xl font-bold text-primary">{selectedApproval.overallScore}</p>
                </div>
                <Badge className={cn(
                  "text-sm py-1 px-3",
                  selectedApproval.overallScore >= 4 ? "bg-success/10 text-success" :
                  selectedApproval.overallScore >= 3 ? "bg-warning/10 text-warning-foreground" :
                  "bg-destructive/10 text-destructive"
                )}>
                  {selectedApproval.overallScore >= 5 ? "Excellent" :
                   selectedApproval.overallScore >= 4 ? "Good" :
                   selectedApproval.overallScore >= 3 ? "Satisfactory" : "Needs Improvement"}
                </Badge>
              </div>
            </div>

            {/* Section Totals */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Section Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-5">
                  {selectedApproval.sections.map((section) => (
                    <div key={section.name} className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                      <p className="text-xs text-muted-foreground">{section.name}</p>
                      <p className="text-lg font-bold text-foreground mt-1">{section.score}</p>
                      <p className="text-[10px] text-muted-foreground">Weight: {section.weight}%</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* KPI Detail Table */}
            {selectedApproval.kpis.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">KPI Breakdown</CardTitle>
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
                      {selectedApproval.kpis.map((kpi, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium text-foreground">{kpi.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{kpi.area}</TableCell>
                          <TableCell className="text-center tabular-nums text-muted-foreground">{kpi.target}</TableCell>
                          <TableCell className="text-center tabular-nums font-medium text-foreground">{kpi.actual}</TableCell>
                          <TableCell className="text-center">
                            <span className={cn(
                              "text-sm font-mono tabular-nums",
                              kpi.variance >= 0 ? "text-success" : kpi.variance >= -10 ? "text-warning-foreground" : "text-destructive"
                            )}>
                              {kpi.variance >= 0 ? "+" : ""}{kpi.variance.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={cn(
                              "font-mono tabular-nums",
                              kpi.rawScore >= 5 ? "bg-success/10 text-success" :
                              kpi.rawScore >= 3 ? "bg-warning/10 text-warning-foreground" :
                              "bg-destructive/10 text-destructive"
                            )}>
                              {kpi.rawScore}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center tabular-nums text-muted-foreground">{kpi.weight}</TableCell>
                          <TableCell className="text-center font-semibold tabular-nums text-foreground">{kpi.weighted}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Comment & Decision */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Review Decision</CardTitle>
                <CardDescription>Provide your review comments and decision below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Comments</Label>
                  <Textarea
                    placeholder="Enter your review comments, observations, and recommendations..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <Separator />
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button variant="outline" className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5">
                    <XCircle className="size-4" />
                    Reject Submission
                  </Button>
                  <Button className="gap-2 bg-success text-success-foreground hover:bg-success/90">
                    <CheckCircle2 className="size-4" />
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
      <Header title="Approvals" />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-6">
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="size-3.5" />
                Pending ({pendingApprovals.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2">
                <CheckCircle2 className="size-3.5" />
                Completed ({completedApprovals.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6 space-y-4">
              {pendingApprovals.map((approval) => (
                <Card
                  key={approval.id}
                  className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
                  onClick={() => setSelectedApproval(approval)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="size-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{approval.entity}</h3>
                          <p className="text-sm text-muted-foreground">
                            {approval.quarter} {approval.period} -- {approval.kpiCount} KPIs -- Submitted {approval.submittedDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-muted-foreground">Score</p>
                          <p className="text-xl font-bold text-primary">{approval.overallScore}</p>
                        </div>
                        <Badge className="bg-warning/10 text-warning-foreground">
                          Pending Review
                        </Badge>
                        <ChevronRight className="size-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              <Card>
                <CardContent className="px-0 pb-0 pt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entity</TableHead>
                        <TableHead>Quarter</TableHead>
                        <TableHead>Decision</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                        <TableHead>Decided By</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedApprovals.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium text-foreground">{item.entity}</TableCell>
                          <TableCell className="text-muted-foreground">{item.quarter}</TableCell>
                          <TableCell>
                            <Badge className={cn(
                              "text-xs",
                              item.decision === "Approved" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                            )}>
                              {item.decision}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold tabular-nums text-foreground">{item.score}</TableCell>
                          <TableCell className="text-muted-foreground">{item.decidedBy}</TableCell>
                          <TableCell className="text-muted-foreground">{item.date}</TableCell>
                        </TableRow>
                      ))}
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
