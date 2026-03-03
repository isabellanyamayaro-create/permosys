"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { CheckCircle2, XCircle, Search, Filter, Eye, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getReviewed, type Submission } from "@/lib/api"

export default function CEOReviewedPage() {
  const [data, setData]                   = useState<Submission[]>([])
  const [loading, setLoading]             = useState(true)
  const [searchQuery, setSearchQuery]     = useState("")
  const [statusFilter, setStatusFilter]   = useState("all")
  const [selected, setSelected]           = useState<Submission | null>(null)

  useEffect(() => {
    getReviewed()
      .then((d) => setData(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = data.filter((c) => {
    const matchSearch = c.entity_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === "all" || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const approvedCount = data.filter((c) => c.status === "Approved").length
  const rejectedCount = data.filter((c) => c.status === "Rejected").length
  const avgScore = data.length
    ? (data.reduce((s, c) => s + c.overall_score, 0) / data.length).toFixed(2)
    : "—"

  return (
    <>
      <Header title="Reviewed Contracts" />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-6">

          {/* Summary Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-success/10">
                  <CheckCircle2 className="size-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold tabular-nums">{loading ? "—" : approvedCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
                  <XCircle className="size-5 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold tabular-nums">{loading ? "—" : rejectedCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <span className="text-sm font-bold text-primary">AVG</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg. Final Score</p>
                  <p className="text-2xl font-bold tabular-nums">{loading ? "—" : avgScore}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by entity name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="px-0 pb-0 pt-0">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entity</TableHead>
                      <TableHead>Quarter</TableHead>
                      <TableHead className="text-center">Final Score</TableHead>
                      <TableHead>Review Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reviewed By</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.entity_name}</TableCell>
                        <TableCell className="text-muted-foreground">{c.quarter} {c.period}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={cn(
                            "font-semibold tabular-nums",
                            c.overall_score >= 4 ? "bg-success/10 text-success" :
                            c.overall_score >= 3 ? "bg-warning/10 text-warning-foreground" :
                            "bg-destructive/10 text-destructive"
                          )}>{c.overall_score.toFixed(2)}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{c.review_date ?? "—"}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-xs",
                            c.status === "Approved"
                              ? "bg-success/10 text-success"
                              : "bg-destructive/10 text-destructive"
                          )}>
                            {c.status === "Approved" && <CheckCircle2 className="mr-1 size-3" />}
                            {c.status === "Rejected" && <XCircle className="mr-1 size-3" />}
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{c.reviewed_by || "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost" size="sm"
                            className="gap-1.5 text-primary"
                            onClick={() => setSelected(c)}
                          >
                            <Eye className="size-3.5" /> View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                          No reviewed contracts found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.entity_name}</DialogTitle>
            <DialogDescription>{selected?.quarter} {selected?.period}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Final Score</p>
                  <p className="text-2xl font-bold tabular-nums">{selected.overall_score.toFixed(2)}</p>
                </div>
                <Badge className={cn(
                  "text-sm py-1 px-3",
                  selected.status === "Approved"
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive"
                )}>{selected.status}</Badge>
              </div>
              <Separator />
              {selected.sections.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Section Breakdown</p>
                  <div className="space-y-2">
                    {selected.sections.map((s) => (
                      <div key={s.name} className="flex items-center justify-between">
                        <span className="text-sm">{s.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">({s.weight}%)</span>
                          <span className={cn(
                            "text-sm font-semibold tabular-nums w-8 text-right",
                            s.score >= 4 ? "text-success" :
                            s.score >= 3 ? "text-warning-foreground" : "text-destructive"
                          )}>{s.score.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selected.ceo_comment && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">CEO Comments</p>
                    <p className="text-sm leading-relaxed">{selected.ceo_comment}</p>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                <span>Reviewed by {selected.reviewed_by || "—"}</span>
                <span>{selected.review_date ?? "—"}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
