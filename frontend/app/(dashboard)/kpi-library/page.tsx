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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Plus, Pencil, Trash2, Search } from "lucide-react"

const kpiLibrary = [
  { id: 1, name: "Budget Execution Rate", area: "Outcomes", unit: "Percentage", weight: 5, variance: "5%", description: "Measures the percentage of allocated budget executed within the fiscal year" },
  { id: 2, name: "Revenue Collection Target", area: "Outcomes", unit: "Amount", weight: 5, variance: "10%", description: "Total revenue collected against annual target" },
  { id: 3, name: "Legislative Bills Processed", area: "Outputs", unit: "Number", weight: 4, variance: "2", description: "Number of legislative bills reviewed and processed" },
  { id: 4, name: "Policy Documents Developed", area: "Outputs", unit: "Number", weight: 4, variance: "1", description: "Number of new policy documents finalized" },
  { id: 5, name: "Service Delivery Index", area: "Service Delivery", unit: "Index", weight: 5, variance: "0.3", description: "Composite index measuring quality of public service delivery" },
  { id: 6, name: "Citizen Satisfaction Index", area: "Service Delivery", unit: "Index", weight: 4, variance: "0.5", description: "Citizen satisfaction survey composite score" },
  { id: 7, name: "Staff Training Completion", area: "Management", unit: "Percentage", weight: 3, variance: "10%", description: "Percentage of staff who completed mandatory training programs" },
  { id: 8, name: "ICT Systems Uptime", area: "Management", unit: "Percentage", weight: 3, variance: "2%", description: "Percentage uptime of critical ICT infrastructure" },
  { id: 9, name: "Audit Compliance Score", area: "Cross-Cutting", unit: "Index", weight: 4, variance: "0.5", description: "Score from annual audit compliance assessment" },
  { id: 10, name: "Gender Mainstreaming Score", area: "Cross-Cutting", unit: "Index", weight: 3, variance: "0.3", description: "Gender mainstreaming effectiveness index" },
  { id: 11, name: "Environmental Impact Score", area: "Cross-Cutting", unit: "Index", weight: 3, variance: "0.5", description: "Environmental compliance and sustainability score" },
  { id: 12, name: "Project Completion Rate", area: "Outputs", unit: "Percentage", weight: 5, variance: "8%", description: "Percentage of planned projects completed on schedule" },
]

const areaColors: Record<string, string> = {
  Outcomes: "bg-chart-1/10 text-chart-1",
  Outputs: "bg-chart-2/10 text-chart-2",
  "Service Delivery": "bg-chart-3/10 text-chart-3",
  Management: "bg-chart-4/10 text-chart-4",
  "Cross-Cutting": "bg-chart-5/10 text-chart-5",
}

export default function KPILibraryPage() {
  const [search, setSearch] = useState("")
  const [areaFilter, setAreaFilter] = useState("all")
  const [modalOpen, setModalOpen] = useState(false)

  const filtered = kpiLibrary.filter((kpi) => {
    const matchesSearch = kpi.name.toLowerCase().includes(search.toLowerCase())
    const matchesArea = areaFilter === "all" || kpi.area === areaFilter
    return matchesSearch && matchesArea
  })

  const areas = [...new Set(kpiLibrary.map((k) => k.area))]
  const countByArea = areas.reduce<Record<string, number>>((acc, area) => {
    acc[area] = kpiLibrary.filter((k) => k.area === area).length
    return acc
  }, {})

  return (
    <>
      <Header title="KPI Library" />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-6">
          {/* Area summary cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {areas.map((area) => (
              <Card
                key={area}
                className={`cursor-pointer transition-shadow hover:shadow-md ${areaFilter === area ? "ring-2 ring-primary" : ""}`}
                onClick={() => setAreaFilter(areaFilter === area ? "all" : area)}
              >
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{area}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{countByArea[area]}</p>
                  <p className="text-xs text-muted-foreground">indicators</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search KPIs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-72 pl-8"
              />
            </div>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="size-4" />
                  Add KPI
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New KPI</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>KPI Name</Label>
                    <Input placeholder="Enter KPI name" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Performance Area</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select area" />
                        </SelectTrigger>
                        <SelectContent>
                          {areas.map((area) => (
                            <SelectItem key={area} value={area}>{area}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Measurement Unit</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Percentage">Percentage</SelectItem>
                          <SelectItem value="Number">Number</SelectItem>
                          <SelectItem value="Amount">Amount</SelectItem>
                          <SelectItem value="Index">Index</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Default Weight</Label>
                      <Input type="number" placeholder="e.g. 5" />
                    </div>
                    <div className="space-y-2">
                      <Label>Allowable Variance</Label>
                      <Input placeholder="e.g. 5% or 0.3" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Describe what this KPI measures..." />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                    <Button onClick={() => setModalOpen(false)}>Save KPI</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* KPI Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">
                KPI Indicators ({filtered.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>KPI Name</TableHead>
                    <TableHead>Performance Area</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-center">Default Weight</TableHead>
                    <TableHead className="text-center">Variance Rule</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((kpi) => (
                    <TableRow key={kpi.id}>
                      <TableCell>
                        <div>
                          <span className="font-medium text-foreground">{kpi.name}</span>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {kpi.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={areaColors[kpi.area] || "bg-secondary text-secondary-foreground"}>
                          {kpi.area}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{kpi.unit}</TableCell>
                      <TableCell className="text-center font-semibold tabular-nums text-foreground">
                        {kpi.weight}
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs text-muted-foreground">
                        +/- {kpi.variance}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="size-7">
                            <Pencil className="size-3.5 text-muted-foreground" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="size-7">
                            <Trash2 className="size-3.5 text-muted-foreground" />
                            <span className="sr-only">Delete</span>
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
