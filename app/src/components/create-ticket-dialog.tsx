import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PRIORITIES, PRIORITY_LABEL, CATEGORIES } from '@/lib/constants'
import { useDomainStore, useUiStore } from '@/lib/store'
import { useAgents, useRequesters } from '@/data'
import type { Priority, TicketType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const UNASSIGNED = 'unassigned'

export function CreateTicketDialog() {
  const open = useUiStore((s) => s.createOpen)
  const seed = useUiStore((s) => s.createSeed)
  const closeCreate = useUiStore((s) => s.closeCreate)
  const createTicket = useDomainStore((s) => s.createTicket)
  const agents = useAgents()
  const requesters = useRequesters()
  const navigate = useNavigate()

  const [type, setType] = useState<TicketType>('incident')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [requesterId, setRequesterId] = useState(requesters[0]?.id ?? '')
  const [assigneeId, setAssigneeId] = useState<string>(UNASSIGNED)
  const [subjectError, setSubjectError] = useState(false)

  // Apply prefill seed each time the dialog opens.
  useEffect(() => {
    if (!open) return
    setType(seed?.type ?? 'incident')
    setSubject(seed?.subject ?? '')
    setDescription(seed?.description ?? '')
    setPriority('medium')
    setCategory(seed?.category ?? CATEGORIES[0])
    setRequesterId(requesters[0]?.id ?? '')
    setAssigneeId(UNASSIGNED)
    setSubjectError(false)
  }, [open, seed, requesters])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim()) {
      setSubjectError(true)
      return
    }
    const ticket = createTicket({
      type,
      subject: subject.trim(),
      description: description.trim(),
      priority,
      category,
      requesterId,
      assigneeId: assigneeId === UNASSIGNED ? null : assigneeId,
      serviceId: null,
    })
    closeCreate()
    toast.success(`${ticket.ref} created`, { description: ticket.subject })
    navigate(`/tickets/${ticket.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? null : closeCreate())}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">New ticket</DialogTitle>
          <DialogDescription>
            Log an incident or raise a service request for the desk queue.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label>Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {(['incident', 'request'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={
                    'rounded-md border px-3 py-2 text-sm font-medium transition-colors ' +
                    (type === t
                      ? 'border-primary bg-primary/12 text-primary'
                      : 'border-border text-muted-foreground hover:bg-muted')
                  }
                >
                  {t === 'incident' ? 'Incident' : 'Service Request'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value)
                if (e.target.value.trim()) setSubjectError(false)
              }}
              placeholder="Short summary of the issue or request"
              aria-invalid={subjectError}
            />
            {subjectError && (
              <p className="text-xs text-destructive">A subject is required.</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any detail that will help the desk resolve this faster."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>{PRIORITY_LABEL[p]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Requester</Label>
              <Select value={requesterId} onValueChange={setRequesterId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {requesters.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="ghost" onClick={closeCreate}>Cancel</Button>
            <Button type="submit">Create ticket</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
