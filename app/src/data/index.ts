// Data layer for Deskline. Domain data lives in the zustand store (localStorage);
// these hooks expose lookups and derived reads so components never reach into the
// store shape directly.
import { useMemo } from 'react'
import { AGENTS, ARTICLES, REQUESTERS, SERVICES } from '@/lib/seed'
import { useDomainStore } from '@/lib/store'
import type { Agent, Article, Requester, Service } from '@/lib/types'

export function useTickets() {
  return useDomainStore((s) => s.tickets)
}

export function useEvents() {
  return useDomainStore((s) => s.events)
}

export function useTicket(id: string | undefined) {
  const tickets = useTickets()
  return useMemo(() => tickets.find((t) => t.id === id), [tickets, id])
}

export function useTicketEvents(ticketId: string | undefined) {
  const events = useEvents()
  return useMemo(
    () =>
      events
        .filter((e) => e.ticketId === ticketId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [events, ticketId],
  )
}

export function useAgents(): Agent[] {
  return AGENTS
}

export function useRequesters(): Requester[] {
  return REQUESTERS
}

export function useServices(): Service[] {
  return SERVICES
}

const AGENT_MAP = new Map(AGENTS.map((a) => [a.id, a]))
const REQUESTER_MAP = new Map(REQUESTERS.map((r) => [r.id, r]))
const SERVICE_MAP = new Map(SERVICES.map((s) => [s.id, s]))

export function getAgent(id: string | null): Agent | undefined {
  return id ? AGENT_MAP.get(id) : undefined
}
export function getRequester(id: string): Requester | undefined {
  return REQUESTER_MAP.get(id)
}
export function getService(id: string | null): Service | undefined {
  return id ? SERVICE_MAP.get(id) : undefined
}

// Articles merge static content with live vote/view counts from the store.
export function useArticles(): Article[] {
  const helpful = useDomainStore((s) => s.articleHelpful)
  const views = useDomainStore((s) => s.articleViews)
  return useMemo(
    () =>
      ARTICLES.map((a) => ({
        ...a,
        helpful: a.helpful + (helpful[a.id] ?? 0),
        views: a.views + (views[a.id] ?? 0),
      })),
    [helpful, views],
  )
}

export function useArticle(id: string | undefined): Article | undefined {
  const articles = useArticles()
  return useMemo(() => articles.find((a) => a.id === id), [articles, id])
}

// Live workload counts per agent, derived from tickets.
export function useAgentWorkload() {
  const tickets = useTickets()
  return useMemo(() => {
    const open: Record<string, number> = {}
    const resolved: Record<string, number> = {}
    for (const t of tickets) {
      if (!t.assigneeId) continue
      if (t.status === 'resolved' || t.status === 'closed') {
        resolved[t.assigneeId] = (resolved[t.assigneeId] ?? 0) + 1
      } else {
        open[t.assigneeId] = (open[t.assigneeId] ?? 0) + 1
      }
    }
    return { open, resolved }
  }, [tickets])
}
