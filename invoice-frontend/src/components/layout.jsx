import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Download,
  LogOut,
  Menu,
  ChevronLeft,
  Receipt,
  Settings,
  HelpCircle,
} from "lucide-react"

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "new-invoice", label: "New Invoice", icon: FilePlus },
  { id: "invoice-list", label: "All Invoices", icon: FileText },
  { id: "excel-export", label: "Export Data", icon: Download },
]

export function Sidebar({ currentPage, onNavigate, collapsed, onToggleCollapse }) {
  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 flex flex-col",
          collapsed ? "w-[70px]" : "w-[260px]"
        )}
      >
        {/* Logo Header */}
        <div className={cn("p-4 border-b border-border", collapsed ? "px-3" : "px-5")}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-white font-bold text-lg shrink-0">
              <Receipt className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="animate-fade-in">
                <h1 className="font-semibold text-foreground text-sm">S Four Traders</h1>
                <p className="text-xs text-muted-foreground">Invoice System</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id

            return collapsed ? (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      "w-full h-11",
                      isActive && "bg-brand-500/10 text-brand-500 hover:bg-brand-500/20"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "w-full justify-start gap-3 h-11 px-3",
                  isActive && "bg-brand-500/10 text-brand-500 hover:bg-brand-500/20"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Button>
            )
          })}
        </nav>

        {/* Collapse Button */}
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            onClick={onToggleCollapse}
            className={cn("w-full", !collapsed && "justify-start gap-3")}
          >
            {collapsed ? (
              <Menu className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}

export function Header({ user, onLogout }) {
  const initials = user
    ? user
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">Welcome back,</h2>
          <p className="text-lg font-semibold text-foreground">{user || "User"}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 border-2 border-brand-500/20">
                <AvatarFallback className="bg-brand-500/10 text-brand-500 font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  S Four Traders
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export function PageContainer({ children, className }) {
  return (
    <main className={cn("flex-1 p-6 overflow-auto", className)}>
      <div className="mx-auto max-w-7xl animate-fade-in">{children}</div>
    </main>
  )
}

export function PageHeader({ title, description, action }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {action && <div className="mt-4 sm:mt-0">{action}</div>}
    </div>
  )
}
