"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Download,
  Printer,
  ArrowLeft,
  BarChart3,
  Eye,
  FileText,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"

const entityName = "Ministry of Finance"

const availableReports = [
  { period: "2025/26", score: 4.6, rating: "Excellent", status: "Final", date: "2026-06-30" },
  { period: "2024/25", score: 4.2, rating: "Good", status: "Final", date: "2025-06-30" },
  { period: "2023/24", score: 3.9, rating: "Satisfactory", status: "Final", date: "2024-06-30" },
]

const reportData = {
  period: "2025/26",
  overallScore: 4.6,
  rating: "Excellent",
  preparedBy: "John Moyo, M&E Consultant",
  approvedBy: "Dr. K. Mbeki, CEO",
  date: "2026-06-30",
  executiveSummary:
    "The Ministry of Finance has demonstrated exceptional performance during the 2025/26 financial year, achieving an overall weighted performance score of 4.6 out of 6.0, placing the entity in the 'Excellent' rating category. The Ministry excelled particularly in Budget Execution (achieving 97% of target) and Revenue Collection (exceeding target by 2%). Service delivery metrics showed consistent improvement across all quarters.",
  quarterlyTrend: [
    { quarter: "Q1", score: 4.5 },
    { quarter: "Q2", score: 4.6 },
    { quarter: "Q3", score: 4.7 },
    { quarter: "Q4", score: 4.6 },
  ],
  sections: [
    {
      name: "Outcomes",
      weight: 25,
      score: 4.8,
      weighted: 1.2,
      kpis: [
        { name: "Budget Execution Rate", target: "95%", actual: "97%", score: 6, weighted: 30 },
        { name: "Revenue Collection Target", target: "N$850M", actual: "N$867M", score: 6, weighted: 30 },
        { name: "Debt-to-GDP Ratio Management", target: "65%", actual: "63%", score: 6, weighted: 30 },
      ],
    },
    {
      name: "Outputs",
      weight: 25,
      score: 4.4,
      weighted: 1.1,
      kpis: [
        { name: "Legislative Bills Processed", target: "12", actual: "11", score: 4, weighted: 16 },
        { name: "Policy Documents Developed", target: "8", actual: "8", score: 6, weighted: 24 },
        { name: "Project Completion Rate", target: "90%", actual: "88%", score: 5, weighted: 25 },
      ],
    },
    {
      name: "Service Delivery",
      weight: 20,
      score: 4.5,
      weighted: 0.9,
      kpis: [
        { name: "Service Delivery Index", target: "4.5", actual: "4.4", score: 5, weighted: 25 },
        { name: "Citizen Satisfaction Index", target: "4.0", actual: "4.2", score: 6, weighted: 24 },
      ],
    },
    {
      name: "Management",
      weight: 15,
      score: 4.7,
      weighted: 0.705,
      kpis: [
        { name: "Staff Training Completion", target: "90%", actual: "95%", score: 6, weighted: 18 },
        { name: "ICT Systems Uptime", target: "99.5%", actual: "99.8%", score: 6, weighted: 18 },
      ],
    },
    {
      name: "Cross-Cutting",
      weight: 15,
      score: 4.5,
      weighted: 0.675,
      kpis: [
        { name: "Audit Compliance Score", target: "4.5", actual: "4.3", score: 5, weighted: 20 },
        { name: "Gender Mainstreaming Score", target: "4.0", actual: "4.2", score: 6, weighted: 18 },
      ],
    },
  ],
  recommendations: [
    "Continue the strong fiscal management practices that led to exceptional budget execution rates.",
    "Develop a targeted action plan to accelerate legislative bill processing timelines.",
    "Invest in expanding digital citizen engagement channels to further improve satisfaction indices.",
    "Maintain the exemplary staff training programs and consider sharing best practices.",
  ],
}

export default function EntityReportsPage() {
  const [viewing, setViewing] = useState(false)

  if (viewing) {
    return (
      <>
        <Header title="My Performance Report" />
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                className="gap-2 text-muted-foreground -ml-2"
                onClick={() => setViewing(false)}
              >
                <ArrowLeft className="size-4" />
                Back to Reports
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Printer className="size-3.5" />
                  Print
                </Button>
                <Button size="sm" className="gap-2">
                  <Download className="size-3.5" />
                  Download PDF
                </Button>
              </div>
            </div>

            {/* Report title card */}
            <Card className="border-primary/20">
              <CardContent className="p-6 lg:p-8 text-center space-y-3">
                <Badge className="bg-primary/10 text-primary text-xs">
                  Annual Performance Evaluation Report
                </Badge>
                <h1 className="text-2xl font-bold text-foreground text-balance">
                  {entityName}
                </h1>
                <p className="text-muted-foreground">Financial Year {reportData.period}</p>
                <Separator className="my-4" />
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                  <span>Prepared by: {reportData.preparedBy}</span>
                  <span>Approved by: {reportData.approvedBy}</span>
                  <span>Date: {reportData.date}</span>
                </div>
              </CardContent>
            </Card>

            {/* Overall Rating */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Overall Performance Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="flex size-28 items-center justify-center rounded-full border-4 border-success/30 bg-success/5">
                    <div className="text-center">
                      <span className="text-3xl font-bold text-success">{reportData.overallScore}</span>
                      <span className="block text-xs text-muted-foreground">/ 6.00</span>
                    </div>
                  </div>
                  <Badge className="bg-success/10 text-success text-sm py-1 px-4">
                    {reportData.rating}
                  </Badge>
                </div>

                {/* Section summary table */}
                <Table className="mt-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Performance Area</TableHead>
                      <TableHead className="text-center">Weight (%)</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead className="text-center">Weighted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.sections.map((s) => (
                      <TableRow key={s.name}>
                        <TableCell className="font-medium text-foreground">{s.name}</TableCell>
                        <TableCell className="text-center tabular-nums text-muted-foreground">{s.weight}%</TableCell>
                        <TableCell className="text-center font-semibold tabular-nums text-foreground">{s.score}</TableCell>
                        <TableCell className="text-center font-semibold tabular-nums text-foreground">{s.weighted.toFixed(3)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell className="text-foreground">Overall</TableCell>
                      <TableCell className="text-center tabular-nums text-foreground">100%</TableCell>
                      <TableCell className="text-center tabular-nums text-primary">{reportData.overallScore}</TableCell>
                      <TableCell className="text-center tabular-nums text-primary">
                        {reportData.sections.reduce((s, sec) => s + sec.weighted, 0).toFixed(3)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Quarterly Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quarterly Score Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {reportData.quarterlyTrend.map((q) => (
                    <div key={q.quarter} className="text-center space-y-2">
                      <p className="text-sm font-semibold text-foreground">{q.quarter}</p>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-full bg-muted rounded-full overflow-hidden h-24 relative flex items-end">
                          <div
                            className="w-full bg-primary/80 rounded-t-md transition-all"
                            style={{ height: `${(q.score / 6) * 100}%` }}
                          />
                        </div>
                        <span className="text-lg font-bold tabular-nums text-foreground">{q.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Executive Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {reportData.executiveSummary}
                </p>
              </CardContent>
            </Card>

            {/* Detailed Sections */}
            {reportData.sections.map((section) => (
              <Card key={section.name}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{section.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Weight: {section.weight}%</span>
                      <Badge
                        className={cn(
                          "font-semibold tabular-nums",
                          section.score >= 4.5
                            ? "bg-success/10 text-success"
                            : section.score >= 3.5
                            ? "bg-primary/10 text-primary"
                            : "bg-warning/10 text-warning-foreground"
                        )}
                      >
                        {section.score}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>KPI</TableHead>
                        <TableHead className="text-center">Target</TableHead>
                        <TableHead className="text-center">Actual</TableHead>
                        <TableHead className="text-center">Score</TableHead>
                        <TableHead className="text-center">Weighted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {section.kpis.map((kpi) => (
                        <TableRow key={kpi.name}>
                          <TableCell className="font-medium text-foreground">{kpi.name}</TableCell>
                          <TableCell className="text-center tabular-nums text-muted-foreground">{kpi.target}</TableCell>
                          <TableCell className="text-center tabular-nums font-medium text-foreground">{kpi.actual}</TableCell>
                          <TableCell className="text-center">
                            <Badge
                              className={cn(
                                "tabular-nums",
                                kpi.score >= 5
                                  ? "bg-success/10 text-success"
                                  : kpi.score >= 3
                                  ? "bg-warning/10 text-warning-foreground"
                                  : "bg-destructive/10 text-destructive"
                              )}
                            >
                              {kpi.score}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-semibold tabular-nums text-foreground">
                            {kpi.weighted}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2">
                  {reportData.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-muted-foreground leading-relaxed">
                      {rec}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header title="My Reports" />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-6">
          {/* Performance trend overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Performance History</CardTitle>
              <CardDescription>
                Your annual performance evaluation reports across financial years.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-6">
                {availableReports.map((r) => (
                  <div key={r.period} className="flex-1 text-center space-y-2">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-full max-w-[80px] mx-auto bg-muted rounded-lg overflow-hidden h-32 relative flex items-end">
                        <div
                          className={cn(
                            "w-full rounded-t-md transition-all",
                            r.score >= 4.5
                              ? "bg-success"
                              : r.score >= 3.5
                              ? "bg-primary"
                              : "bg-warning"
                          )}
                          style={{ height: `${(r.score / 6) * 100}%` }}
                        />
                      </div>
                      <div>
                        <p className="text-lg font-bold tabular-nums text-foreground">{r.score}</p>
                        <p className="text-xs text-muted-foreground">FY {r.period}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reports list */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Available Reports</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableReports.map((report) => (
                    <TableRow key={report.period}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                            <FileText className="size-4 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">FY {report.period}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold tabular-nums text-foreground">
                        {report.score}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "text-xs",
                            report.score >= 4.5
                              ? "bg-success/10 text-success"
                              : report.score >= 3.5
                              ? "bg-primary/10 text-primary"
                              : "bg-warning/10 text-warning-foreground"
                          )}
                        >
                          {report.rating}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{report.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{report.date}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setViewing(true)}
                          >
                            <Eye className="size-3.5" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Download className="size-3.5" />
                            PDF
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
