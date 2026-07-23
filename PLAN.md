# PLAN — Deskline (ITSM)

## APP
- Name: Deskline
- An agent-facing IT Service Management console for a service desk team: triage a queue
  of incidents and service requests, work tickets with a full activity timeline, request
  services from a catalog, search a knowledge base, and monitor SLA compliance.
- Target users: IT support agents and service-desk leads.
- Primary device: desktop (dense operations console); layout stays responsive down to
  tablet/mobile (sidebar collapses, tables become stacked cards).

## FEATURES

1. **Ticket queue & filtering**
   Central table of all tickets (incidents + service requests) with columns: ref (e.g.
   `INC-1042` / `REQ-0231`), subject, type, priority, status, assignee, requester, SLA
   countdown, updated. Filter by status, priority, type, assignee, and a free-text search
   over ref/subject/requester. Sort by any column; default sort = SLA soonest-due first.
   Acceptance: selecting a filter narrows rows immediately; search matches ref + subject +
   requester name; clearing all filters restores the full list; a result count is shown
   ("42 tickets"); empty filter result shows a distinct "no tickets match" state.

2. **Ticket detail workspace**
   Open a ticket to a two-column workspace: left = subject, description, and a chronological
   **work-note timeline** (system events + agent notes); right = properties panel (status,
   priority, type, assignee, requester, category, created/updated, SLA due). Agents can
   change status, reassign, change priority, and post a work note. Every such action appends
   a timestamped entry to the timeline.
   Acceptance: posting a note (non-empty) prepends it to the timeline with author + relative
   time and clears the input; changing status/priority/assignee updates properties AND logs
   a system event to the timeline; a toast confirms each change; the SLA badge recomputes on
   priority change.

3. **Create ticket**
   "New ticket" dialog: type (Incident/Service Request), subject (required), description,
   priority, category, requester, assignee (optional → "Unassigned"). On submit it generates
   the next ref for the type, sets status=Open, computes SLA due from priority, timestamps
   created/updated, and prepends it to the queue.
   Acceptance: subject required (inline error if blank); ref auto-increments per type; new
   ticket appears at top of queue and is openable; toast confirms; dialog resets on close.

4. **Service catalog & request**
   Grid of requestable IT services grouped by category (e.g. Hardware, Access, Software,
   Onboarding). Each service card shows name, description, category, and typical fulfillment
   time. "Request" opens a prefilled Create-ticket flow (type=Service Request, category +
   subject seeded from the service).
   Acceptance: services grouped by category with counts; searching filters cards; requesting
   a service creates a REQ ticket linked back to the service name in its description; empty
   search shows a "no services found" state.

5. **Knowledge base**
   Searchable list of articles grouped by category, each with title, summary, category, last-
   updated, and view count. Clicking opens a reader view (title, meta, formatted body,
   "was this helpful?" affordance that increments a helpful count). Search filters by title +
   summary + body.
   Acceptance: search narrows the list live; article reader renders headings/paragraphs/lists;
   helpful vote increments and shows a thank-you; back returns to the list; no-match shows an
   empty state.

6. **Dashboard (shift overview)**
   KPI cards (open tickets, SLA at-risk, breached, resolved today), a "tickets by status"
   donut, a "queue by priority" bar chart, an SLA-compliance-over-time line chart (last 7
   days), and a recent-activity feed. All derived from live ticket data.
   Acceptance: KPIs recompute when tickets change; charts render from real seed data; clicking
   a KPI card deep-links to the queue with the matching filter applied; empty data shows a
   friendly zero-state per widget.

7. **Team & SLA reference**
   Agent roster (name, role, avatar initials, assigned open count, resolved count) and a
   read-only SLA policy table (priority → response + resolution targets).
   Acceptance: workload counts derive from live tickets; SLA table matches the policy used to
   compute ticket due dates.

8. **SLA engine (cross-cutting)**
   Each priority maps to a resolution target (Critical 4h, High 8h, Medium 24h, Low 72h). A
   ticket's SLA state derives from time-to-due: On track (>25% remaining), At risk (≤25%),
   Breached (past due), or Met (resolved before due). Surfaced as a colored countdown badge
   in the queue, detail, and dashboard.
   Acceptance: badge color + label match thresholds; resolved tickets show Met/Breached, not a
   live countdown.

## SCREENS
- **Login** — branded sign-in (auth = login; template `/login` route).
- **App shell** — left sidebar (Dashboard, Tickets, Catalog, Knowledge, Team), collapsible on
  mobile; top bar with global search, New-ticket button, theme toggle, current agent.
- **Dashboard** — KPI row, charts, recent activity. Empty state: "No tickets yet — create one."
- **Tickets (queue)** — filter bar + results table + count. Empty: "No tickets match filters";
  first-run empty: "Your queue is clear."
- **Ticket detail** — two-column workspace (timeline + properties). Loading: skeleton timeline.
- **Catalog** — search + category sections of service cards. Empty: "No services found."
- **Service request** — prefilled create dialog.
- **Knowledge base (list)** — search + category sections. Empty: "No articles match."
- **Article reader** — title, meta, body, helpful vote.
- **Team & SLA** — roster table + SLA policy table.
- Every data view handles loading (Skeleton) → error → empty → data.

## DATA MODEL & STATE
- **PERSISTENCE: local** — all data in the browser via localStorage (zustand-backed store).
  No backend objects. Seed data hydrates on first load.
- **AUTH: login** — the app has agent accounts, per-agent assignment, and roles, so it is
  private and the builder builds the template `/login` route + sign-in surface. (A demo
  agent identity is used for "current user" / note authorship.)

### Entities (localStorage shapes)
- **Ticket**: `id`, `ref` (INC-/REQ-####), `type` ('incident'|'request'), `subject`,
  `description`, `status` ('open'|'in_progress'|'pending'|'resolved'|'closed'),
  `priority` ('critical'|'high'|'medium'|'low'), `category`, `requesterId`, `assigneeId|null`,
  `serviceId|null`, `createdAt`, `updatedAt`, `slaDueAt`, `resolvedAt|null`.
- **TicketEvent**: `id`, `ticketId`, `kind` ('note'|'status'|'assignment'|'priority'|'created'),
  `body`, `authorId`, `createdAt`.
- **Agent**: `id`, `name`, `role` ('agent'|'lead'|'admin'), `email`, `initials`.
- **Requester**: `id`, `name`, `email`, `department`.
- **Service**: `id`, `name`, `description`, `category`, `fulfillmentHours`.
- **Article**: `id`, `title`, `summary`, `body`, `category`, `updatedAt`, `views`, `helpful`.
- **SlaPolicy** (constant): priority → `{ responseHours, resolutionHours }`.

### Seed data (realistic, plentiful)
- **28–35 tickets** spanning all statuses/priorities/types, assignees, and SLA states
  (some at-risk, some breached, some resolved-met), created across the last ~10 days with
  properly formatted timestamps. Each has 2–6 timeline events.
- **8 agents** (mix of agent/lead/admin), **16+ requesters** across departments.
- **12+ services** across Hardware, Access, Software, Onboarding, Connectivity.
- **12+ knowledge articles** across categories with real multi-paragraph bodies.
- Refs, dates, and SLA due times all internally consistent so charts/counters look alive.

### Client state (zustand, `src/lib/store.ts`)
- Persisted domain store (tickets, events, articles, votes, view counts) in localStorage.
- UI-only store: active filters, search text, selected ticket, dialog open state, theme.

## COMPONENTS (shadcn/ui → screens)
- **Table** + **Badge** + **DropdownMenu** → ticket queue, roster.
- **Dialog** → new ticket / service request; **Sheet** → mobile filters.
- **Tabs** → ticket detail (Timeline / Details on mobile), catalog category nav.
- **Card** → dashboard KPIs, service cards, article cards.
- **Select**, **Input**, **Textarea**, **Label**, **Button** → forms & filters.
- **Avatar** → agents/requesters. **Skeleton** → loading. **Separator**, **ScrollArea** → timeline.
- **Command** → global search. **Sonner (toast)** → action confirmations. **Tooltip** → SLA badges.
- **recharts** (donut/bar/line via `var(--chart-1..5)`) → dashboard.

## DESIGN SYSTEM

### Design spec
- **Color mode: dark.** Scene: a service-desk agent on a late shift in a dim, dual-monitor
  NOC-style room, triaging a live queue for hours — a dark canvas cuts eye strain and lets
  status/SLA colors pop so the queue reads at a glance. Light mode ships too (toggle).
- **Color strategy: restrained.** Tinted near-neutral canvas + a cobalt primary reserved for
  actions/selection/links, with color otherwise carrying *status* meaning (SLA, priority,
  ticket status). Data is the star; the accent works because it's rare.
- **Brand hue: cobalt/indigo, ~260°.** Neutrals tinted 0.008–0.02 chroma toward 260.
- **Palette (dark, primary set):**
  - background `oklch(0.16 0.018 260)`, foreground `oklch(0.95 0.006 260)`
  - card/popover `oklch(0.20 0.02 260)`, card-foreground `oklch(0.95 0.006 260)`
  - primary `oklch(0.60 0.16 260)` (cobalt), primary-foreground `oklch(0.98 0.01 260)`
  - secondary `oklch(0.26 0.02 260)`, muted `oklch(0.24 0.018 260)`,
    muted-foreground `oklch(0.72 0.015 260)`
  - accent (amber, warmth + hue separation for pending/at-risk) `oklch(0.74 0.14 68)`
  - border/input `oklch(0.28 0.02 260)`, ring `oklch(0.60 0.16 260)`
  - destructive `oklch(0.62 0.21 25)`
- **Palette (light):** background `oklch(1 0 0)` (pure white), foreground `oklch(0.24 0.02 260)`,
  card `oklch(0.99 0.004 260)`, primary `oklch(0.50 0.17 260)`, accent `oklch(0.70 0.15 68)`,
  neutrals near-achromatic tinted toward 260, border `oklch(0.90 0.01 260)`.
- **Semantic colors (mapped to statuses):**
  - Open = info blue `oklch(0.62 0.13 250)`; In Progress = cobalt primary;
    Pending = amber accent `oklch(0.74 0.14 68)`; Resolved/Closed = green `oklch(0.70 0.15 155)`;
    Critical priority / Breached SLA = red `oklch(0.62 0.21 25)`.
  - SLA badges: On track = green, At risk = amber, Breached = red, Met = muted green.
- **Contrast (WCAG AA):** dark foreground `0.95L` on `0.16L` bg ≈ 12:1; muted-foreground `0.72L`
  ≥ 4.5:1 on bg and card. White (`primary-foreground`) text on cobalt/amber/red/green fills —
  saturated mid-luminance fills use white text per H-K effect. No gray text on colored fills.
- **Font:** heading = **Archivo** (confident, faintly industrial grotesque — procedural, dependable
  ops authority); body = **Hanken Grotesk** (humanist sans, superb legibility in dense tables).
  Paired on the grotesque-vs-humanist contrast axis. No Inter/Roboto/IBM Plex; no mono display.
- **Layout:** left sidebar nav + top bar; dense content zones (tables, panels). Sidebar collapses
  to icons/drawer on mobile; tables reflow to stacked cards. Dark mode via `.dark` token swap only.
- **Corner radius: 0.375rem.** Crisp and slightly soft — a dependable operations tool, neither
  fully angular/editorial nor playful/rounded. Committed on purpose, not the template default.

Avoids AI tells: no purple gradients, no cream/beige body bg, no gradient text, no side-stripe
borders; charts use a deliberate multi-hue ramp (cobalt/teal/amber/rose/green), not one-hue tints.

### theme.json
Written at workspace root; both light and dark token sets, radius `0.375rem`, fonts Archivo +
Hanken Grotesk via Google Fonts.

## NOTES
- Resolved defaults (user answered "no preference"): agent-facing service desk; v1 includes
  tickets, catalog, knowledge base, and SLA dashboard; change management and CMDB deferred as
  non-goals; local persistence.
- Non-goals v1: end-user self-service portal, change/approval workflows, asset/CMDB inventory,
  email ingestion, real multi-user auth (single demo agent identity).
- "Current agent" is a fixed demo identity used for note authorship and workload attribution.
- Preserved domain vocabulary: ticket, incident, service request, SLA, catalog, knowledge base.
