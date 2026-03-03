"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
import {
  Download,
  FileText,
  Printer,
  ArrowLeft,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"

const reportEntities = [
  { id: "finance", name: "Ministry of Finance", period: "2025/26", score: 4.6, rating: "Excellent" },
  { id: "health", name: "Ministry of Health", period: "2025/26", score: 4.3, rating: "Good" },
  { id: "education", name: "Ministry of Education", period: "2025/26", score: 4.1, rating: "Good" },
  { id: "transport", name: "Ministry of Transport", period: "2025/26", score: 3.5, rating: "Satisfactory" },
  { id: "agriculture", name: "Ministry of Agriculture", period: "2025/26", score: 3.2, rating: "Satisfactory" },
]

const reportData = {
  entity: "Ministry of Finance",
  period: "2025/26",
  overallScore: 4.6,
  rating: "Excellent",
  preparedBy: "John Moyo, M&E Consultant",
  approvedBy: "Dr. K. Mbeki, CEO",
  date: "2026-06-30",
  executiveSummary: "The Ministry of Finance has demonstrated exceptional performance during the 2025/26 financial year, achieving an overall weighted performance score of 4.6 out of 6.0, placing the entity in the 'Excellent' rating category. The Ministry excelled particularly in Budget Execution (achieving 97% of target) and Revenue Collection (exceeding target by 2%). Service delivery metrics showed consistent improvement across all quarters, with notable achievements in ICT systems uptime (99.8%) and staff training completion (95%). The Ministry maintained strong audit compliance scores and demonstrated leadership in gender mainstreaming initiatives. Areas for continued focus include accelerating legislative bill processing timelines and enhancing citizen engagement channels.",
  sections: [
    {
      name: "Outcomes",
      weight: 25,
      score: 4.8,
      weighted: 1.2,
      kpis: [
        { name: "Budget Execution Rate", target: "95%", actual: "97%", score: 6, weighted: 30 },
        { name: "Revenue Collection Target", target: "N$850M", actual: "N$867M", score: 6, weighted: 30 },
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
        { name: "Environmental Impact Score", target: "4.0", actual: "3.8", score: 5, weighted: 15 },
      ],
    },
  ],
  recommendations: [
    "Continue the strong fiscal management practices that led to exceptional budget execution rates.",
    "Develop a targeted action plan to accelerate legislative bill processing timelines in the upcoming financial year.",
    "Invest in expanding digital citizen engagement channels to further improve satisfaction indices.",
    "Maintain the exemplary staff training programs and consider sharing best practices with other ministries.",
    "Address the minor decline in environmental impact scores through enhanced sustainability initiatives.",
  ],
}

export default function ReportsPage() {
  const [viewing, setViewing] = useState(false)

  if (viewing) {
    return (
      <>
        <Header title="Performance Report" />
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
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
                <Button variant="outline" className="gap-2">
                  <Printer className="size-4" />
                  Print
                </Button>
                <Button className="gap-2">
                  <Download className="size-4" />
                  Download PDF
                </Button>
              </div>
            </div>

            {/* Report Header */}
            <Card className="border-primary/20">
              <CardContent className="p-6 lg:p-8">
                <div className="text-center space-y-3">
                  <Badge className="bg-primary/10 text-primary text-xs">
                    Annual Performance Evaluation Report
                  </Badge>
                  <h1 className="text-2xl font-bold text-foreground text-balance">
                    {reportData.entity}
                  </h1>
                  <p className="text-muted-foreground">
                    Financial Year {reportData.period}
                  </p>
                  <Separator className="my-4" />
                  <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                    <span>Prepared by: {reportData.preparedBy}</span>
                    <span>Approved by: {reportData.approvedBy}</span>
                    <span>Date: {reportData.date}</span>
                  </div>
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

                <Table className="mt-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Performance Area</TableHead>
                      <TableHead className="text-center">Weight (%)</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead className="text-center">Weighted Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.sections.map((section) => (
                      <TableRow key={section.name}>
                        <TableCell className="font-medium text-foreground">{section.name}</TableCell>
                        <TableCell className="text-center tabular-nums text-muted-foreground">{section.weight}%</TableCell>
                        <TableCell className="text-center font-semibold tabular-nums text-foreground">{section.score}</TableCell>
                        <TableCell className="text-center font-semibold tabular-nums text-foreground">{section.weighted.toFixed(3)}</TableCell>
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

            {/* Detailed KPI Breakdown by Section */}
            {reportData.sections.map((section) => (
              <Card key={section.name}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{section.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Weight: {section.weight}%</span>
                      <Badge className={cn(
                        "font-semibold tabular-nums",
                        section.score >= 4.5 ? "bg-success/10 text-success" :
                        section.score >= 3.5 ? "bg-primary/10 text-primary" :
                        "bg-warning/10 text-warning-foreground"
                      )}>
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
                            <Badge className={cn(
                              "tabular-nums",
                              kpi.score >= 5 ? "bg-success/10 text-success" :
                              kpi.score >= 3 ? "bg-warning/10 text-warning-foreground" :
                              "bg-destructive/10 text-destructive"
                            )}>
                              {kpi.score}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-semibold tabular-nums text-foreground">{kpi.weighted}</TableCell>
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
      <Header title="Reports" />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-6">
          {/* Generation controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Generate Report</CardTitle>
              <CardDescription>Select an entity and period to generate or view a performance evaluation report.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Entity</label>
                  <Select>
                    <SelectTrigger className="w-56 h-9">
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportEntities.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Period</label>
                  <Select>
                    <SelectTrigger className="w-40 h-9">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025-26">2025/26</SelectItem>
                      <SelectItem value="2024-25">2024/25</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="gap-2">
                  <BarChart3 className="size-4" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Available Reports */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Available Reports</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportEntities.map((entity) => (
                    <TableRow key={entity.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                            <FileText className="size-4 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{entity.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{entity.period}</TableCell>
                      <TableCell className="text-center font-bold tabular-nums text-foreground">{entity.score}</TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "text-xs",
                          entity.score >= 4.5 ? "bg-success/10 text-success" :
                          entity.score >= 3.5 ? "bg-primary/10 text-primary" :
                          entity.score >= 3 ? "bg-warning/10 text-warning-foreground" :
                          "bg-destructive/10 text-destructive"
                        )}>
                          {entity.rating}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setViewing(true)}
                          >
                            <FileText className="size-3.5" />
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
