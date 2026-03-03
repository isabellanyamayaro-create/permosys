"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Building2, Users, Shield, Bell, Save } from "lucide-react"

const users = [
  { name: "John Moyo", email: "j.moyo@gov.na", role: "M&E Consultant", status: "Active" },
  { name: "Dr. K. Mbeki", email: "k.mbeki@gov.na", role: "CEO", status: "Active" },
  { name: "Prof. T. Nkosi", email: "t.nkosi@gov.na", role: "Reviewer", status: "Active" },
  { name: "M. Shikongo", email: "m.shikongo@gov.na", role: "Entity Admin", status: "Active" },
  { name: "L. Amupanda", email: "l.amupanda@gov.na", role: "Entity Admin", status: "Active" },
  { name: "S. Hamutenya", email: "s.hamutenya@gov.na", role: "Board Member", status: "Inactive" },
]

export default function SettingsPage() {
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

            <TabsContent value="entity" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Entity Information</CardTitle>
                  <CardDescription>Configure the entity mandate, vision, and mission statements.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Entity Name</Label>
                      <Input defaultValue="Ministry of Finance" />
                    </div>
                    <div className="space-y-2">
                      <Label>Reporting Period</Label>
                      <Select defaultValue="2025-26">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2025-26">2025/26</SelectItem>
                          <SelectItem value="2026-27">2026/27</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Mandate</Label>
                    <Textarea defaultValue="To ensure sound management of public finances, formulate fiscal and economic policy, and mobilize domestic and external resources for national development." className="min-h-[80px]" />
                  </div>
                  <div className="space-y-2">
                    <Label>Vision</Label>
                    <Textarea defaultValue="A prosperous Zimbabwe through efficient, effective and accountable management of public finances." className="min-h-[60px]" />
                  </div>
                  <div className="space-y-2">
                    <Label>Mission</Label>
                    <Textarea defaultValue="To manage public finances efficiently and effectively, and provide financial advice to Government for the benefit of all Zimbabweans." className="min-h-[60px]" />
                  </div>
                  <div className="flex justify-end">
                    <Button className="gap-2">
                      <Save className="size-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">User Management</CardTitle>
                      <CardDescription>Manage users and their role-based access.</CardDescription>
                    </div>
                    <Button size="sm">Add User</Button>
                  </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.email}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="size-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                  {user.name.split(" ").map((n) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium text-foreground">{user.name}</span>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={user.status === "Active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">Edit</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scoring" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Rating Scale Configuration</CardTitle>
                  <CardDescription>Define the 1-6 rating scale and variance-to-score mapping rules.</CardDescription>
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
                        { score: 6, rating: "Excellent", range: ">= 0%", desc: "Target met or exceeded" },
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
                  <CardDescription>The system uses the following formula for weighted score calculation.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-sm text-foreground">
                    <p>Weighted Score = Raw Score x Weight</p>
                    <p className="mt-2 text-muted-foreground">Overall Score = Sum(Weighted Scores) / Sum(Weights)</p>
                    <p className="mt-2 text-muted-foreground">Annual Score = Average(Q1, Q2, Q3, Q4)</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
