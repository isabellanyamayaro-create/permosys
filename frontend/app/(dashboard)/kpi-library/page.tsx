"use client"

import { useState, useEffect, useCallback } from "react"
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2, Search, Loader2, Save } from "lucide-react"
import {
  getKpiDefinitions,
  createKpiDefinition,
  updateKpiDefinition,
  deleteKpiDefinition,
  type KpiDefinition,
} from "@/lib/api"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

const AREAS = ["Outcomes", "Outputs", "Service Delivery", "Management", "Cross-Cutting"] as const
const UNITS = ["Percentage", "Number", "Amount", "Index", "Ratio", "Days", "Score"] as const

const areaColors: Record<string, string> = {
  Outcomes: "bg-chart-1/10 text-chart-1",
  Outputs: "bg-chart-2/10 text-chart-2",
  "Service Delivery": "bg-chart-3/10 text-chart-3",
  Management: "bg-chart-4/10 text-chart-4",
  "Cross-Cutting": "bg-chart-5/10 text-chart-5",
}

interface KpiFormData {
  name: string
  area: string
  unit: string
  target: string
  weight: string
  allowable_variance: string
  prev_year_performance: string
  description: string
}

const emptyForm: KpiFormData = {
  name: "", area: "", unit: "", target: "", weight: "",
  allowable_variance: "5", prev_year_performance: "", description: "",
}

export default function KPILibraryPage() {
  const { user } = useAuth()
  const canEdit = user?.role === "admin" || user?.role === "me"

  const [kpis, setKpis] = useState<KpiDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [areaFilter, setAreaFilter] = useState("all")

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingKpi, setEditingKpi] = useState<KpiDefinition | null>(null)
  const [form, setForm] = useState<KpiFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  // Delete confirmation
  const [deletingKpi, setDeletingKpi] = useState<KpiDefinition | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchKpis = useCallback(async () => {
    try {
      const data = await getKpiDefinitions()
      setKpis(data)
    } catch (err) {
      console.error("Failed to load KPIs:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchKpis() }, [fetchKpis])

  const filtered = kpis.filter((kpi) => {
    const matchesSearch = kpi.name.toLowerCase().includes(search.toLowerCase())
    const matchesArea = areaFilter === "all" || kpi.area === areaFilter
    return matchesSearch && matchesArea
  })

  const countByArea = AREAS.reduce<Record<string, number>>((acc, area) => {
    acc[area] = kpis.filter((k) => k.area === area).length
    return acc
  }, {})

  const openAdd = () => {
    setEditingKpi(null)
    setForm(emptyForm)
    setFormError("")
    setModalOpen(true)
  }

  const openEdit = (kpi: KpiDefinition) => {
    setEditingKpi(kpi)
    setForm({
      name: kpi.name,
      area: kpi.area,
      unit: kpi.unit,
      target: String(kpi.target),
      weight: String(kpi.weight),
      allowable_variance: String(kpi.allowable_variance),
      prev_year_performance: kpi.prev_year_performance != null ? String(kpi.prev_year_performance) : "",
      description: kpi.description,
    })
    setFormError("")
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.area || !form.unit || !form.target || !form.weight) {
      setFormError("Please fill in all required fields.")
      return
    }
    setSaving(true)
    setFormError("")
    try {
      const payload = {
        name: form.name,
        area: form.area,
        unit: form.unit,
        target: parseFloat(form.target),
        weight: parseFloat(form.weight),
        allowable_variance: parseFloat(form.allowable_variance) || 5,
        prev_year_performance: form.prev_year_performance ? parseFloat(form.prev_year_performance) : null,
        description: form.description,
      }
      if (editingKpi) {
        await updateKpiDefinition(editingKpi.id, payload)
      } else {
        await createKpiDefinition(payload)
      }
      setModalOpen(false)
      await fetchKpis()
    } catch (err: any) {
      setFormError(err.message || "Failed to save KPI.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingKpi) return
    setDeleting(true)
    try {
      await deleteKpiDefinition(deletingKpi.id)
      setDeletingKpi(null)
      await fetchKpis()
    } catch (err) {
      console.error("Failed to delete KPI:", err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Header title="KPI Library" />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-6">
          {/* Area summary cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {AREAS.map((area) => (
              <Card
                key={area}
                className={cn(
                  "cursor-pointer transition-shadow hover:shadow-md",
                  areaFilter === area && "ring-2 ring-primary"
                )}
                onClick={() => setAreaFilter(areaFilter === area ? "all" : area)}
              >
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{area}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{countByArea[area] ?? 0}</p>
                  <p className="text-xs text-muted-foreground">indicators</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search KPIs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full sm:w-72 pl-8"
              />
            </div>

            {canEdit && (
              <Button className="gap-2" onClick={openAdd}>
                <Plus className="size-4" />
                Add KPI
              </Button>
            )}
          </div>

          {/* KPI Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">
                KPI Indicators ({filtered.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading KPIs...</span>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    {kpis.length === 0 ? "No KPIs defined yet. Add your first KPI to get started." : "No KPIs match your search criteria."}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>KPI Name</TableHead>
                        <TableHead>Performance Area</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-center">Target</TableHead>
                        <TableHead className="text-center">Weight (%)</TableHead>
                        <TableHead className="text-center">Variance Rule</TableHead>
                        {canEdit && <TableHead className="w-20"></TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((kpi) => (
                        <TableRow key={kpi.id}>
                          <TableCell>
                            <div>
                              <span className="font-medium text-foreground">{kpi.name}</span>
                              {kpi.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                  {kpi.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={areaColors[kpi.area] || "bg-secondary text-secondary-foreground"}>
                              {kpi.area}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{kpi.unit}</TableCell>
                          <TableCell className="text-center font-semibold tabular-nums text-foreground">
                            {kpi.target}
                          </TableCell>
                          <TableCell className="text-center font-semibold tabular-nums text-foreground">
                            {kpi.weight}
                          </TableCell>
                          <TableCell className="text-center font-mono text-xs text-muted-foreground">
                            ±{kpi.allowable_variance}%
                          </TableCell>
                          {canEdit && (
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="size-7" onClick={() => openEdit(kpi)}>
                                  <Pencil className="size-3.5 text-muted-foreground" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button variant="ghost" size="icon" className="size-7" onClick={() => setDeletingKpi(kpi)}>
                                  <Trash2 className="size-3.5 text-muted-foreground" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit KPI Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingKpi ? "Edit KPI" : "Add New KPI"}</DialogTitle>
            <DialogDescription>
              {editingKpi ? "Update the KPI definition details." : "Define a new KPI indicator for the library."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>KPI Name <span className="text-destructive">*</span></Label>
              <Input
                placeholder="Enter KPI name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Performance Area <span className="text-destructive">*</span></Label>
                <Select value={form.area} onValueChange={(v) => setForm({ ...form, area: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    {AREAS.map((area) => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Measurement Unit <span className="text-destructive">*</span></Label>
                <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Annual Target <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  placeholder="e.g. 95"
                  value={form.target}
                  onChange={(e) => setForm({ ...form, target: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Weight (%) <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  placeholder="e.g. 5"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  step="0.5"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Allowable Variance (%)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 5"
                  value={form.allowable_variance}
                  onChange={(e) => setForm({ ...form, allowable_variance: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Previous Year Performance</Label>
                <Input
                  type="number"
                  placeholder="Optional baseline"
                  value={form.prev_year_performance}
                  onChange={(e) => setForm({ ...form, prev_year_performance: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe what this KPI measures..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button className="gap-1.5" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              {editingKpi ? "Save Changes" : "Create KPI"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingKpi} onOpenChange={(open) => !open && setDeletingKpi(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete KPI</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deletingKpi?.name}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
