import { computeSlaDueAt } from './sla'
import type { Agent, Article, Requester, Service, Ticket, TicketEvent } from './types'

const H = 60 * 60 * 1000

function iso(hoursAgo: number): string {
  return new Date(Date.now() - hoursAgo * H).toISOString()
}

export const AGENTS: Agent[] = [
  { id: 'agent-1', name: 'Mara Whitfield', role: 'lead', email: 'mara@deskline.io', initials: 'MW' },
  { id: 'agent-2', name: 'Devon Cole', role: 'agent', email: 'devon@deskline.io', initials: 'DC' },
  { id: 'agent-3', name: 'Priya Nair', role: 'agent', email: 'priya@deskline.io', initials: 'PN' },
  { id: 'agent-4', name: 'Tomas Realmuto', role: 'agent', email: 'tomas@deskline.io', initials: 'TR' },
  { id: 'agent-5', name: 'Yuki Sato', role: 'agent', email: 'yuki@deskline.io', initials: 'YS' },
  { id: 'agent-6', name: 'Elena Brandt', role: 'admin', email: 'elena@deskline.io', initials: 'EB' },
  { id: 'agent-7', name: 'Omar Haddad', role: 'agent', email: 'omar@deskline.io', initials: 'OH' },
  { id: 'agent-8', name: 'Grace Lin', role: 'lead', email: 'grace@deskline.io', initials: 'GL' },
]

const DEPTS = ['Finance', 'Sales', 'Engineering', 'Marketing', 'Operations', 'HR', 'Legal', 'Support']

export const REQUESTERS: Requester[] = [
  'Alan Pierce', 'Bianca Rossi', 'Carl Underwood', 'Dana Kim', 'Ewan Cross',
  'Farah Aziz', 'Gordon Blake', 'Hannah Wu', 'Ivan Petrov', 'Julia Mendez',
  'Kevin Ortega', 'Lena Fischer', 'Marcus Dupont', 'Nina Kowalski', 'Oscar Reyes', 'Petra Novak',
].map((name, i) => {
  const [first, last] = name.split(' ')
  return {
    id: `req-${i + 1}`,
    name,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@company.com`,
    department: DEPTS[i % DEPTS.length],
  }
})

export const SERVICES: Service[] = [
  { id: 'svc-1', name: 'New Laptop Request', description: 'Request a standard-issue laptop for a new hire or replacement.', category: 'Hardware', fulfillmentHours: 48 },
  { id: 'svc-2', name: 'Monitor & Peripherals', description: 'External monitor, keyboard, mouse, and docking station.', category: 'Hardware', fulfillmentHours: 24 },
  { id: 'svc-3', name: 'Mobile Device Setup', description: 'Company phone provisioning with MDM enrollment.', category: 'Hardware', fulfillmentHours: 48 },
  { id: 'svc-4', name: 'VPN Access', description: 'Grant remote VPN access with multi-factor authentication.', category: 'Access', fulfillmentHours: 4 },
  { id: 'svc-5', name: 'Shared Drive Permissions', description: 'Add or modify access to a departmental shared drive.', category: 'Access', fulfillmentHours: 8 },
  { id: 'svc-6', name: 'Admin Rights Elevation', description: 'Temporary local admin rights for a specific machine.', category: 'Access', fulfillmentHours: 4 },
  { id: 'svc-7', name: 'Software License', description: 'Provision a licensed seat for approved productivity software.', category: 'Software', fulfillmentHours: 12 },
  { id: 'svc-8', name: 'Design Suite Install', description: 'Install and license the creative design toolset.', category: 'Software', fulfillmentHours: 24 },
  { id: 'svc-9', name: 'Password Reset', description: 'Reset a forgotten corporate account password.', category: 'Access', fulfillmentHours: 1 },
  { id: 'svc-10', name: 'New Hire Onboarding', description: 'Full IT setup for a new employee: accounts, hardware, access.', category: 'Onboarding', fulfillmentHours: 72 },
  { id: 'svc-11', name: 'Offboarding & Deprovision', description: 'Revoke access and reclaim hardware for a departing employee.', category: 'Onboarding', fulfillmentHours: 24 },
  { id: 'svc-12', name: 'Guest WiFi Access', description: 'Temporary guest network credentials for visitors.', category: 'Connectivity', fulfillmentHours: 2 },
  { id: 'svc-13', name: 'Meeting Room AV Support', description: 'Configure or troubleshoot conference room audio-visual gear.', category: 'Connectivity', fulfillmentHours: 8 },
]

export const ARTICLES: Article[] = [
  {
    id: 'kb-1', title: 'How to reset your corporate password', category: 'Access', updatedAt: iso(48), views: 1284, helpful: 312,
    summary: 'Step-by-step guide to resetting your password through the self-service portal.',
    body: 'If you have forgotten your password or it has expired, you can reset it yourself.\n\n1. Navigate to the self-service portal at portal.company.com.\n2. Select "Forgot password" beneath the sign-in form.\n3. Enter your corporate email address and complete the verification challenge.\n4. Follow the link sent to your recovery method and choose a new password.\n\nPasswords must be at least 12 characters and include a mix of letters, numbers, and symbols. If you do not receive the reset email within five minutes, check your spam folder or contact the service desk.',
  },
  {
    id: 'kb-2', title: 'Connecting to the VPN from home', category: 'Connectivity', updatedAt: iso(96), views: 962, helpful: 240,
    summary: 'Set up secure remote access using the company VPN client and MFA.',
    body: 'Remote access to internal systems requires the company VPN.\n\nBefore you begin, make sure the VPN client is installed from the software center and that multi-factor authentication is enrolled on your device.\n\nTo connect, open the client, select the nearest regional gateway, and sign in with your corporate credentials. Approve the push notification on your authenticator app. Once the status indicator turns green you are connected.\n\nIf the connection drops repeatedly, switch to a wired network where possible and confirm your client is on the latest version.',
  },
  {
    id: 'kb-3', title: 'Requesting new hardware', category: 'Hardware', updatedAt: iso(120), views: 640, helpful: 155,
    summary: 'How to request laptops, monitors, and peripherals through the catalog.',
    body: 'All hardware requests go through the service catalog so they can be tracked and approved.\n\nOpen the catalog, choose the item you need, and submit the request with your manager as approver. Standard laptops ship within two business days; specialised equipment may take longer.\n\nFor replacements of faulty equipment, raise an incident instead so the fault can be diagnosed first.',
  },
  {
    id: 'kb-4', title: 'Setting up email on your mobile device', category: 'Software', updatedAt: iso(30), views: 511, helpful: 130,
    summary: 'Configure corporate email and calendar on iOS and Android.',
    body: 'Corporate email is delivered through the managed mail app.\n\nInstall the app from your device app store, then sign in with your corporate address. You will be prompted to enrol your device in mobile device management, which is required for access to company data.\n\nOnce enrolment completes, your mail, calendar, and contacts sync automatically. Do not configure corporate mail in the native mail app, as this route is not supported.',
  },
  {
    id: 'kb-5', title: 'Troubleshooting a slow computer', category: 'Hardware', updatedAt: iso(200), views: 733, helpful: 190,
    summary: 'Common fixes for sluggish performance before raising a ticket.',
    body: 'A slow machine is often resolved with a few quick steps.\n\nFirst, restart the computer. Many performance issues clear after a fresh boot. Next, check available disk space and close applications you are not using. Confirm that pending updates have installed, as these frequently include performance fixes.\n\nIf the machine remains slow after these steps, raise an incident and include when the slowdown started and which applications are affected.',
  },
  {
    id: 'kb-6', title: 'Joining a video conference', category: 'Connectivity', updatedAt: iso(60), views: 402, helpful: 96,
    summary: 'Best practices for reliable audio and video in meetings.',
    body: 'For the smoothest experience, join from the desktop client rather than a browser.\n\nTest your microphone and camera from the settings menu before the meeting begins. Use a headset to reduce echo, and mute yourself when not speaking.\n\nIf your video is choppy, turn off your camera to prioritise audio bandwidth, or move closer to your wireless access point.',
  },
  {
    id: 'kb-7', title: 'Access request approvals explained', category: 'Access', updatedAt: iso(150), views: 288, helpful: 71,
    summary: 'Who approves access requests and how long they take.',
    body: 'Access to sensitive systems requires approval to satisfy security policy.\n\nWhen you submit an access request, it routes to the resource owner and your line manager. Both must approve before access is granted. Most approvals complete within one business day.\n\nYou can track approval status on the ticket. If a request is urgent, add a note explaining the business impact so approvers can prioritise it.',
  },
  {
    id: 'kb-8', title: 'What to do about phishing emails', category: 'Software', updatedAt: iso(18), views: 1520, helpful: 460,
    summary: 'How to recognise and report suspicious messages.',
    body: 'Phishing emails try to trick you into revealing credentials or clicking malicious links.\n\nBe suspicious of urgent requests, unexpected attachments, and sender addresses that do not quite match. Never enter your password into a link from an email.\n\nUse the "Report phishing" button in your mail client to send the message to the security team. If you have already clicked a link or entered credentials, change your password immediately and raise a high-priority incident.',
  },
  {
    id: 'kb-9', title: 'Printing and scanning basics', category: 'Hardware', updatedAt: iso(240), views: 220, helpful: 44,
    summary: 'Connect to office printers and use scan-to-email.',
    body: 'Office printers use secure release printing.\n\nSend your document to the shared print queue, then tap your badge at any printer to release it. This keeps documents private and reduces waste.\n\nTo scan, place your document in the feeder, choose scan-to-email at the panel, and confirm your address. Large scans are delivered as a compressed attachment.',
  },
  {
    id: 'kb-10', title: 'Onboarding checklist for new hires', category: 'Onboarding', updatedAt: iso(72), views: 356, helpful: 110,
    summary: 'Everything IT sets up in your first week.',
    body: 'Welcome to the company. Here is what IT prepares for you.\n\nOn day one you receive your laptop, corporate account, and email. Your manager requests any role-specific software and system access through the catalog. Multi-factor authentication is enrolled during your first sign-in.\n\nIf anything is missing after your first day, raise a service request and reference your start date so we can prioritise it.',
  },
  {
    id: 'kb-11', title: 'Using shared drives safely', category: 'Access', updatedAt: iso(310), views: 198, helpful: 39,
    summary: 'Guidelines for storing and sharing files on department drives.',
    body: 'Shared drives are for team files that need collaborative access.\n\nStore documents in the correct department folder and avoid keeping the only copy of critical files on your local machine. Do not store personal or highly sensitive data on general shared drives.\n\nIf you need a new folder or changed permissions, submit a shared drive permissions request through the catalog.',
  },
  {
    id: 'kb-12', title: 'Software installation policy', category: 'Software', updatedAt: iso(400), views: 174, helpful: 33,
    summary: 'Which software you can self-install and what needs approval.',
    body: 'Approved applications are available for self-service install from the software center with no ticket required.\n\nSoftware not in the catalog needs a license request and a security review before it can be installed, as unvetted software poses a risk to company data.\n\nNever install software from unofficial sources. If the tool you need is not available, raise a software license request describing your use case.',
  },
]

type Draft = {
  type: Ticket['type']
  subject: string
  description: string
  status: Ticket['status']
  priority: Ticket['priority']
  category: string
  reqIdx: number
  agentIdx: number | null
  createdHoursAgo: number
  resolvedHoursAgo?: number
  serviceId?: string
  events: { kind: TicketEvent['kind']; body: string; agentIdx: number; hoursAgo: number }[]
}

const DRAFTS: Draft[] = [
  { type: 'incident', subject: 'Email not syncing on mobile', description: 'Corporate mail stopped syncing on my phone after the latest update. No new messages arrive.', status: 'in_progress', priority: 'high', category: 'Software', reqIdx: 0, agentIdx: 1, createdHoursAgo: 3, events: [{ kind: 'note', body: 'Asked user to confirm MDM enrolment status.', agentIdx: 1, hoursAgo: 2 }] },
  { type: 'incident', subject: 'Laptop will not power on', description: 'Machine is completely unresponsive, no lights when plugged in.', status: 'open', priority: 'critical', category: 'Hardware', reqIdx: 1, agentIdx: null, createdHoursAgo: 1, events: [] },
  { type: 'request', subject: 'VPN access for remote work', description: 'Requesting VPN access to work from home two days a week.', status: 'pending', priority: 'medium', category: 'Access', reqIdx: 2, agentIdx: 2, createdHoursAgo: 20, serviceId: 'svc-4', events: [{ kind: 'note', body: 'Awaiting manager approval before provisioning.', agentIdx: 2, hoursAgo: 18 }] },
  { type: 'incident', subject: 'Cannot access shared finance drive', description: 'Permission denied error when opening the finance shared folder since this morning.', status: 'open', priority: 'high', category: 'Access', reqIdx: 3, agentIdx: 3, createdHoursAgo: 5, events: [] },
  { type: 'request', subject: 'New laptop for incoming analyst', description: 'Need a standard laptop provisioned before start date.', status: 'in_progress', priority: 'medium', category: 'Hardware', reqIdx: 4, agentIdx: 4, createdHoursAgo: 30, serviceId: 'svc-1', events: [{ kind: 'note', body: 'Device imaged, awaiting asset tagging.', agentIdx: 4, hoursAgo: 6 }] },
  { type: 'incident', subject: 'Wifi keeps dropping in meeting rooms', description: 'Connection drops every few minutes on the third floor meeting rooms.', status: 'open', priority: 'medium', category: 'Connectivity', reqIdx: 5, agentIdx: null, createdHoursAgo: 8, events: [] },
  { type: 'incident', subject: 'Suspicious phishing email received', description: 'Received an email asking me to verify my password urgently. Looks fake.', status: 'resolved', priority: 'high', category: 'Software', reqIdx: 6, agentIdx: 0, createdHoursAgo: 26, resolvedHoursAgo: 22, events: [{ kind: 'note', body: 'Confirmed phishing, blocked sender domain and reset user password.', agentIdx: 0, hoursAgo: 23 }] },
  { type: 'request', subject: 'Design software license', description: 'Requesting a seat for the creative design suite for a new project.', status: 'pending', priority: 'low', category: 'Software', reqIdx: 7, agentIdx: 5, createdHoursAgo: 50, serviceId: 'svc-8', events: [] },
  { type: 'incident', subject: 'Printer on 2nd floor jammed', description: 'The main printer repeatedly jams and shows an error code.', status: 'resolved', priority: 'low', category: 'Hardware', reqIdx: 8, agentIdx: 6, createdHoursAgo: 100, resolvedHoursAgo: 90, events: [{ kind: 'note', body: 'Cleared jam and replaced fuser roller.', agentIdx: 6, hoursAgo: 92 }] },
  { type: 'incident', subject: 'Application crashes on startup', description: 'The accounting application crashes immediately when launched after the update.', status: 'in_progress', priority: 'critical', category: 'Software', reqIdx: 9, agentIdx: 1, createdHoursAgo: 2, events: [{ kind: 'note', body: 'Reproduced crash, escalating to vendor support.', agentIdx: 1, hoursAgo: 1 }] },
  { type: 'request', subject: 'Admin rights for developer machine', description: 'Need temporary local admin to install development dependencies.', status: 'open', priority: 'medium', category: 'Access', reqIdx: 10, agentIdx: null, createdHoursAgo: 6, serviceId: 'svc-6', events: [] },
  { type: 'incident', subject: 'Monitor flickering', description: 'External monitor flickers intermittently, especially on video calls.', status: 'open', priority: 'low', category: 'Hardware', reqIdx: 11, agentIdx: 2, createdHoursAgo: 12, events: [] },
  { type: 'request', subject: 'Guest wifi for visiting client', description: 'Need guest network access for a client visiting tomorrow.', status: 'resolved', priority: 'low', category: 'Connectivity', reqIdx: 12, agentIdx: 3, createdHoursAgo: 40, resolvedHoursAgo: 38, serviceId: 'svc-12', events: [] },
  { type: 'incident', subject: 'Slow performance across the board', description: 'Computer has become very slow over the past week, tasks take minutes.', status: 'pending', priority: 'medium', category: 'Hardware', reqIdx: 13, agentIdx: 4, createdHoursAgo: 15, events: [{ kind: 'note', body: 'Ran diagnostics, disk nearly full. Advised cleanup.', agentIdx: 4, hoursAgo: 10 }] },
  { type: 'request', subject: 'Onboarding setup for new marketing hire', description: 'Full IT onboarding needed for new hire starting next week.', status: 'in_progress', priority: 'high', category: 'Onboarding', reqIdx: 14, agentIdx: 0, createdHoursAgo: 34, serviceId: 'svc-10', events: [{ kind: 'note', body: 'Accounts created, hardware in progress.', agentIdx: 0, hoursAgo: 20 }] },
  { type: 'incident', subject: 'Two-factor authentication locked out', description: 'Lost my phone and cannot complete MFA to sign in.', status: 'resolved', priority: 'critical', category: 'Access', reqIdx: 15, agentIdx: 7, createdHoursAgo: 28, resolvedHoursAgo: 27, events: [{ kind: 'note', body: 'Verified identity and reset MFA enrolment.', agentIdx: 7, hoursAgo: 27 }] },
  { type: 'incident', subject: 'Cannot connect to network printer', description: 'Printer no longer appears in my list of available devices.', status: 'open', priority: 'low', category: 'Connectivity', reqIdx: 0, agentIdx: null, createdHoursAgo: 9, events: [] },
  { type: 'request', subject: 'Additional monitor request', description: 'Requesting a second monitor for a dual-screen setup.', status: 'closed', priority: 'low', category: 'Hardware', reqIdx: 1, agentIdx: 6, createdHoursAgo: 200, resolvedHoursAgo: 180, serviceId: 'svc-2', events: [] },
  { type: 'incident', subject: 'Frequent disconnects from VPN', description: 'VPN drops every twenty minutes forcing me to reconnect.', status: 'in_progress', priority: 'high', category: 'Connectivity', reqIdx: 2, agentIdx: 5, createdHoursAgo: 4, events: [] },
  { type: 'request', subject: 'Password reset assistance', description: 'Locked out of my account after too many attempts.', status: 'resolved', priority: 'medium', category: 'Access', reqIdx: 3, agentIdx: 1, createdHoursAgo: 46, resolvedHoursAgo: 45, serviceId: 'svc-9', events: [] },
  { type: 'incident', subject: 'Blue screen errors on startup', description: 'Machine shows a blue screen error and restarts randomly.', status: 'open', priority: 'critical', category: 'Hardware', reqIdx: 4, agentIdx: null, createdHoursAgo: 1.5, events: [] },
  { type: 'request', subject: 'Mobile device provisioning', description: 'Requesting a company phone with MDM setup.', status: 'pending', priority: 'medium', category: 'Hardware', reqIdx: 5, agentIdx: 2, createdHoursAgo: 55, serviceId: 'svc-3', events: [] },
  { type: 'incident', subject: 'Email inbox full warning', description: 'Cannot receive new mail, mailbox reports it is full.', status: 'resolved', priority: 'medium', category: 'Software', reqIdx: 6, agentIdx: 3, createdHoursAgo: 70, resolvedHoursAgo: 66, events: [{ kind: 'note', body: 'Increased mailbox quota and archived old items.', agentIdx: 3, hoursAgo: 67 }] },
  { type: 'incident', subject: 'Video conference audio not working', description: 'No sound during meetings, microphone and speakers seem fine elsewhere.', status: 'open', priority: 'medium', category: 'Connectivity', reqIdx: 7, agentIdx: 4, createdHoursAgo: 7, events: [] },
  { type: 'request', subject: 'Shared drive access for new project', description: 'Need read-write access to the new project shared folder.', status: 'in_progress', priority: 'low', category: 'Access', reqIdx: 8, agentIdx: 7, createdHoursAgo: 22, serviceId: 'svc-5', events: [] },
  { type: 'incident', subject: 'Keyboard keys not responding', description: 'Several keys on my laptop keyboard have stopped working.', status: 'open', priority: 'medium', category: 'Hardware', reqIdx: 9, agentIdx: null, createdHoursAgo: 11, events: [] },
  { type: 'incident', subject: 'Website blocked by web filter', description: 'A vendor site I need for work is being blocked as unsafe.', status: 'pending', priority: 'low', category: 'Connectivity', reqIdx: 10, agentIdx: 5, createdHoursAgo: 33, events: [] },
  { type: 'request', subject: 'Offboarding departing employee', description: 'Revoke all access and reclaim hardware for employee leaving Friday.', status: 'open', priority: 'high', category: 'Onboarding', reqIdx: 11, agentIdx: 0, createdHoursAgo: 5, serviceId: 'svc-11', events: [] },
  { type: 'incident', subject: 'Docking station not detecting monitors', description: 'When docked, external monitors are not detected until several unplugs.', status: 'resolved', priority: 'medium', category: 'Hardware', reqIdx: 12, agentIdx: 6, createdHoursAgo: 120, resolvedHoursAgo: 110, events: [] },
  { type: 'incident', subject: 'Cannot install approved software', description: 'The software center fails with an error when I try to install an approved app.', status: 'in_progress', priority: 'medium', category: 'Software', reqIdx: 13, agentIdx: 2, createdHoursAgo: 6, events: [] },
  { type: 'incident', subject: 'Overheating laptop', description: 'Laptop runs very hot and the fan is constantly loud.', status: 'open', priority: 'low', category: 'Hardware', reqIdx: 14, agentIdx: null, createdHoursAgo: 14, events: [] },
]

function seq(type: Ticket['type'], n: number): string {
  const prefix = type === 'incident' ? 'INC' : 'REQ'
  return `${prefix}-${String(1000 + n).padStart(4, '0')}`
}

export function buildSeed(): { tickets: Ticket[]; events: TicketEvent[] } {
  const tickets: Ticket[] = []
  const events: TicketEvent[] = []
  let incN = 0
  let reqN = 0
  DRAFTS.forEach((d, i) => {
    const n = d.type === 'incident' ? ++incN : ++reqN
    const id = `tkt-${i + 1}`
    const createdAt = iso(d.createdHoursAgo)
    const assigneeId = d.agentIdx === null ? null : AGENTS[d.agentIdx].id
    const resolvedAt = d.resolvedHoursAgo !== undefined ? iso(d.resolvedHoursAgo) : null
    const lastEventHours = d.events.length ? Math.min(...d.events.map((e) => e.hoursAgo)) : d.createdHoursAgo
    tickets.push({
      id, ref: seq(d.type, n), type: d.type, subject: d.subject, description: d.description,
      status: d.status, priority: d.priority, category: d.category, requesterId: REQUESTERS[d.reqIdx].id,
      assigneeId, serviceId: d.serviceId ?? null, createdAt,
      updatedAt: iso(resolvedAt ? d.resolvedHoursAgo! : lastEventHours),
      slaDueAt: computeSlaDueAt(createdAt, d.priority), resolvedAt,
    })
    events.push({
      id: `evt-${id}-0`, ticketId: id, kind: 'created',
      body: `${d.type === 'incident' ? 'Incident' : 'Request'} created`,
      authorId: assigneeId ?? AGENTS[0].id, createdAt,
    })
    d.events.forEach((e, ei) => {
      events.push({ id: `evt-${id}-${ei + 1}`, ticketId: id, kind: e.kind, body: e.body, authorId: AGENTS[e.agentIdx].id, createdAt: iso(e.hoursAgo) })
    })
    if (resolvedAt) {
      events.push({ id: `evt-${id}-res`, ticketId: id, kind: 'status', body: 'Status changed to Resolved', authorId: assigneeId ?? AGENTS[0].id, createdAt: resolvedAt })
    }
  })
  return { tickets, events }
}
