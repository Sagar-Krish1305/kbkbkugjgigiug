// Domain types for Deskline ITSM. Unions via `as const` (no enums per project rules).

export const TICKET_TYPES = ['incident', 'request'] as const
export type TicketType = (typeof TICKET_TYPES)[number]

export const TICKET_STATUSES = ['open', 'in_progress', 'pending', 'resolved', 'closed'] as const
export type TicketStatus = (typeof TICKET_STATUSES)[number]

export const PRIORITIES = ['critical', 'high', 'medium', 'low'] as const
export type Priority = (typeof PRIORITIES)[number]

export const EVENT_KINDS = ['note', 'status', 'assignment', 'priority', 'created'] as const
export type EventKind = (typeof EVENT_KINDS)[number]

export const AGENT_ROLES = ['agent', 'lead', 'admin'] as const
export type AgentRole = (typeof AGENT_ROLES)[number]

export type Ticket = {
  id: string
  ref: string
  type: TicketType
  subject: string
  description: string
  status: TicketStatus
  priority: Priority
  category: string
  requesterId: string
  assigneeId: string | null
  serviceId: string | null
  createdAt: string
  updatedAt: string
  slaDueAt: string
  resolvedAt: string | null
}

export type TicketEvent = {
  id: string
  ticketId: string
  kind: EventKind
  body: string
  authorId: string
  createdAt: string
}

export type Agent = {
  id: string
  name: string
  role: AgentRole
  email: string
  initials: string
}

export type Requester = {
  id: string
  name: string
  email: string
  department: string
}

export type Service = {
  id: string
  name: string
  description: string
  category: string
  fulfillmentHours: number
}

export type Article = {
  id: string
  title: string
  summary: string
  body: string
  category: string
  updatedAt: string
  views: number
  helpful: number
}

// SLA state derived from time-to-due.
export const SLA_STATES = ['on_track', 'at_risk', 'breached', 'met'] as const
export type SlaState = (typeof SLA_STATES)[number]
