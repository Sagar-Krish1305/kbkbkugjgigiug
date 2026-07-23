import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEY, CURRENT_AGENT_ID } from './constants'
import { buildSeed } from './seed'
import { computeSlaDueAt } from './sla'
import type { Priority, Ticket, TicketEvent, TicketStatus, TicketType } from './types'

const seed = buildSeed()

function now(): string {
  return new Date().toISOString()
}

function nextRef(tickets: Ticket[], type: TicketType): string {
  const prefix = type === 'incident' ? 'INC' : 'REQ'
  const nums = tickets
    .filter((t) => t.ref.startsWith(prefix))
    .map((t) => Number(t.ref.split('-')[1]))
  const max = nums.length ? Math.max(...nums) : 1000
  return `${prefix}-${String(max + 1).padStart(4, '0')}`
}

export type NewTicketInput = {
  type: TicketType
  subject: string
  description: string
  priority: Priority
  category: string
  requesterId: string
  assigneeId: string | null
  serviceId: string | null
}

type DomainState = {
  tickets: Ticket[]
  events: TicketEvent[]
  articleHelpful: Record<string, number>
  articleViews: Record<string, number>
  createTicket: (input: NewTicketInput) => Ticket
  addNote: (ticketId: string, body: string) => void
  setStatus: (ticketId: string, status: TicketStatus) => void
  setPriority: (ticketId: string, priority: Priority) => void
  setAssignee: (ticketId: string, assigneeId: string | null) => void
  voteHelpful: (articleId: string) => void
  registerView: (articleId: string) => void
}

function pushEvent(
  events: TicketEvent[],
  ticketId: string,
  kind: TicketEvent['kind'],
  body: string,
): TicketEvent[] {
  const event: TicketEvent = {
    id: `evt-${ticketId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ticketId,
    kind,
    body,
    authorId: CURRENT_AGENT_ID,
    createdAt: now(),
  }
  return [...events, event]
}

export const useDomainStore = create<DomainState>()(
  persist(
    (set, get) => ({
      tickets: seed.tickets,
      events: seed.events,
      articleHelpful: {},
      articleViews: {},

      createTicket: (input) => {
        const createdAt = now()
        const ticket: Ticket = {
          id: `tkt-${Date.now()}`,
          ref: nextRef(get().tickets, input.type),
          type: input.type,
          subject: input.subject,
          description: input.description,
          status: 'open',
          priority: input.priority,
          category: input.category,
          requesterId: input.requesterId,
          assigneeId: input.assigneeId,
          serviceId: input.serviceId,
          createdAt,
          updatedAt: createdAt,
          slaDueAt: computeSlaDueAt(createdAt, input.priority),
          resolvedAt: null,
        }
        set((s) => ({
          tickets: [ticket, ...s.tickets],
          events: pushEvent(
            s.events,
            ticket.id,
            'created',
            `${input.type === 'incident' ? 'Incident' : 'Request'} created`,
          ),
        }))
        return ticket
      },

      addNote: (ticketId, body) =>
        set((s) => ({
          events: pushEvent(s.events, ticketId, 'note', body),
          tickets: s.tickets.map((t) => (t.id === ticketId ? { ...t, updatedAt: now() } : t)),
        })),

      setStatus: (ticketId, status) =>
        set((s) => {
          const resolvedNow = status === 'resolved' || status === 'closed'
          return {
            events: pushEvent(s.events, ticketId, 'status', `Status changed to ${status.replace('_', ' ')}`),
            tickets: s.tickets.map((t) =>
              t.id === ticketId
                ? {
                    ...t,
                    status,
                    updatedAt: now(),
                    resolvedAt: resolvedNow ? (t.resolvedAt ?? now()) : null,
                  }
                : t,
            ),
          }
        }),

      setPriority: (ticketId, priority) =>
        set((s) => ({
          events: pushEvent(s.events, ticketId, 'priority', `Priority changed to ${priority}`),
          tickets: s.tickets.map((t) =>
            t.id === ticketId
              ? { ...t, priority, updatedAt: now(), slaDueAt: computeSlaDueAt(t.createdAt, priority) }
              : t,
          ),
        })),

      setAssignee: (ticketId, assigneeId) =>
        set((s) => ({
          events: pushEvent(s.events, ticketId, 'assignment', assigneeId ? 'Ticket reassigned' : 'Ticket unassigned'),
          tickets: s.tickets.map((t) => (t.id === ticketId ? { ...t, assigneeId, updatedAt: now() } : t)),
        })),

      voteHelpful: (articleId) =>
        set((s) => ({
          articleHelpful: { ...s.articleHelpful, [articleId]: (s.articleHelpful[articleId] ?? 0) + 1 },
        })),

      registerView: (articleId) =>
        set((s) => ({
          articleViews: { ...s.articleViews, [articleId]: (s.articleViews[articleId] ?? 0) + 1 },
        })),
    }),
    { name: STORAGE_KEY },
  ),
)

// ---------- UI-only store (filters, dialogs, theme) ----------

export type StatusFilter = TicketStatus | 'all'
export type PriorityFilter = Priority | 'all'
export type TypeFilter = TicketType | 'all'

type CreateDialogSeed = { type: TicketType; category?: string; subject?: string; description?: string } | null

type UiState = {
  search: string
  statusFilter: StatusFilter
  priorityFilter: PriorityFilter
  typeFilter: TypeFilter
  assigneeFilter: string
  createOpen: boolean
  createSeed: CreateDialogSeed
  theme: 'dark' | 'light'
  setSearch: (v: string) => void
  setStatusFilter: (v: StatusFilter) => void
  setPriorityFilter: (v: PriorityFilter) => void
  setTypeFilter: (v: TypeFilter) => void
  setAssigneeFilter: (v: string) => void
  clearFilters: () => void
  openCreate: (seed?: CreateDialogSeed) => void
  closeCreate: () => void
  toggleTheme: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      search: '',
      statusFilter: 'all',
      priorityFilter: 'all',
      typeFilter: 'all',
      assigneeFilter: 'all',
      createOpen: false,
      createSeed: null,
      theme: 'dark',
      setSearch: (v) => set({ search: v }),
      setStatusFilter: (v) => set({ statusFilter: v }),
      setPriorityFilter: (v) => set({ priorityFilter: v }),
      setTypeFilter: (v) => set({ typeFilter: v }),
      setAssigneeFilter: (v) => set({ assigneeFilter: v }),
      clearFilters: () =>
        set({ search: '', statusFilter: 'all', priorityFilter: 'all', typeFilter: 'all', assigneeFilter: 'all' }),
      openCreate: (seed = null) => set({ createOpen: true, createSeed: seed }),
      closeCreate: () => set({ createOpen: false, createSeed: null }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
    }),
    { name: `${STORAGE_KEY}-ui`, partialize: (s) => ({ theme: s.theme }) },
  ),
)
