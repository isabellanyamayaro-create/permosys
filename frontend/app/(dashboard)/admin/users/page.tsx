"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users, UserPlus, Search, Filter, MoreHorizontal, Edit3,
  ShieldOff, ShieldCheck, Mail, Save, Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getUsers, createUser, updateUser, getEntities,
  type PmsUser, type Entity,
} from "@/lib/api"

const ROLES = [
  { value: "admin", label: "System Administrator" },
  { value: "me", label: "M&E Consultant" },
  { value: "entity", label: "Entity User" },
]

const roleColors: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive",
  me: "bg-primary/10 text-primary",
  entity: "bg-warning/10 text-warning-foreground",
}

const roleLabelMap: Record<string, string> = {
  admin: "System Administrator",
  me: "M&E Consultant",
  entity: "Entity User",
}

interface UserFormData {
  name: string
  email: string
  role: string
  entity: string
  password: string
  sendWelcome: boolean
}

const emptyForm: UserFormData = {
  name: "", email: "", role: "", entity: "", password: "", sendWelcome: true,
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<PmsUser[]>([])
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Modals
  const [addingUser, setAddingUser] = useState(false)
  const [editingUser, setEditingUser] = useState<PmsUser | null>(null)
  const [form, setForm] = useState<UserFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  const fetchData = useCallback(async () => {
    try {
      const [usersData, entitiesData] = await Promise.all([getUsers(), getEntities()])
      setUsers(usersData)
      setEntities(entitiesData)
    } catch (err) {
      console.error("Failed to load data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchRole = roleFilter === "all" || user.role === roleFilter
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "Active" && user.is_active) ||
      (statusFilter === "Inactive" && !user.is_active)
    return matchSearch && matchRole && matchStatus
  })

  const activeCount = users.filter((u) => u.is_active).length
  const inactiveCount = users.filter((u) => !u.is_active).length
  const roleBreakdown = users.reduce((acc, u) => {
    const label = roleLabelMap[u.role] || u.role
    acc[label] = (acc[label] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // --- Add User ---
  const openAdd = () => {
    setForm(emptyForm)
    setFormError("")
    setAddingUser(true)
  }

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.role || !form.password) {
      setFormError("Please fill in all required fields.")
      return
    }
    if (form.password.length < 8) {
      setFormError("Password must be at least 8 characters.")
      return
    }
    setSaving(true)
    setFormError("")
    try {
      await createUser({
        name: form.name,
        email: form.email,
        role: form.role,
        entity: form.entity ? parseInt(form.entity) : null,
        password: form.password,
      })
      setAddingUser(false)
      await fetchData()
    } catch (err: any) {
      setFormError(err.message || "Failed to create user.")
    } finally {
      setSaving(false)
    }
  }

  // --- Edit User ---
  const openEdit = (user: PmsUser) => {
    setEditingUser(user)
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      entity: user.entity ? String(user.entity) : "",
      password: "",
      sendWelcome: false,
    })
    setFormError("")
  }

  const handleUpdate = async () => {
    if (!editingUser || !form.name || !form.email || !form.role) {
      setFormError("Please fill in all required fields.")
      return
    }
    setSaving(true)
    setFormError("")
    try {
      await updateUser(editingUser.id, {
        name: form.name,
        email: form.email,
        role: form.role as any,
        entity: form.entity ? (parseInt(form.entity) as any) : null,
      })
      setEditingUser(null)
      await fetchData()
    } catch (err: any) {
      setFormError(err.message || "Failed to update user.")
    } finally {
      setSaving(false)
    }
  }

  // --- Toggle Active ---
  const toggleActive = async (user: PmsUser) => {
    try {
      await updateUser(user.id, { is_active: !user.is_active } as any)
      await fetchData()
    } catch (err) {
      console.error("Failed to toggle user status:", err)
    }
  }

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
                  <p className="text-2xl font-bold text-foreground tabular-nums">{users.length}</p>
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
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
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
            <Button className="gap-1.5" onClick={openAdd}>
              <UserPlus className="size-4" />
              Add User
            </Button>
          </div>

          {/* Users Table */}
          <Card>
            <CardContent className="px-0 pb-0 pt-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading users...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className={cn(!user.is_active && "opacity-60")}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge className={cn("text-[10px]", roleColors[user.role] || "bg-secondary text-secondary-foreground")}>
                            {roleLabelMap[user.role] || user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.entity_name || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-[10px]",
                            user.is_active
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                          )}>
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="size-8 p-0">
                                <MoreHorizontal className="size-4 text-muted-foreground" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => openEdit(user)} className="gap-2">
                                <Edit3 className="size-3.5" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => toggleActive(user)}
                                className={cn("gap-2", user.is_active ? "text-destructive" : "text-success")}
                              >
                                {user.is_active ? (
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
                    {filteredUsers.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                          {users.length === 0 ? "No users found. Add your first user to get started." : "No users match your search criteria."}
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
                <Label>Full Name <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="e.g. Jane Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="e.g. j.doe@gov.zw"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Role <span className="text-destructive">*</span></Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assigned Entity</Label>
                <Select value={form.entity} onValueChange={(v) => setForm({ ...form, entity: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (System-wide)</SelectItem>
                    {entities.map((e) => (
                      <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Temporary Password <span className="text-destructive">*</span></Label>
              <Input
                type="password"
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingUser(false)}>Cancel</Button>
            <Button className="gap-1.5" onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <UserPlus className="size-3.5" />}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details and role assignment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name <span className="text-destructive">*</span></Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input
                  value={form.email}
                  type="email"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Role <span className="text-destructive">*</span></Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assigned Entity</Label>
                <Select value={form.entity} onValueChange={(v) => setForm({ ...form, entity: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (System-wide)</SelectItem>
                    {entities.map((e) => (
                      <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button className="gap-1.5" onClick={handleUpdate} disabled={saving}>
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
