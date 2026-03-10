"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Button } from "@/components/ui/button"
import { Search, Shield, Loader2, RefreshCw } from "lucide-react"
import { getAuditLogs, type AuditLogEntry } from "@/lib/api"
import { cn } from "@/lib/utils"

const actionColors: Record<string, string> = {
  "Submission Created": "bg-primary/10 text-primary",
  "Submission Approved": "bg-success/10 text-success",
  "Submission Rejected": "bg-destructive/10 text-destructive",
  "User Created": "bg-chart-2/10 text-chart-2",
  "Password Changed": "bg-warning/10 text-warning-foreground",
}

function getActionColor(action: string): string {
  if (actionColors[action]) return actionColors[action]
  if (action.toLowerCase().includes("approved") || action.toLowerCase().includes("created"))
    return "bg-success/10 text-success"
  if (action.toLowerCase().includes("rejected") || action.toLowerCase().includes("deleted"))
    return "bg-destructive/10 text-destructive"
  if (action.toLowerCase().includes("updated") || action.toLowerCase().includes("changed"))
    return "bg-warning/10 text-warning-foreground"
  return "bg-primary/10 text-primary"
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [refreshing, setRefreshing] = useState(false)

  const fetchLogs = useCallback(async () => {
    try {
      const params: { search?: string; action?: string } = {}
      if (search.trim()) params.search = search.trim()
      if (actionFilter !== "all") params.action = actionFilter
      const data = await getAuditLogs(params)
      setLogs(data)
    } catch (err) {
      console.error("Failed to load audit logs:", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [search, actionFilter])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  // Debounced search — refetch when search changes
  useEffect(() => {
    const timer = setTimeout(() => { fetchLogs() }, 400)
    return () => clearTimeout(timer)
  }, [search, actionFilter, fetchLogs])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchLogs()
  }

  // Extract unique actions for filter dropdown
  const uniqueActions = [...new Set(logs.map((l) => l.action))].sort()

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
                placeholder="Search by user, action, or details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-8"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-52 h-9">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>

          {/* Audit Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">
                Activity Log ({logs.length} records)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading audit logs...</span>
                </div>
              ) : logs.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No audit log entries found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString("en-GB", {
                            year: "numeric", month: "short", day: "2-digit",
                            hour: "2-digit", minute: "2-digit", second: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="font-medium text-foreground whitespace-nowrap">
                          {log.user}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px]">{log.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs", getActionColor(log.action))}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {log.target}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-md truncate">
                          {log.details}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
