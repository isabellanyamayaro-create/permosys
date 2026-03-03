"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Gauge,
  LayoutGrid,
  GitBranch,
  Mail,
  Save,
  Plus,
  Edit3,
  Trash2,
  GripVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Rating Scale Data
const ratingScaleDefaults = [
  { score: 6, rating: "Excellent", varianceMin: 0, varianceMax: null, description: "Target met or exceeded", color: "bg-success/10 text-success" },
  { score: 5, rating: "Good", varianceMin: -5, varianceMax: -1, description: "Slightly below target", color: "bg-success/10 text-success" },
  { score: 4, rating: "Satisfactory", varianceMin: -10, varianceMax: -6, description: "Moderately below target", color: "bg-primary/10 text-primary" },
  { score: 3, rating: "Average", varianceMin: -20, varianceMax: -11, description: "Significantly below target", color: "bg-warning/10 text-warning-foreground" },
  { score: 2, rating: "Below Average", varianceMin: -30, varianceMax: -21, description: "Poor performance", color: "bg-destructive/10 text-destructive" },
  { score: 1, rating: "Unsatisfactory", varianceMin: null, varianceMax: -31, description: "Critical underperformance", color: "bg-destructive/10 text-destructive" },
]

// Performance Areas
const performanceAreas = [
  { id: 1, name: "Outcomes", weight: 25, kpiCount: 8, description: "Strategic outcomes and impact indicators", active: true },
  { id: 2, name: "Outputs", weight: 25, kpiCount: 12, description: "Direct deliverables and output measures", active: true },
  { id: 3, name: "Service Delivery", weight: 20, kpiCount: 6, description: "Quality and efficiency of service delivery", active: true },
  { id: 4, name: "Management", weight: 15, kpiCount: 5, description: "Internal management and governance", active: true },
  { id: 5, name: "Cross-Cutting", weight: 15, kpiCount: 4, description: "Gender mainstreaming, ICT, and compliance", active: true },
]

// Workflow States
const workflowStates = [
  { id: 1, state: "Draft", description: "Initial contract creation", allowedTransitions: ["Sent for Signing"], color: "bg-muted text-muted-foreground" },
  { id: 2, state: "Sent for Signing", description: "Awaiting entity CEO signature", allowedTransitions: ["Submitted"], color: "bg-primary/10 text-primary" },
  { id: 3, state: "Submitted", description: "Quarterly actuals submitted", allowedTransitions: ["Under Review"], color: "bg-primary/10 text-primary" },
  { id: 4, state: "Under Review", description: "Being reviewed by CEO/Board", allowedTransitions: ["Approved", "Rejected"], color: "bg-warning/10 text-warning-foreground" },
  { id: 5, state: "Approved", description: "Scores accepted, contract locked", allowedTransitions: ["Locked"], color: "bg-success/10 text-success" },
  { id: 6, state: "Rejected", description: "Returned for resubmission", allowedTransitions: ["Submitted"], color: "bg-destructive/10 text-destructive" },
  { id: 7, state: "Locked", description: "Final, no further edits", allowedTransitions: [], color: "bg-muted text-muted-foreground" },
]

// Email Templates
const emailTemplates = [
  { id: 1, name: "Submission Reminder", subject: "Q{quarter} Performance Submission Due", trigger: "7 days before deadline", active: true },
  { id: 2, name: "Submission Confirmation", subject: "Your Q{quarter} submission has been received", trigger: "On submission", active: true },
  { id: 3, name: "Approval Notification", subject: "Q{quarter} submission approved for {entity}", trigger: "On approval", active: true },
  { id: 4, name: "Rejection Notification", subject: "Q{quarter} submission returned for {entity}", trigger: "On rejection", active: true },
  { id: 5, name: "Contract Sent", subject: "Performance contract ready for signing - {entity}", trigger: "On contract send", active: true },
  { id: 6, name: "At-Risk Alert", subject: "Performance Alert: {entity} below threshold", trigger: "Score below 3.0", active: false },
  { id: 7, name: "Deadline Passed", subject: "Overdue: Q{quarter} submission not received from {entity}", trigger: "1 day after deadline", active: true },
]

export default function SystemSettingsPage() {
  const [editingScale, setEditingScale] = useState<typeof ratingScaleDefaults[0] | null>(null)
  const [editingArea, setEditingArea] = useState<typeof performanceAreas[0] | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<typeof emailTemplates[0] | null>(null)

  return (
    <>
      <Header title="System Settings" />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">System Configuration</h2>
            <p className="text-sm text-muted-foreground">Manage rating scales, performance areas, workflow states, and email templates.</p>
          </div>

          <Tabs defaultValue="rating">
            <TabsList className="flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="rating" className="gap-2">
                <Gauge className="size-3.5" />
                Rating Scale
              </TabsTrigger>
              <TabsTrigger value="areas" className="gap-2">
                <LayoutGrid className="size-3.5" />
                Performance Areas
              </TabsTrigger>
              <TabsTrigger value="workflow" className="gap-2">
                <GitBranch className="size-3.5" />
                Workflow States
              </TabsTrigger>
              <TabsTrigger value="email" className="gap-2">
                <Mail className="size-3.5" />
                Email Templates
              </TabsTrigger>
            </TabsList>

            {/* Rating Scale Tab */}
            <TabsContent value="rating" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Rating Scale (1-6)</CardTitle>
                      <CardDescription>Define the variance-to-score mapping for performance evaluation.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Score</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Variance Range</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ratingScaleDefaults.map((row) => (
                        <TableRow key={row.score}>
                          <TableCell>
                            <Badge className={cn("font-mono tabular-nums text-sm font-bold", row.color)}>
                              {row.score}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-foreground">{row.rating}</TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {row.score === 6 && ">= 0%"}
                            {row.score === 1 && "< -30%"}
                            {row.score > 1 && row.score < 6 && `${row.varianceMin}% to ${row.varianceMax}%`}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{row.description}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-8 p-0"
                              onClick={() => setEditingScale(row)}
                            >
                              <Edit3 className="size-3.5 text-muted-foreground" />
                              <span className="sr-only">Edit rating</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Weighted Score Formula</CardTitle>
                  <CardDescription>System-wide formula used for all score calculations.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4 font-mono text-sm">
                    <p className="text-foreground">Weighted Score = Raw Score x (Weight / Total Weights)</p>
                    <p className="text-muted-foreground">Section Score = Sum(Weighted Scores in Section)</p>
                    <p className="text-muted-foreground">Overall Score = Sum(Section Scores x Section Weights) / 100</p>
                    <p className="text-muted-foreground">Annual Score = Average(Q1, Q2, Q3, Q4 Scores)</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Areas Tab */}
            <TabsContent value="areas" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Performance Area Configuration</CardTitle>
                      <CardDescription>Define and weight performance areas for entity evaluation. Weights must total 100%.</CardDescription>
                    </div>
                    <Button size="sm" className="gap-1.5" onClick={() => setEditingArea({ id: 0, name: "", weight: 0, kpiCount: 0, description: "", active: true })}>
                      <Plus className="size-3.5" />
                      Add Area
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10"></TableHead>
                        <TableHead>Area Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-center">Weight (%)</TableHead>
                        <TableHead className="text-center">KPIs</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {performanceAreas.map((area) => (
                        <TableRow key={area.id}>
                          <TableCell>
                            <GripVertical className="size-4 text-muted-foreground/50 cursor-grab" />
                          </TableCell>
                          <TableCell className="font-medium text-foreground">{area.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{area.description}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="font-mono tabular-nums">{area.weight}%</Badge>
                          </TableCell>
                          <TableCell className="text-center tabular-nums text-muted-foreground">{area.kpiCount}</TableCell>
                          <TableCell className="text-center">
                            <Badge className={area.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                              {area.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" className="size-8 p-0" onClick={() => setEditingArea(area)}>
                                <Edit3 className="size-3.5 text-muted-foreground" />
                                <span className="sr-only">Edit area</span>
                              </Button>
                              <Button variant="ghost" size="sm" className="size-8 p-0">
                                <Trash2 className="size-3.5 text-destructive" />
                                <span className="sr-only">Delete area</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Total Weight</span>
                    <Badge className={cn(
                      "font-mono tabular-nums text-sm",
                      performanceAreas.reduce((sum, a) => sum + a.weight, 0) === 100
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    )}>
                      {performanceAreas.reduce((sum, a) => sum + a.weight, 0)}% / 100%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Workflow States Tab */}
            <TabsContent value="workflow" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Workflow State Management</CardTitle>
                  <CardDescription>Define the contract lifecycle states and allowed transitions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {workflowStates.map((state, index) => (
                      <div key={state.id}>
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center">
                            <div className={cn(
                              "flex size-9 items-center justify-center rounded-full text-xs font-bold",
                              state.color
                            )}>
                              {index + 1}
                            </div>
                            {index < workflowStates.length - 1 && (
                              <div className="w-px h-8 bg-border mt-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-semibold text-foreground">{state.state}</h4>
                                  <Badge className={cn("text-[10px]", state.color)}>{state.state}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">{state.description}</p>
                              </div>
                              <Button variant="ghost" size="sm" className="size-8 p-0">
                                <Edit3 className="size-3.5 text-muted-foreground" />
                                <span className="sr-only">Edit state</span>
                              </Button>
                            </div>
                            {state.allowedTransitions.length > 0 && (
                              <div className="mt-2 flex items-center gap-1.5">
                                <span className="text-[10px] text-muted-foreground">Transitions to:</span>
                                {state.allowedTransitions.map((t) => (
                                  <Badge key={t} variant="secondary" className="text-[10px] font-normal">{t}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Templates Tab */}
            <TabsContent value="email" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Email Template Configuration</CardTitle>
                      <CardDescription>Manage automated email notifications sent by the system.</CardDescription>
                    </div>
                    <Button size="sm" className="gap-1.5" onClick={() => setEditingTemplate({ id: 0, name: "", subject: "", trigger: "", active: true })}>
                      <Plus className="size-3.5" />
                      Add Template
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Template Name</TableHead>
                        <TableHead>Subject Line</TableHead>
                        <TableHead>Trigger</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emailTemplates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium text-foreground">{template.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground font-mono max-w-xs truncate">{template.subject}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-[10px] font-normal">{template.trigger}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch defaultChecked={template.active} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="size-8 p-0"
                                onClick={() => setEditingTemplate(template)}
                              >
                                <Edit3 className="size-3.5 text-muted-foreground" />
                                <span className="sr-only">Edit template</span>
                              </Button>
                              <Button variant="ghost" size="sm" className="size-8 p-0">
                                <Trash2 className="size-3.5 text-destructive" />
                                <span className="sr-only">Delete template</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Rating Scale Dialog */}
      <Dialog open={!!editingScale} onOpenChange={(open) => !open && setEditingScale(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Rating Level</DialogTitle>
            <DialogDescription>Modify the variance range and description for score {editingScale?.score}.</DialogDescription>
          </DialogHeader>
          {editingScale && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Score</Label>
                  <Input value={editingScale.score} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Rating Label</Label>
                  <Input defaultValue={editingScale.rating} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Variance Min (%)</Label>
                  <Input type="number" defaultValue={editingScale.varianceMin ?? ""} placeholder="e.g. -10" />
                </div>
                <div className="space-y-2">
                  <Label>Variance Max (%)</Label>
                  <Input type="number" defaultValue={editingScale.varianceMax ?? ""} placeholder="e.g. -6" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input defaultValue={editingScale.description} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingScale(null)}>Cancel</Button>
            <Button className="gap-1.5" onClick={() => setEditingScale(null)}>
              <Save className="size-3.5" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Performance Area Dialog */}
      <Dialog open={!!editingArea} onOpenChange={(open) => !open && setEditingArea(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingArea?.id === 0 ? "Add Performance Area" : "Edit Performance Area"}</DialogTitle>
            <DialogDescription>Configure the performance area name, weight, and description.</DialogDescription>
          </DialogHeader>
          {editingArea && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Area Name</Label>
                <Input defaultValue={editingArea.name} placeholder="e.g. Financial Performance" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Weight (%)</Label>
                  <Input type="number" defaultValue={editingArea.weight || ""} placeholder="e.g. 20" />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select defaultValue={editingArea.active ? "active" : "inactive"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea defaultValue={editingArea.description} placeholder="Brief description of this performance area..." className="min-h-[80px]" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingArea(null)}>Cancel</Button>
            <Button className="gap-1.5" onClick={() => setEditingArea(null)}>
              <Save className="size-3.5" />
              {editingArea?.id === 0 ? "Add Area" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Email Template Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTemplate?.id === 0 ? "Add Email Template" : "Edit Email Template"}</DialogTitle>
            <DialogDescription>Configure the email template subject and body content.</DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input defaultValue={editingTemplate.name} placeholder="e.g. Monthly Report" />
              </div>
              <div className="space-y-2">
                <Label>Subject Line</Label>
                <Input defaultValue={editingTemplate.subject} placeholder="Use {quarter}, {entity} as placeholders" />
              </div>
              <div className="space-y-2">
                <Label>Trigger Condition</Label>
                <Input defaultValue={editingTemplate.trigger} placeholder="e.g. On submission" />
              </div>
              <div className="space-y-2">
                <Label>Email Body</Label>
                <Textarea placeholder="Compose the email body. Use {entity}, {quarter}, {score}, {deadline} as placeholders..." className="min-h-[120px]" />
              </div>
              <div className="flex items-center justify-between">
                <Label>Enabled</Label>
                <Switch defaultChecked={editingTemplate.active} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>Cancel</Button>
            <Button className="gap-1.5" onClick={() => setEditingTemplate(null)}>
              <Save className="size-3.5" />
              {editingTemplate?.id === 0 ? "Add Template" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
