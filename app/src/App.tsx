import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from '@/routes/Login'
import ForgotPassword from '@/routes/ForgotPassword'
import UpdatePassword from '@/routes/UpdatePassword'
import Dashboard from '@/routes/Dashboard'
import Tickets from '@/routes/Tickets'
import TicketDetail from '@/routes/TicketDetail'
import Catalog from '@/routes/Catalog'
import Knowledge from '@/routes/Knowledge'
import Article from '@/routes/Article'
import Team from '@/routes/Team'
import { AppShell } from '@/components/app-shell'
import { CreateTicketDialog } from '@/components/create-ticket-dialog'

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      {children}
      <CreateTicketDialog />
    </AppShell>
  )
}

// BrowserRouter (clean URLs, no #). The mount path is never hardcoded here — the engine
// bakes it in as Vite's `base` (VITE_APP_BASE, see vite.config.ts) and the app reads it
// back as BASE_URL, so one value covers every slot it serves. A deploy build bakes '/'
// (the app's domain root → basename normalizes to undefined = root); a preview slot bakes
// its /agent-api/… path. The trailing slash goes because react-router rejects '/a/b'
// against basename '/a/b/'.
const APP_BASE = import.meta.env.BASE_URL
const basename = (APP_BASE.startsWith('/') ? APP_BASE.replace(/\/+$/, '') : '') || undefined

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/tickets" element={<AppLayout><Tickets /></AppLayout>} />
        <Route path="/tickets/:id" element={<AppLayout><TicketDetail /></AppLayout>} />
        <Route path="/catalog" element={<AppLayout><Catalog /></AppLayout>} />
        <Route path="/knowledge" element={<AppLayout><Knowledge /></AppLayout>} />
        <Route path="/knowledge/:id" element={<AppLayout><Article /></AppLayout>} />
        <Route path="/team" element={<AppLayout><Team /></AppLayout>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
