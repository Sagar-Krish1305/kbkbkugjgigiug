import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  BookOpen,
  LayoutDashboard,
  Menu,
  Moon,
  Plus,
  Search,
  ShoppingBag,
  Sun,
  Ticket as TicketIcon,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CURRENT_AGENT_ID } from '@/lib/constants'
import { getAgent } from '@/data'
import { useUiStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tickets', label: 'Tickets', icon: TicketIcon },
  { to: '/catalog', label: 'Catalog', icon: ShoppingBag },
  { to: '/knowledge', label: 'Knowledge', icon: BookOpen },
  { to: '/team', label: 'Team & SLA', icon: Users },
] as const

function useThemeSync() {
  const theme = useUiStore((s) => s.theme)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/12 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          }
        >
          <Icon className="size-4" aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-1">
      <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
        <TicketIcon className="size-4" aria-hidden />
      </span>
      <span className="font-heading text-lg font-semibold tracking-tight">Deskline</span>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  useThemeSync()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)
  const search = useUiStore((s) => s.search)
  const setSearch = useUiStore((s) => s.setSearch)
  const openCreate = useUiStore((s) => s.openCreate)
  const agent = getAgent(CURRENT_AGENT_ID)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col gap-6 border-r border-border bg-card px-4 py-5 lg:flex">
        <Brand />
        <NavItems />
        <div className="mt-auto rounded-md border border-border bg-background/40 p-3 text-xs text-muted-foreground">
          Late shift · {new Date().toLocaleDateString(undefined, { weekday: 'long' })}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur md:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-4">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="mb-6 mt-1">
                <Brand />
              </div>
              <NavItems onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="relative min-w-0 flex-1 md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets by ref, subject, requester…"
              className="pl-9"
              aria-label="Search tickets"
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <Button onClick={() => openCreate()} className="gap-1.5">
              <Plus className="size-4" />
              <span className="hidden sm:inline">New ticket</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            {agent && (
              <Avatar className="size-8 border border-border">
                <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                  {agent.initials}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
