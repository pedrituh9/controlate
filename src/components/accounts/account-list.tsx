'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Plus } from 'lucide-react'
import type { Account } from '@/types'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AccountForm } from './account-form'

const typeLabels: Record<string, string> = {
  checking: 'Conta à ordem',
  savings: 'Poupança',
  credit_card: 'Cartão de crédito',
  other: 'Outro',
}

interface AccountListProps {
  accounts: Account[]
}

export function AccountList({ accounts }: AccountListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)

  async function handleDelete(id: string) {
    await supabase.from('accounts').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-muted-foreground">{accounts.length} conta(s)</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Nova conta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova conta</DialogTitle>
            </DialogHeader>
            <AccountForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Sem contas criadas. Cria a tua primeira conta!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id} className="flex flex-col">
              <CardContent className="flex items-center gap-3 p-4">
                <div
                  className="w-10 h-10 rounded-full shrink-0"
                  style={{ backgroundColor: account.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{account.name}</p>
                  <Badge variant="secondary" className="text-xs mt-0.5">
                    {typeLabels[account.type] ?? account.type}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => handleDelete(account.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
