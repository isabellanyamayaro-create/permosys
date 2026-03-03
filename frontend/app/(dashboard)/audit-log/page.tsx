"use client"

import { useState } from "react"
import { Header } from "@/components/header"
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
import { Search, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

const auditLogs = [
  { id: 1, timestamp: "2026-03-02 14:32:15", user: "John Moyo", action: "Created", resource: "Contract C-004", details: "Created new performance contract for Ministry of Transport", category: "Contract" },
  { id: 2, timestamp: "2026-03-02 13:15:42", user: "Dr. K. Mbeki", action: "Approved", resource: "Submission A-001", details: "Approved Q2 submission for Ministry of Health with score 4.3", category: "Approval" },
  { id: 3, timestamp: "2026-03-01 16:45:30", user: "M. Shikongo", action: "Submitted", resource: "Quarterly Q2", details: "Submitted Q2 actuals for Ministry of Health (10 KPIs)", category: "Submission" },
  { id: 4, timestamp: "2026-03-01 11:20:08", user: "John Moyo", action: "Updated", resource: "KPI #5", details: "Modified Service Delivery Index variance rule from 0.5 to 0.3", category: "KPI" },
  { id: 5, timestamp: "2026-02-28 09:10:55", user: "Prof. T. Nkosi", action: "Rejected", resource: "Submission A-003", details: "Rejected Q1 submission for Ministry of Transport - insufficient evidence", category: "Approval" },
  { id: 6, timestamp: "2026-02-27 15:30:22", user: "L. Amupanda", action: "Submitted", resource: "Quarterly Q1", details: "Submitted Q1 actuals for Ministry of Education (8 KPIs)", category: "Submission" },
  { id: 7, timestamp: "2026-02-26 10:45:18", user: "John Moyo", action: "Generated", resource: "Report R-001", details: "Generated Annual Performance Report for Ministry of Finance 2025/26", category: "Report" },
  { id: 8, timestamp: "2026-02-25 08:00:00", user: "System", action: "Sent", resource: "Reminder", details: "Automated deadline reminder sent to 5 entities for Q3 submissions", category: "System" },
  { id: 9, timestamp: "2026-02-24 14:22:33", user: "John Moyo", action: "Created", resource: "KPI #12", details: "Added new KPI: Environmental Impact Score to Cross-Cutting area", category: "KPI" },
  { id: 10, timestamp: "2026-02-23 11:05:47", user: "Dr. K. Mbeki", action: "Locked", resource: "Contract C-001", details: "Locked Ministry of Finance contract after final approval", category: "Contract" },
  { id: 11, timestamp: "2026-02-22 16:30:12", user: "John Moyo", action: "Updated", resource: "Entity Settings", details: "Updated Ministry of Environment mandate statement", category: "Settings" },
  { id: 12, timestamp: "2026-02-21 09:15:00", user: "System", action: "Generated", resource: "Report R-002", details: "Auto-generated consolidated cross-entity performance summary", category: "Report" },
]

const actionColors: Record<string, string> = {
  Created: "bg-success/10 text-success",
  Approved: "bg-success/10 text-success",
  Submitted: "bg-primary/10 text-primary",
  Updated: "bg-warning/10 text-warning-foreground",
  Rejected: "bg-destructive/10 text-destructive",
  Generated: "bg-chart-2/10 text-chart-2",
  Sent: "bg-primary/10 text-primary",
  Locked: "bg-secondary text-secondary-foreground",
}

export default function AuditLogPage() {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const filtered = auditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.resource.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === "all" || log.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <>
      <Header title="Audit Log" />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-6">
          {/* Info banner */}
          <Card className="border-primary/20 bg-primary/[0.02]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Full Audit Trail</p>
                  <p className="text-xs text-muted-foreground">
                    Every action in the system is logged for compliance and accountability. Records cannot be modified or deleted.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by user, resource, or details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-8"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-44 h-9">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Submission">Submission</SelectItem>
                <SelectItem value="Approval">Approval</SelectItem>
                <SelectItem value="KPI">KPI</SelectItem>
                <SelectItem value="Report">Report</SelectItem>
                <SelectItem value="Settings">Settings</SelectItem>
                <SelectItem value="System">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Audit Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">
                Activity Log ({filtered.length} records)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {log.timestamp}
                      </TableCell>
                      <TableCell className="font-medium text-foreground whitespace-nowrap">
                        {log.user}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", actionColors[log.action] || "bg-secondary text-secondary-foreground")}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {log.resource}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-md truncate">
                        {log.details}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">{log.category}</Badge>
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
