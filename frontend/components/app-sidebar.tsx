"use client"

import {
  LayoutDashboard,
  FileText,
  Library,
  CalendarCheck,
  BarChart3,
  Shield,
  Users,
  Cog,
  Settings,
  Send,
  LogOut,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import type { UserRole } from "@/lib/api"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/* ─── Role-specific navigation ─── */

interface NavItem {
  title: string
  icon: typeof LayoutDashboard
  href: string
}

// M&E Consultant: full access to operational screens
const meNav: NavItem[] = [
  { title: "Dashboard",       icon: LayoutDashboard, href: "/" },
  { title: "Contracts",       icon: FileText,        href: "/contracts" },
  { title: "KPI Library",     icon: Library,         href: "/kpi-library" },
  { title: "MDA Evaluations", icon: CalendarCheck,   href: "/approvals" },
  { title: "Reports",         icon: BarChart3,       href: "/reports" },
]

const meSystemNav: NavItem[] = [
  { title: "Audit Log", icon: Shield,   href: "/audit-log" },
  { title: "Settings",  icon: Settings, href: "/settings" },
]

// CEO nav removed — CEO office is now a regular entity

// Admin: system config only
const adminNav: NavItem[] = [
  { title: "Admin Dashboard",  icon: LayoutDashboard, href: "/" },
  { title: "User Management",  icon: Users,           href: "/admin/users" },
  { title: "System Settings",  icon: Cog,             href: "/admin/system-settings" },
]

const adminSystemNav: NavItem[] = [
  { title: "Audit Log", icon: Shield, href: "/audit-log" },
]

// Entity: own contract, own submissions, own reports only
const entityNav: NavItem[] = [
  { title: "My Dashboard",   icon: LayoutDashboard, href: "/entity" },
  { title: "My Contract",    icon: FileText,        href: "/entity/contract" },
  { title: "Submit Actuals", icon: Send,            href: "/entity/submit" },
  { title: "My Reports",     icon: BarChart3,       href: "/entity/reports" },
]

const entitySystemNav: NavItem[] = []

/* ─── Map role to navs ─── */

function getNavForRole(role: UserRole): { main: NavItem[]; system: NavItem[] } {
  switch (role) {
    case "me":     return { main: meNav,     system: meSystemNav }
    case "admin":  return { main: adminNav,  system: adminSystemNav }
    case "entity": return { main: entityNav, system: entitySystemNav }
    default:       return { main: meNav,     system: meSystemNav }
  }
}

function getMenuLabel(role: UserRole): string {
  switch (role) {
    case "me":     return "M&E Menu"
    case "admin":  return "Admin Menu"
    case "entity": return "Entity Menu"
    default:       return "Menu"
  }
}

function getHomeHref(role: UserRole): string {
  switch (role) {
    case "entity": return "/entity"
    default:       return "/"
  }
}

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const role: UserRole = (user?.role ?? "me") as UserRole
  const { main: mainItems, system: systemItems } = getNavForRole(role)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href={getHomeHref(role)} className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <BarChart3 className="size-4 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
              PMS
            </span>
            <span className="text-[10px] text-sidebar-foreground/60 leading-none">
              Performance Management
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {/* Main navigation — unique per role */}
        <SidebarGroup>
          <SidebarGroupLabel>{getMenuLabel(role)}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => {
                const home = getHomeHref(role)
                const isActive =
                  item.href === home
                    ? pathname === item.href
                    : pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System section — only rendered if role has system items */}
        {systemItems.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>System</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {systemItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(item.href)}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar className="size-7">
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-medium">
                      {user?.initials ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col text-left text-xs leading-tight">
                    <span className="font-medium text-sidebar-foreground">
                      {user?.name ?? "—"}
                    </span>
                    <span className="text-sidebar-foreground/60">
                      {user?.label ?? user?.role ?? "—"}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto size-4 text-sidebar-foreground/60" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 size-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
