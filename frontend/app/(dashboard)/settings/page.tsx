"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Building2, Users, Shield, Bell, Save, Loader2, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getEntities, updateEntity, getUsers,
  type Entity, type PmsUser,
} from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

const roleLabelMap: Record<string, string> = {
  admin: "System Administrator",
  me: "M&E Consultant",
  entity: "Entity User",
}

export default function SettingsPage() {
  const { user } = useAuth()

  const [entities, setEntities] = useState<Entity[]>([])
  const [users, setUsers] = useState<PmsUser[]>([])
  const [loading, setLoading] = useState(true)

  // Entity form
  const [selectedEntityId, setSelectedEntityId] = useState<string>("")
  const [entityName, setEntityName] = useState("")
  const [entityShortName, setEntityShortName] = useState("")
  const [entitySaving, setEntitySaving] = useState(false)
  const [entitySaved, setEntitySaved] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [e, u] = await Promise.all([getEntities(), getUsers()])
      setEntities(e)
      setUsers(u)
      if (e.length > 0) {
        setSelectedEntityId(String(e[0].id))
        setEntityName(e[0].name)
        setEntityShortName(e[0].short_name)
      }
    } catch (err) {
      console.error("Failed to load settings data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // When entity selection changes, update form fields
  const handleEntityChange = (id: string) => {
    setSelectedEntityId(id)
    setEntitySaved(false)
    const entity = entities.find((e) => String(e.id) === id)
    if (entity) {
      setEntityName(entity.name)
      setEntityShortName(entity.short_name)
    }
  }

  const handleEntitySave = async () => {
    if (!selectedEntityId) return
    setEntitySaving(true)
    setEntitySaved(false)
    try {
      await updateEntity(parseInt(selectedEntityId), {
        name: entityName,
        short_name: entityShortName,
      })
      setEntitySaved(true)
      await fetchData()
      setTimeout(() => setEntitySaved(false), 3000)
    } catch (err) {
      console.error("Failed to save entity:", err)
    } finally {
      setEntitySaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header title="Settings" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading settings...</span>
        </div>
      </>
    )
  }

  return (
    <>
      <Header title="Settings" />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-6">
          <Tabs defaultValue="entity">
            <TabsList>
              <TabsTrigger value="entity" className="gap-2">
                <Building2 className="size-3.5" />
                Entity
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="size-3.5" />
                Users
              </TabsTrigger>
              <TabsTrigger value="scoring" className="gap-2">
                <Shield className="size-3.5" />
                Scoring Rules
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="size-3.5" />
                Notifications
              </TabsTrigger>
            </TabsList>

            {/* ── Entity Tab ── */}
            <TabsContent value="entity" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Entity Information</CardTitle>
                  <CardDescription>View and update entity details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Entity</Label>
                    <Select value={selectedEntityId} onValueChange={handleEntityChange}>
                      <SelectTrigger className="w-full sm:w-80">
                        <SelectValue placeholder="Select an entity" />
                      </SelectTrigger>
                      <SelectContent>
                        {entities.map((e) => (
                          <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Entity Name</Label>
                      <Input
                        value={entityName}
                        onChange={(e) => { setEntityName(e.target.value); setEntitySaved(false) }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Short Name / Abbreviation</Label>
                      <Input
                        value={entityShortName}
                        onChange={(e) => { setEntityShortName(e.target.value); setEntitySaved(false) }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    {entitySaved && (
                      <span className="flex items-center gap-1.5 text-sm text-success">
                        <CheckCircle2 className="size-4" /> Saved
                      </span>
                    )}
                    <Button className="gap-2" onClick={handleEntitySave} disabled={entitySaving}>
                      {entitySaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Users Tab ── */}
            <TabsContent value="users" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">System Users</CardTitle>
                      <CardDescription>Overview of all users. Manage users from Admin &rarr; User Management.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="size-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                  {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium text-foreground">{u.name}</span>
                                <p className="text-xs text-muted-foreground">{u.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {roleLabelMap[u.role] || u.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {u.entity_name || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge className={cn(
                              u.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                            )}>
                              {u.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Scoring Rules Tab ── */}
            <TabsContent value="scoring" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Rating Scale Configuration</CardTitle>
                  <CardDescription>The 1–6 rating scale and variance-to-score mapping rules used across the system.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Score</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Variance Range</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { score: 6, rating: "Excellent", range: "≥ 0%", desc: "Target met or exceeded" },
                        { score: 5, rating: "Good", range: "-1% to -5%", desc: "Slightly below target" },
                        { score: 4, rating: "Satisfactory", range: "-6% to -10%", desc: "Moderately below target" },
                        { score: 3, rating: "Average", range: "-11% to -20%", desc: "Significantly below target" },
                        { score: 2, rating: "Below Average", range: "-21% to -30%", desc: "Poor performance" },
                        { score: 1, rating: "Unsatisfactory", range: "< -30%", desc: "Critical underperformance" },
                      ].map((row) => (
                        <TableRow key={row.score}>
                          <TableCell>
                            <Badge className="bg-primary/10 text-primary font-mono tabular-nums">{row.score}</Badge>
                          </TableCell>
                          <TableCell className="font-medium text-foreground">{row.rating}</TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">{row.range}</TableCell>
                          <TableCell className="text-muted-foreground">{row.desc}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Weighted Scoring Formula</CardTitle>
                  <CardDescription>The system uses the following formula for weighted score calculation, aligned with the MDA Evaluation Scoring Template.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-sm text-foreground space-y-2">
                    <p>Weighted Score = Agreed Rating × Weight / 100</p>
                    <p className="text-muted-foreground">Overall Score = Sum(Weighted Scores) → value on 0–6 scale</p>
                    <p className="text-muted-foreground">Section Score = Sum(Section Weighted) × 100 / Sum(Section Weights)</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Notifications Tab ── */}
            <TabsContent value="notifications" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notification Preferences</CardTitle>
                  <CardDescription>Configure email notifications and automated reminders.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {[
                    { label: "Submission Deadline Reminders", desc: "Email reminders 7 and 3 days before quarterly deadlines" },
                    { label: "Contract Status Updates", desc: "Notifications when contracts change state" },
                    { label: "Approval Requests", desc: "Immediate notification when a submission requires review" },
                    { label: "Score Alerts", desc: "Alert when any entity drops below 3.0 threshold" },
                    { label: "Report Generation", desc: "Notification when annual reports are auto-generated" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
