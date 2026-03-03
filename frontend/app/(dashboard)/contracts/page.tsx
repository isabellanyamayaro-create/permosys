"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, FileText, Send, Eye, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const contracts = [
  { id: "C-001", entity: "Ministry of Finance", period: "2025/26", status: "Approved", kpis: 18, score: 4.6, reviewer: "Dr. K. Mbeki" },
  { id: "C-002", entity: "Ministry of Health", period: "2025/26", status: "Under Review", kpis: 22, score: 4.3, reviewer: "Dr. K. Mbeki" },
  { id: "C-003", entity: "Ministry of Education", period: "2025/26", status: "Submitted", kpis: 20, score: null, reviewer: "Dr. K. Mbeki" },
  { id: "C-004", entity: "Ministry of Transport", period: "2025/26", status: "Draft", kpis: 16, score: null, reviewer: "Prof. T. Nkosi" },
  { id: "C-005", entity: "Ministry of Agriculture", period: "2025/26", status: "Sent", kpis: 19, score: null, reviewer: "Prof. T. Nkosi" },
  { id: "C-006", entity: "Ministry of Environment", period: "2025/26", status: "Rejected", kpis: 15, score: 2.8, reviewer: "Dr. K. Mbeki" },
  { id: "C-007", entity: "Ministry of Trade", period: "2025/26", status: "Locked", kpis: 17, score: 4.1, reviewer: "Prof. T. Nkosi" },
]

const statusConfig: Record<string, { color: string; bgColor: string }> = {
  Draft: { color: "text-muted-foreground", bgColor: "bg-muted" },
  Sent: { color: "text-primary", bgColor: "bg-primary/10" },
  Submitted: { color: "text-chart-2", bgColor: "bg-chart-2/10" },
  "Under Review": { color: "text-warning-foreground", bgColor: "bg-warning/10" },
  Approved: { color: "text-success", bgColor: "bg-success/10" },
  Rejected: { color: "text-destructive", bgColor: "bg-destructive/10" },
  Locked: { color: "text-foreground", bgColor: "bg-secondary" },
}

const kpiOptions = [
  { name: "Budget Execution Rate", area: "Outcomes", unit: "Percentage", defaultWeight: 5 },
  { name: "Revenue Collection Target", area: "Outcomes", unit: "Amount", defaultWeight: 5 },
  { name: "Service Delivery Index", area: "Service Delivery", unit: "Index", defaultWeight: 4 },
  { name: "Staff Training Completion", area: "Management", unit: "Percentage", defaultWeight: 3 },
  { name: "Audit Compliance Score", area: "Cross-Cutting", unit: "Index", defaultWeight: 4 },
  { name: "Project Completion Rate", area: "Outputs", unit: "Percentage", defaultWeight: 5 },
  { name: "Citizen Satisfaction Index", area: "Service Delivery", unit: "Index", defaultWeight: 4 },
  { name: "Gender Mainstreaming Score", area: "Cross-Cutting", unit: "Index", defaultWeight: 3 },
]

export default function ContractsPage() {
  const [filter, setFilter] = useState("all")
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedKpis, setSelectedKpis] = useState<number[]>([])

  const filteredContracts = filter === "all"
    ? contracts
    : contracts.filter((c) => c.status === filter)

  const toggleKpi = (index: number) => {
    setSelectedKpis((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    )
  }

  return (
    <>
      <Header title="Contracts" />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-6">
          {/* Toolbar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-44 h-9">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Locked">Locked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="size-4" />
                  New Contract
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Performance Contract</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-2">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Entity</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select entity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="finance">Ministry of Finance</SelectItem>
                          <SelectItem value="health">Ministry of Health</SelectItem>
                          <SelectItem value="education">Ministry of Education</SelectItem>
                          <SelectItem value="transport">Ministry of Transport</SelectItem>
                          <SelectItem value="agriculture">Ministry of Agriculture</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Reporting Period</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2025-26">2025/26</SelectItem>
                          <SelectItem value="2026-27">2026/27</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Reviewer</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign reviewer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mbeki">Dr. K. Mbeki</SelectItem>
                          <SelectItem value="nkosi">Prof. T. Nkosi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea placeholder="Optional contract notes..." className="h-9 resize-none" />
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block">Assign KPIs</Label>
                    <Card>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-8"></TableHead>
                            <TableHead>KPI Name</TableHead>
                            <TableHead>Performance Area</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead className="text-right">Weight</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {kpiOptions.map((kpi, index) => (
                            <TableRow
                              key={kpi.name}
                              className={cn(
                                "cursor-pointer transition-colors",
                                selectedKpis.includes(index) && "bg-primary/5"
                              )}
                              onClick={() => toggleKpi(index)}
                            >
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={selectedKpis.includes(index)}
                                  onChange={() => toggleKpi(index)}
                                  className="size-4 rounded border-input accent-primary"
                                />
                              </TableCell>
                              <TableCell className="font-medium text-foreground">{kpi.name}</TableCell>
                              <TableCell className="text-muted-foreground">{kpi.area}</TableCell>
                              <TableCell className="text-muted-foreground">{kpi.unit}</TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  defaultValue={kpi.defaultWeight}
                                  className="h-7 w-16 text-right ml-auto"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {selectedKpis.length} KPIs selected. Total weight must equal 100%.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setCreateOpen(false)}>
                      Save as Draft
                    </Button>
                    <Button className="gap-2">
                      <Send className="size-4" />
                      Send Contract
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Contracts Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">
                Performance Contracts ({filteredContracts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract ID</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">KPIs</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead>Reviewer</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract) => {
                    const cfg = statusConfig[contract.status] || statusConfig.Draft
                    return (
                      <TableRow key={contract.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {contract.id}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {contract.entity}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {contract.period}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("font-medium text-xs", cfg.bgColor, cfg.color)}>
                            {contract.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center tabular-nums text-muted-foreground">
                          {contract.kpis}
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums text-foreground">
                          {contract.score ? contract.score.toFixed(1) : "---"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {contract.reviewer}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-7">
                                <MoreHorizontal className="size-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2">
                                <Eye className="size-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <FileText className="size-4" /> Generate Report
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
