"use client"

import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  FileText,
  Calendar,
  User2,
  Building2,
  Download,
  Printer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const contractMeta = {
  id: "C-001",
  entity: "Ministry of Finance",
  mandate: "To manage and regulate public finances of the Republic of Zimbabwe.",
  vision: "A fiscally sustainable Zimbabwe with efficient public financial management.",
  mission: "To ensure prudent fiscal management, optimal revenue collection, and transparent public expenditure.",
  period: "2025/26",
  status: "Approved",
  signedDate: "2025-07-01",
  reviewer: "Dr. K. Mbeki",
}

const sections = [
  {
    name: "Outcomes",
    weight: 25,
    kpis: [
      { name: "Budget Execution Rate", unit: "%", target: 95, weight: 5, baseline: 92 },
      { name: "Revenue Collection Target", unit: "N$M", target: 850, weight: 5, baseline: 820 },
      { name: "Debt-to-GDP Ratio Management", unit: "%", target: 65, weight: 5, baseline: 68 },
      { name: "Capital Budget Absorption Rate", unit: "%", target: 80, weight: 5, baseline: 72 },
      { name: "Fiscal Balance Achievement", unit: "N$M", target: -15, weight: 5, baseline: -22 },
    ],
  },
  {
    name: "Outputs",
    weight: 25,
    kpis: [
      { name: "Legislative Bills Processed", unit: "#", target: 12, weight: 4, baseline: 10 },
      { name: "Policy Documents Developed", unit: "#", target: 8, weight: 4, baseline: 6 },
      { name: "Project Completion Rate", unit: "%", target: 90, weight: 5, baseline: 85 },
      { name: "Budget Review Reports", unit: "#", target: 4, weight: 4, baseline: 4 },
      { name: "Tax Reform Initiatives", unit: "#", target: 3, weight: 4, baseline: 2 },
      { name: "Procurement Compliance Rate", unit: "%", target: 95, weight: 4, baseline: 88 },
    ],
  },
  {
    name: "Service Delivery",
    weight: 20,
    kpis: [
      { name: "Service Delivery Index", unit: "idx", target: 4.5, weight: 5, baseline: 4.2 },
      { name: "Citizen Satisfaction Index", unit: "idx", target: 4.0, weight: 4, baseline: 3.8 },
      { name: "Turnaround Time (Payments)", unit: "days", target: 14, weight: 5, baseline: 18 },
      { name: "Digital Service Adoption", unit: "%", target: 60, weight: 3, baseline: 45 },
      { name: "Complaint Resolution Rate", unit: "%", target: 90, weight: 3, baseline: 82 },
    ],
  },
  {
    name: "Management",
    weight: 15,
    kpis: [
      { name: "Staff Training Completion", unit: "%", target: 90, weight: 3, baseline: 85 },
      { name: "ICT Systems Uptime", unit: "%", target: 99.5, weight: 3, baseline: 98.2 },
      { name: "Vacancy Fill Rate", unit: "%", target: 85, weight: 3, baseline: 78 },
      { name: "Employee Satisfaction", unit: "idx", target: 4.0, weight: 3, baseline: 3.6 },
      { name: "Leadership Development Programs", unit: "#", target: 4, weight: 3, baseline: 3 },
    ],
  },
  {
    name: "Cross-Cutting",
    weight: 15,
    kpis: [
      { name: "Audit Compliance Score", unit: "idx", target: 4.5, weight: 4, baseline: 4.0 },
      { name: "Gender Mainstreaming Score", unit: "idx", target: 4.0, weight: 3, baseline: 3.5 },
      { name: "Environmental Impact Score", unit: "idx", target: 4.0, weight: 3, baseline: 3.4 },
      { name: "Corruption Prevention Index", unit: "idx", target: 4.5, weight: 3, baseline: 4.0 },
      { name: "HIV/AIDS Workplace Response", unit: "idx", target: 4.0, weight: 2, baseline: 3.8 },
    ],
  },
]

export default function EntityContractPage() {
  const totalKpis = sections.reduce((sum, s) => sum + s.kpis.length, 0)
  const totalWeight = sections.reduce(
    (sum, s) => sum + s.kpis.reduce((ks, k) => ks + k.weight, 0),
    0
  )

  return (
    <>
      <Header title="My Contract" />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-6 max-w-5xl">
          {/* Contract header */}
          <Card className="border-primary/20">
            <CardContent className="p-5 lg:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-success/10 text-success text-xs">
                      {contractMeta.status}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground">
                      {contractMeta.id}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-foreground text-balance">
                    Performance Contract - {contractMeta.entity}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                    {contractMeta.mandate}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Printer className="size-3.5" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="size-3.5" />
                    Export PDF
                  </Button>
                </div>
              </div>

              <Separator className="my-5" />

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <Building2 className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Entity</p>
                    <p className="text-sm font-medium text-foreground">{contractMeta.entity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <Calendar className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Period</p>
                    <p className="text-sm font-medium text-foreground">FY {contractMeta.period}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <User2 className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Reviewer</p>
                    <p className="text-sm font-medium text-foreground">{contractMeta.reviewer}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <FileText className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total KPIs</p>
                    <p className="text-sm font-medium text-foreground">{totalKpis} indicators</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vision / Mission */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed">{contractMeta.vision}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed">{contractMeta.mission}</p>
              </CardContent>
            </Card>
          </div>

          {/* KPI Sections */}
          {sections.map((section) => {
            const sectionWeight = section.kpis.reduce((s, k) => s + k.weight, 0)
            return (
              <Card key={section.name}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-foreground">
                      {section.name}
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {section.kpis.length} KPIs
                      </span>
                      <Badge variant="secondary" className="tabular-nums text-xs">
                        Weight: {section.weight}%
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    Sum of individual KPI weights: {sectionWeight}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[200px]">KPI Name</TableHead>
                          <TableHead className="text-center">Unit</TableHead>
                          <TableHead className="text-center">Baseline</TableHead>
                          <TableHead className="text-center">Target</TableHead>
                          <TableHead className="text-center">Weight</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {section.kpis.map((kpi) => (
                          <TableRow key={kpi.name}>
                            <TableCell className="font-medium text-foreground">
                              {kpi.name}
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground text-xs">
                              {kpi.unit}
                            </TableCell>
                            <TableCell className="text-center tabular-nums text-muted-foreground">
                              {kpi.baseline}
                            </TableCell>
                            <TableCell className="text-center tabular-nums font-semibold text-foreground">
                              {kpi.target}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" className="tabular-nums text-xs">
                                {kpi.weight}
                              </Badge>
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

          {/* Summary */}
          <Card className="border-primary/20 bg-primary/[0.02]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Contract Summary</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {totalKpis} KPIs across {sections.length} performance areas, total weight: {totalWeight}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Signed: {contractMeta.signedDate}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
