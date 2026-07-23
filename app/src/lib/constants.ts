import { PRIORITIES, TICKET_STATUSES } from './types'
import type { Priority, TicketStatus, TicketType, SlaState, AgentRole } from './types'

export { PRIORITIES, TICKET_STATUSES }

export const STORAGE_KEY = 'deskline-store-v1'
export const CURRENT_AGENT_ID = 'agent-1'
export const AT_RISK_THRESHOLD = 0.25

// Priority -> SLA targets (hours).
export const SLA_POLICY: Record<Priority, { responseHours: number; resolutionHours: number }> = {
  critical: { responseHours: 0.5, resolutionHours: 4 },
  high: { responseHours: 1, resolutionHours: 8 },
  medium: { responseHours: 4, resolutionHours: 24 },
  low: { responseHours: 8, resolutionHours: 72 },
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export const STATUS_LABEL: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  pending: 'Pending',
  resolved: 'Resolved',
  closed: 'Closed',
}

export const TYPE_LABEL: Record<TicketType, string> = {
  incident: 'Incident',
  request: 'Service Request',
}

export const SLA_LABEL: Record<SlaState, string> = {
  on_track: 'On track',
  at_risk: 'At risk',
  breached: 'Breached',
  met: 'Met',
}

export const ROLE_LABEL: Record<AgentRole, string> = {
  agent: 'Agent',
  lead: 'Team Lead',
  admin: 'Administrator',
}

// Token-based color classes so status meaning is consistent everywhere.
export const STATUS_STYLE: Record<TicketStatus, string> = {
  open: 'bg-[oklch(0.62_0.13_250)]/15 text-[oklch(0.72_0.13_250)] border-[oklch(0.62_0.13_250)]/30',
  in_progress: 'bg-primary/15 text-primary border-primary/30',
  pending: 'bg-accent/15 text-accent border-accent/30',
  resolved: 'bg-[oklch(0.70_0.15_155)]/15 text-[oklch(0.75_0.15_155)] border-[oklch(0.70_0.15_155)]/30',
  closed: 'bg-muted text-muted-foreground border-border',
}

export const PRIORITY_STYLE: Record<Priority, string> = {
  critical: 'bg-destructive/15 text-destructive border-destructive/30',
  high: 'bg-accent/15 text-accent border-accent/30',
  medium: 'bg-[oklch(0.62_0.13_250)]/15 text-[oklch(0.72_0.13_250)] border-[oklch(0.62_0.13_250)]/30',
  low: 'bg-muted text-muted-foreground border-border',
}

export const SLA_STYLE: Record<SlaState, string> = {
  on_track: 'bg-[oklch(0.70_0.15_155)]/15 text-[oklch(0.75_0.15_155)] border-[oklch(0.70_0.15_155)]/30',
  at_risk: 'bg-accent/15 text-accent border-accent/30',
  breached: 'bg-destructive/15 text-destructive border-destructive/30',
  met: 'bg-muted text-muted-foreground border-border',
}

// recharts chart-token ramp keyed by status/priority for consistent viz color.
export const STATUS_CHART: Record<TicketStatus, string> = {
  open: 'var(--chart-2)',
  in_progress: 'var(--chart-1)',
  pending: 'var(--chart-3)',
  resolved: 'var(--chart-5)',
  closed: 'var(--muted-foreground)',
}

export const PRIORITY_CHART: Record<Priority, string> = {
  critical: 'var(--chart-4)',
  high: 'var(--chart-3)',
  medium: 'var(--chart-2)',
  low: 'var(--chart-5)',
}

export const CATEGORIES = ['Hardware', 'Access', 'Software', 'Onboarding', 'Connectivity', 'Other'] as const
