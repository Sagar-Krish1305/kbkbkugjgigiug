import { PRIORITIES, ROLE_LABEL, SLA_POLICY } from '@/lib/constants'
import { useAgents, useAgentWorkload } from '@/data'
import { PageHeader } from '@/components/empty-state'
import { PriorityBadge } from '@/components/badges'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function targetLabel(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`
  return hours < 24 ? `${hours} hours` : `${Math.round(hours / 24)} days`
}

export default function Team() {
  const agents = useAgents()
  const { open, resolved } = useAgentWorkload()

  return (
    <div className="mx-auto max-w-[1100px] space-y-8">
      <div>
        <PageHeader title="Team & SLA" description="Desk workload and the policy targets that drive SLA timers." />
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Agent</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Open</TableHead>
                <TableHead className="text-right">Resolved</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8"><AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">{a.initials}</AvatarFallback></Avatar>
                      <div>
                        <div className="font-medium">{a.name}</div>
                        <div className="text-xs text-muted-foreground">{a.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{ROLE_LABEL[a.role]}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{open[a.id] ?? 0}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{resolved[a.id] ?? 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <section>
        <h2 className="mb-3 font-heading text-lg font-semibold">SLA policy</h2>
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Priority</TableHead>
                <TableHead>Response target</TableHead>
                <TableHead>Resolution target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PRIORITIES.map((p) => (
                <TableRow key={p}>
                  <TableCell><PriorityBadge priority={p} /></TableCell>
                  <TableCell className="text-sm">{targetLabel(SLA_POLICY[p].responseHours)}</TableCell>
                  <TableCell className="text-sm">{targetLabel(SLA_POLICY[p].resolutionHours)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Resolution targets set each ticket's SLA due time from the moment it is created.
        </p>
      </section>
    </div>
  )
}
