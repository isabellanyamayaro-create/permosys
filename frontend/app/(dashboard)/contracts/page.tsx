"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Send, Eye, MoreHorizontal, Loader2, Save } from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  getContracts, createContract, getEntities, getUsers, getKpiDefinitions,
  type Contract, type Entity, type PmsUser, type KpiDefinition,
} from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

const statusConfig: Record<string, { color: string; bgColor: string }> = {
  Active: { color: "text-success", bgColor: "bg-success/10" },
  "Pending Signature": { color: "text-warning-foreground", bgColor: "bg-warning/10" },
  Expired: { color: "text-muted-foreground", bgColor: "bg-muted" },
}

interface CreateFormData {
  entity: string
  period: string
  reviewer: string
  status: string
}

const emptyForm: CreateFormData = { entity: "", period: "2025/26", reviewer: "", status: "Active" }

export default function ContractsPage() {
  const { user } = useAuth()
  const canCreate = user?.role === "admin" || user?.role === "me"

  const [contracts, setContracts] = useState<Contract[]>([])
  const [entities, setEntities] = useState<Entity[]>([])
  const [reviewers, setReviewers] = useState<PmsUser[]>([])
  const [kpiDefs, setKpiDefs] = useState<KpiDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  // Create modal
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState<CreateFormData>(emptyForm)
  const [selectedKpis, setSelectedKpis] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  // Detail modal
  const [viewingContract, setViewingContract] = useState<Contract | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [c, e, u, k] = await Promise.all([
        getContracts(), getEntities(), getUsers(), getKpiDefinitions(),
      ])
      setContracts(c)
      setEntities(e)
      setReviewers(u.filter((usr) => usr.role === "me"))
      setKpiDefs(k)
    } catch (err) {
      console.error("Failed to load data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filteredContracts = filter === "all"
    ? contracts
    : contracts.filter((c) => c.status === filter)

  const toggleKpi = (id: number) => {
    setSelectedKpis((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const openCreate = () => {
    setForm(emptyForm)
    setSelectedKpis([])
    setFormError("")
    setCreateOpen(true)
  }

  const handleCreate = async () => {
    if (!form.entity || !form.period) {
      setFormError("Please select an entity and reporting period.")
      return
    }
    setSaving(true)
    setFormError("")
    try {
      await createContract({
        entity: parseInt(form.entity),
        period: form.period,
        status: form.status,
        total_kpis: selectedKpis.length,
        reviewer: form.reviewer,
        signed_date: null,
      })
      setCreateOpen(false)
      await fetchData()
    } catch (err: any) {
      setFormError(err.message || "Failed to create contract.")
    } finally {
      setSaving(false)
    }
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
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending Signature">Pending Signature</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {canCreate && (
              <Button className="gap-2" onClick={openCreate}>
                <Plus className="size-4" />
                New Contract
              </Button>
            )}
          </div>

          {/* Contracts Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">
                Performance Contracts ({filteredContracts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading contracts...</span>
                </div>
              ) : filteredContracts.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  {contracts.length === 0 ? "No contracts yet. Create your first performance contract." : "No contracts match the selected filter."}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">KPIs</TableHead>
                      <TableHead>Reviewer</TableHead>
                      <TableHead>Signed Date</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.map((contract) => {
                      const cfg = statusConfig[contract.status] || statusConfig.Active
                      return (
                        <TableRow key={contract.id}>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            C-{String(contract.id).padStart(3, "0")}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {contract.entity_detail?.name || `Entity #${contract.entity}`}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{contract.period}</TableCell>
                          <TableCell>
                            <Badge className={cn("font-medium text-xs", cfg.bgColor, cfg.color)}>
                              {contract.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center tabular-nums text-muted-foreground">
                            {contract.total_kpis}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {contract.reviewer || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {contract.signed_date || "—"}
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
                                <DropdownMenuItem className="gap-2" onClick={() => setViewingContract(contract)}>
                                  <Eye className="size-4" /> View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Contract Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Performance Contract</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Entity <span className="text-destructive">*</span></Label>
                <Select value={form.entity} onValueChange={(v) => setForm({ ...form, entity: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity" />
                  </SelectTrigger>
                  <SelectContent>
                    {entities.map((e) => (
                      <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reporting Period <span className="text-destructive">*</span></Label>
                <Select value={form.period} onValueChange={(v) => setForm({ ...form, period: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024/25">2024/25</SelectItem>
                    <SelectItem value="2025/26">2025/26</SelectItem>
                    <SelectItem value="2026/27">2026/27</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reviewer</Label>
                <Select value={form.reviewer} onValueChange={(v) => setForm({ ...form, reviewer: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign reviewer" />
                  </SelectTrigger>
                  <SelectContent>
                    {reviewers.map((r) => (
                      <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending Signature">Pending Signature</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* KPI Selection */}
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
                      <TableHead className="text-right">Weight (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kpiDefs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No KPIs defined. Add KPIs in the KPI Library first.
                        </TableCell>
                      </TableRow>
                    ) : (
                      kpiDefs.map((kpi) => (
                        <TableRow
                          key={kpi.id}
                          className={cn("cursor-pointer transition-colors", selectedKpis.includes(kpi.id) && "bg-primary/5")}
                          onClick={() => toggleKpi(kpi.id)}
                        >
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedKpis.includes(kpi.id)}
                              onChange={() => toggleKpi(kpi.id)}
                              className="size-4 rounded border-input accent-primary"
                            />
                          </TableCell>
                          <TableCell className="font-medium text-foreground">{kpi.name}</TableCell>
                          <TableCell className="text-muted-foreground">{kpi.area}</TableCell>
                          <TableCell className="text-muted-foreground">{kpi.unit}</TableCell>
                          <TableCell className="text-right tabular-nums">{kpi.weight}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
              <p className="mt-2 text-xs text-muted-foreground">
                {selectedKpis.length} KPIs selected.
                Total weight: {kpiDefs.filter((k) => selectedKpis.includes(k.id)).reduce((s, k) => s + k.weight, 0)}%
              </p>
            </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button className="gap-2" onClick={handleCreate} disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                Create Contract
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Contract Details Dialog */}
      <Dialog open={!!viewingContract} onOpenChange={(open) => !open && setViewingContract(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Contract Details</DialogTitle>
          </DialogHeader>
          {viewingContract && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Entity</p>
                  <p className="text-sm font-medium text-foreground">
                    {viewingContract.entity_detail?.name || `Entity #${viewingContract.entity}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Period</p>
                  <p className="text-sm font-medium text-foreground">{viewingContract.period}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={cn(
                    "text-xs mt-1",
                    (statusConfig[viewingContract.status] || statusConfig.Active).bgColor,
                    (statusConfig[viewingContract.status] || statusConfig.Active).color,
                  )}>
                    {viewingContract.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total KPIs</p>
                  <p className="text-sm font-medium text-foreground">{viewingContract.total_kpis}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Reviewer</p>
                  <p className="text-sm font-medium text-foreground">{viewingContract.reviewer || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Signed Date</p>
                  <p className="text-sm font-medium text-foreground">{viewingContract.signed_date || "—"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
