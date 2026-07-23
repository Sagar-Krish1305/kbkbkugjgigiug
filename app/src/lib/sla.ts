import { AT_RISK_THRESHOLD, SLA_POLICY } from './constants'
import type { Priority, SlaState, Ticket } from './types'

const HOUR_MS = 60 * 60 * 1000

// Compute an SLA due timestamp from a created time + priority resolution target.
export function computeSlaDueAt(createdAtIso: string, priority: Priority): string {
  const created = new Date(createdAtIso).getTime()
  const due = created + SLA_POLICY[priority].resolutionHours * HOUR_MS
  return new Date(due).toISOString()
}

const RESOLVED_LIKE = new Set(['resolved', 'closed'])

// Derive live SLA state relative to `now`.
export function getSlaState(ticket: Ticket, now: number = Date.now()): SlaState {
  const due = new Date(ticket.slaDueAt).getTime()
  if (RESOLVED_LIKE.has(ticket.status)) {
    const resolved = ticket.resolvedAt ? new Date(ticket.resolvedAt).getTime() : now
    return resolved <= due ? 'met' : 'breached'
  }
  if (now > due) return 'breached'
  const created = new Date(ticket.createdAt).getTime()
  const total = due - created
  const remaining = due - now
  if (total > 0 && remaining / total <= AT_RISK_THRESHOLD) return 'at_risk'
  return 'on_track'
}

// Human-readable countdown, e.g. "3h 12m left" or "2h 5m over".
export function formatSlaCountdown(ticket: Ticket, now: number = Date.now()): string {
  if (RESOLVED_LIKE.has(ticket.status)) {
    return getSlaState(ticket, now) === 'met' ? 'Met on time' : 'Breached'
  }
  const due = new Date(ticket.slaDueAt).getTime()
  const diff = Math.abs(due - now)
  const totalMinutes = Math.round(diff / (60 * 1000))
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (days === 0) parts.push(`${minutes}m`)
  const label = parts.join(' ')
  return due >= now ? `${label} left` : `${label} over`
}
