"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Edit3,
  ShieldOff,
  ShieldCheck,
  Mail,
  Save,
  KeyRound,
} from "lucide-react"
import { cn } from "@/lib/utils"

type UserRole = "Admin" | "M&E Consultant" | "CEO" | "Entity Admin" | "Reviewer" | "Board Member"
type UserStatus = "Active" | "Inactive"

interface User {
  id: number
  name: string
  email: string
  role: UserRole
  status: UserStatus
  entity: string
  lastLogin: string
  createdDate: string
}

const allUsers: User[] = [
  { id: 1, name: "Sarah Nakale", email: "s.nakale@gov.na", role: "Admin", status: "Active", entity: "System", lastLogin: "2026-03-01", createdDate: "2024-06-15" },
  { id: 2, name: "John Moyo", email: "j.moyo@gov.na", role: "M&E Consultant", status: "Active", entity: "System", lastLogin: "2026-03-02", createdDate: "2024-08-20" },
  { id: 3, name: "Dr. K. Mbeki", email: "k.mbeki@gov.na", role: "CEO", status: "Active", entity: "System", lastLogin: "2026-02-28", createdDate: "2024-06-15" },
  { id: 4, name: "Prof. T. Nkosi", email: "t.nkosi@gov.na", role: "Reviewer", status: "Active", entity: "System", lastLogin: "2026-02-25", createdDate: "2024-09-10" },
  { id: 5, name: "M. Shikongo", email: "m.shikongo@gov.na", role: "Entity Admin", status: "Active", entity: "Ministry of Health", lastLogin: "2026-03-01", createdDate: "2024-10-05" },
  { id: 6, name: "L. Amupanda", email: "l.amupanda@gov.na", role: "Entity Admin", status: "Active", entity: "Ministry of Education", lastLogin: "2026-02-27", createdDate: "2024-10-05" },
  { id: 7, name: "P. Nashandi", email: "p.nashandi@gov.na", role: "Entity Admin", status: "Active", entity: "Ministry of Transport", lastLogin: "2026-02-20", createdDate: "2025-01-12" },
  { id: 8, name: "R. Kavita", email: "r.kavita@gov.na", role: "Entity Admin", status: "Active", entity: "Ministry of Finance", lastLogin: "2026-03-02", createdDate: "2024-07-03" },
  { id: 9, name: "S. Hamutenya", email: "s.hamutenya@gov.na", role: "Board Member", status: "Inactive", entity: "System", lastLogin: "2025-11-15", createdDate: "2024-06-15" },
  { id: 10, name: "T. Angula", email: "t.angula@gov.na", role: "Entity Admin", status: "Inactive", entity: "Ministry of Defence", lastLogin: "2025-12-01", createdDate: "2024-11-20" },
]

const roleColors: Record<UserRole, string> = {
  Admin: "bg-destructive/10 text-destructive",
  "M&E Consultant": "bg-primary/10 text-primary",
  CEO: "bg-success/10 text-success",
  "Entity Admin": "bg-warning/10 text-warning-foreground",
  Reviewer: "bg-chart-5/10 text-chart-5",
  "Board Member": "bg-muted text-muted-foreground",
}

export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [addingUser, setAddingUser] = useState(false)

  const filteredUsers = allUsers.filter((user) => {
    const matchSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchRole = roleFilter === "all" || user.role === roleFilter
    const matchStatus = statusFilter === "all" || user.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  const activeCount = allUsers.filter((u) => u.status === "Active").length
  const inactiveCount = allUsers.filter((u) => u.status === "Inactive").length
  const roleBreakdown = allUsers.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <>
      <Header title="User Management" />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-6">
          {/* Summary Row */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground tabular-nums">{allUsers.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-success/10">
                  <ShieldCheck className="size-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-foreground tabular-nums">{activeCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <ShieldOff className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Inactive</p>
                  <p className="text-2xl font-bold text-foreground tabular-nums">{inactiveCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-2">By Role</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(roleBreakdown).map(([role, count]) => (
                    <Badge key={role} variant="secondary" className="text-[10px] font-normal">
                      {role}: {count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Add Button */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-muted-foreground shrink-0" />
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="M&E Consultant">M&E Consultant</SelectItem>
                    <SelectItem value="CEO">CEO</SelectItem>
                    <SelectItem value="Entity Admin">Entity Admin</SelectItem>
                    <SelectItem value="Reviewer">Reviewer</SelectItem>
                    <SelectItem value="Board Member">Board Member</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="gap-1.5" onClick={() => setAddingUser(true)}>
              <UserPlus className="size-4" />
              Add User
            </Button>
          </div>

          {/* Users Table */}
          <Card>
            <CardContent className="px-0 pb-0 pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className={cn(user.status === "Inactive" && "opacity-60")}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                              {user.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={cn("text-[10px]", roleColors[user.role])}>{user.role}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.entity}</TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "text-[10px]",
                          user.status === "Active"
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground"
                        )}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground tabular-nums">{user.lastLogin}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="size-8 p-0">
                              <MoreHorizontal className="size-4 text-muted-foreground" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => setEditingUser(user)} className="gap-2">
                              <Edit3 className="size-3.5" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <KeyRound className="size-3.5" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Mail className="size-3.5" />
                              Send Invite
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className={cn(
                              "gap-2",
                              user.status === "Active" ? "text-destructive" : "text-success"
                            )}>
                              {user.status === "Active" ? (
                                <><ShieldOff className="size-3.5" /> Disable User</>
                              ) : (
                                <><ShieldCheck className="size-3.5" /> Enable User</>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                        No users match your search criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details and role assignment.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input defaultValue={editingUser.name} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue={editingUser.email} type="email" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select defaultValue={editingUser.role}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="M&E Consultant">M&E Consultant</SelectItem>
                      <SelectItem value="CEO">CEO</SelectItem>
                      <SelectItem value="Entity Admin">Entity Admin</SelectItem>
                      <SelectItem value="Reviewer">Reviewer</SelectItem>
                      <SelectItem value="Board Member">Board Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assigned Entity</Label>
                  <Select defaultValue={editingUser.entity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="System">System (All Entities)</SelectItem>
                      <SelectItem value="Ministry of Finance">Ministry of Finance</SelectItem>
                      <SelectItem value="Ministry of Health">Ministry of Health</SelectItem>
                      <SelectItem value="Ministry of Education">Ministry of Education</SelectItem>
                      <SelectItem value="Ministry of Transport">Ministry of Transport</SelectItem>
                      <SelectItem value="Ministry of Defence">Ministry of Defence</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Account Status</p>
                  <p className="text-xs text-muted-foreground">Enable or disable this user account</p>
                </div>
                <Switch defaultChecked={editingUser.status === "Active"} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button className="gap-1.5" onClick={() => setEditingUser(null)}>
              <Save className="size-3.5" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addingUser} onOpenChange={setAddingUser}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account and assign a role.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input placeholder="e.g. Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input placeholder="e.g. j.doe@gov.na" type="email" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="M&E Consultant">M&E Consultant</SelectItem>
                    <SelectItem value="CEO">CEO</SelectItem>
                    <SelectItem value="Entity Admin">Entity Admin</SelectItem>
                    <SelectItem value="Reviewer">Reviewer</SelectItem>
                    <SelectItem value="Board Member">Board Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assigned Entity</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="System">System (All Entities)</SelectItem>
                    <SelectItem value="Ministry of Finance">Ministry of Finance</SelectItem>
                    <SelectItem value="Ministry of Health">Ministry of Health</SelectItem>
                    <SelectItem value="Ministry of Education">Ministry of Education</SelectItem>
                    <SelectItem value="Ministry of Transport">Ministry of Transport</SelectItem>
                    <SelectItem value="Ministry of Defence">Ministry of Defence</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Temporary Password</Label>
              <Input type="password" placeholder="Set initial password" />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border p-3">
              <Switch defaultChecked />
              <div>
                <p className="text-sm font-medium text-foreground">Send welcome email</p>
                <p className="text-xs text-muted-foreground">User will receive an email with login credentials</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingUser(false)}>Cancel</Button>
            <Button className="gap-1.5" onClick={() => setAddingUser(false)}>
              <UserPlus className="size-3.5" />
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
